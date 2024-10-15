import {
    ApiResponse,
    CacheEntry,
    ErrorEvent,
    Failure,
    GlobalpingOptions,
    LimitsGetResponse,
    MeasurementGetResponseBody,
    MeasurementPostResponseBody,
    MeasurementRequestBody,
    ProbeGetResponse,
    Success,
} from './types';
import { request } from './utils';
import { Cache } from './cache';

export class Globalping {
    private host = 'api.globalping.io';
    private apiVersion = 1;
    private requestHeaders: { [K: string]: string }  = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Accept-Encoding': 'br, gzip',
        'User-Agent': 'globalping-ts',
    };
    private maxCacheSize: number = 200;
    private apiToken: string | undefined;
    private cache: Cache;
    private debug: boolean = false;
    private disableEtagCaching: boolean = false;

    constructor(options: GlobalpingOptions | undefined = undefined) {
        if (options) {
            if (options.token !== undefined) {
                this.apiToken = options.token;
                this.requestHeaders["Authorization"] = `Bearer ${this.apiToken}`;
            }

            if (options.maxCacheSize !== undefined) {
                this.maxCacheSize = options.maxCacheSize;
            }

            if (options.debug !== undefined) {
                this.debug = options.debug;
            }

            if (options.disableEtagCaching !== undefined) {
                this.disableEtagCaching = options.disableEtagCaching;
            }
        }

        this.cache = new Cache(this.maxCacheSize);
    }

    /**
     * **POST** /v1/measurements
     * -
     * Creates a new measurement with parameters set in the request body. The measurement runs asynchronously and you can retrieve its current state at the URL returned in the Location header.
     * -
     * Client guidelines
     * - If the application is running in interactive mode, set the **inProgressUpdates** option to **true** to have the API return partial results as soon as they are available. This allows the user to see the measurement progress in real time.
     * - If the application is interactive by default but also implements a "CI" mode for scripting, do not set the flag in the CI mode.
     * - To perform multiple measurements using exactly the same probes, create a single measurement first, then pass its **id** in the **locations** field for the other measurements.
     * */
    async postMeasurement<R, E>(
        requestBody: MeasurementRequestBody,
    ): Promise<ApiResponse<MeasurementPostResponseBody, ErrorEvent>> {
        if (!requestBody) {
            return {
                success: false,
                error: {
                    type: 'validation_error',
                    message: 'Request body is missing.',
                },
                headers: {},
                status: 400,
            };
        }
        const endpoint = `https://${this.host}/v${this.apiVersion}/measurements`;

        let response = await request(
            'POST',
            endpoint,
            this.requestHeaders,
            JSON.stringify(requestBody),
            this.debug,
        );

        if (response.status === 202) {
            return {
                success: true,
                data: response.data,
                headers: response.headers,
                status: response.status,
            };
        }

        return this.failure(false, response);
    }

    /**
     * **GET** /v1/measurements/{id}
     * -
     * Returns the status and results of an existing measurement. Measurements are typically available for up to 7 days after creation.
     * -
     * Tip: A link to this endpoint is returned in the **Location** response header when creating the measurement.
     * -
     * Client guidelines
     * -
     * As it can take a few seconds for a measurement to complete, you should use the following process for retrieving the results:

     * - Request the measurement to retrieve its status.
     * - If the status is **in-progress**, wait 500 milliseconds and start again at step 1. Note that it's important to wait 500 ms after receiving the response rather than using an "every 500ms" interval as for large measurements, the request itself may take a few hundred milliseconds to complete.
     * - If the status is anything other than **in-progress**, stop. The measurement is no longer running, and its results are final.
     * */
    async getMeasurement<R, E>(id: string): Promise<ApiResponse<MeasurementGetResponseBody, ErrorEvent>> {
        if (!id) {
            return {
                success: false,
                error: {
                    type: 'validation_error',
                    message: 'Id is missing.',
                },
                headers: {},
                status: 400,
            };
        }

        const endpoint = `https://${this.host}/v${this.apiVersion}/measurements/${id}`;

        let cacheKey = '';
        let cachedEntry;

        if (!this.disableEtagCaching) {
            cacheKey = this.cache.generateCacheKey(endpoint, {});
            cachedEntry = this.cache.get(cacheKey);
        }

        let response = await request(
            'GET',
            `https://${this.host}/v${this.apiVersion}/measurements/${id}`,
            !this.disableEtagCaching ?
                { ...this.requestHeaders, ...(cachedEntry ? { 'if-none-match': cachedEntry.etag } : {}) }
            :   this.requestHeaders,
            false,
            this.debug,
        );

        if (!this.disableEtagCaching) {
            if (cachedEntry && response.status === 304) {
                this.cache.updateCacheEntryTimestamp(cacheKey);
                if (cachedEntry.etag === response.headers.etag) {
                    if (this.debug) {
                        console.log(`getMeasurement(${id}) :: cached response received`);
                    }
                    return cachedEntry.data;
                }
            }
        }

        if (response.status === 200) {
            const data: Success<MeasurementGetResponseBody> = {
                success: true,
                data: response.data,
                headers: response.headers,
                status: response.status,
            };

            if (!this.disableEtagCaching) {
                const newEntry: CacheEntry = {
                    etag: response.headers.etag,
                    data,
                    timestamp: Date.now(),
                };

                this.cache.addToCache(cacheKey, newEntry);
            }

            return data;
        }

        return this.failure(true, response, cachedEntry, cacheKey);
    }

    /**
     * **GET** /v1/probes
     * -
     * Returns a list of all probes currently online and their metadata, such as location and assigned tags.
     * -
     * Note: Probes don't expose unique IDs that would allow you to explicitly select them. Instead, specify the requested location or an ID of an existing measurement when creating new measurements.
     * */
    async probes<R, E>(): Promise<ApiResponse<ProbeGetResponse, ErrorEvent>> {
        const endpoint = `https://${this.host}/v${this.apiVersion}/probes`;

        let cacheKey = '';
        let cachedEntry;

        if (!this.disableEtagCaching) {
            cacheKey = this.cache.generateCacheKey(endpoint, {});
            cachedEntry = this.cache.get(cacheKey);
        }

        let response = await request(
            'GET',
            `https://${this.host}/v${this.apiVersion}/probes`,
            !this.disableEtagCaching ?
                { ...this.requestHeaders, ...(cachedEntry ? { 'if-none-match': cachedEntry.etag } : {}) }
            :   this.requestHeaders,
            false,
            this.debug,
        );

        if (!this.disableEtagCaching) {
            if (cachedEntry) {
                this.cache.updateCacheEntryTimestamp(cacheKey);
                if (cachedEntry.etag === response.headers.etag) {
                    if (this.debug) {
                        console.log(`probes() :: cached response received`);
                    }
                    return cachedEntry.data;
                }
            }
        }

        if (response.status === 200) {
            const data: Success<ProbeGetResponse> = {
                success: true,
                data: response.data,
                headers: response.headers,
                status: response.status,
            };

            if (!this.disableEtagCaching) {
                if (cachedEntry) {
                    const newEntry: CacheEntry = {
                        etag: response.headers.etag,
                        data,
                        timestamp: Date.now(),
                    };

                    this.cache.addToCache(cacheKey, newEntry);
                }
            }

            return data;
        }

        return this.failure(true, response, cachedEntry, cacheKey);
    }

    /**
     * **GET** /v1/limits
     * -
     * Returns rate limits for the current user (if authenticated) or IP address (if not authenticated).
     * -
     * */
    async limits<R, E>(): Promise<ApiResponse<LimitsGetResponse, ErrorEvent>> {
        const endpoint = `https://${this.host}/v${this.apiVersion}/limits`;

        let cacheKey = '';
        let cachedEntry;

        if (!this.disableEtagCaching) {
            cacheKey = this.cache.generateCacheKey(endpoint, {});
            cachedEntry = this.cache.get(cacheKey);
        }

        let response = await request(
            'GET',
            `https://${this.host}/v${this.apiVersion}/limits`,
            { ...this.requestHeaders, ...(cachedEntry ? { 'if-none-match': cachedEntry.etag } : {}) },
            false,
            this.debug,
        );

        if (!this.disableEtagCaching) {
            if (cachedEntry) {
                this.cache.updateCacheEntryTimestamp(cacheKey);
                if (cachedEntry.etag === response.headers.etag) {
                    if (this.debug) {
                        console.log(`limits() :: cached response received`);
                    }
                    return cachedEntry.data;
                }
            }
        }

        if (response.status === 200) {
            const data: Success<LimitsGetResponse> = {
                success: true,
                data: response.data,
                headers: response.headers,
                status: response.status,
            };

            if (!this.disableEtagCaching) {
                if (cachedEntry) {
                    const newEntry: CacheEntry = {
                        etag: response.headers.etag,
                        data,
                        timestamp: Date.now(),
                    };

                    this.cache.addToCache(cacheKey, newEntry);
                }
            }

            return data;
        }

        return this.failure(true, response, cachedEntry, cacheKey);
    }

    private failure(
        shouldBeCached = false,
        response: any,
        cachedEntry: any = undefined,
        cacheKey: any = undefined,
    ) {
        const data: Failure<ErrorEvent> = {
            success: false,
            error: response.data.error ?? response.statusText,
            headers: response.headers,
            status: response.status,
        };

        if (!shouldBeCached) {
            return data;
        }

        if (!this.disableEtagCaching) {
            const newEntry: CacheEntry = {
                etag: response.headers.etag,
                data,
                timestamp: Date.now(),
            };

            this.cache.addToCache(cacheKey, newEntry);
        }

        return data;
    }
}
