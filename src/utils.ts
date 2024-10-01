import { RequestMethod } from './types';
import axios, { AxiosRequestConfig } from 'axios';

export async function request(
    method: RequestMethod,
    url: string,
    headers: { [K: string]: string },
    data: string | false = false,
    debug: boolean = false,
    retry: boolean = true,
): Promise<any> {
    if (debug) {
        console.log(`utils :: request() :: ${method} ${url}, ${retry}`);
    }

    let requestOptions: AxiosRequestConfig = {
        method,
        url,
        headers,
        validateStatus: () => true,
        ...(data && { data }),
        maxRedirects: 0,
    };

    if (debug) {
        console.log(`utils :: request() :: requestOptions${JSON.stringify(requestOptions, null, 4)}`);
    }

    return await axios.request(requestOptions).catch(async (error) => {
        if (debug) {
            console.log(`utils :: request() :: ${method} ${url}, ${retry} - ${error.message}`);
        }
        if (retry) {
            await sleep(1);
            return await request(method, url, headers, data, debug, false);
        }
        throw new Error(error);
    });
}

export async function sleep(seconds: number) {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

export function parseETag(etag: string | undefined): string {
    if (!etag) return '';

    // Remove quotes if present
    return etag.replace(/^W\//, '').replace(/^"(.*)"$/, '$1');
}
