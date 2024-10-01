import assert from 'assert';
import sinon from 'sinon';
import { Globalping } from '../src';
import * as utils from '../src/utils';

describe('Globalping class', () => {
    let globalping: Globalping;
    let requestStub: sinon.SinonStub;

    beforeEach(() => {
        globalping = new Globalping();
        requestStub = sinon.stub(utils, 'request');
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('postMeasurement', () => {
        it('should create a new measurement successfully', async () => {
            const mockResponse = {
                status: 202,
                data: { id: 'test-measurement-id' },
                headers: { location: 'https://api.globalping.io/v1/measurements/test-measurement-id' },
            };
            requestStub.resolves(mockResponse);

            const requestBody = {
                type: 'ping',
                target: 'example.com',
                locations: [{ country: 'US' }],
            };

            const result = await globalping.postMeasurement(requestBody);

            assert.strictEqual(result.success, true);
            assert.strictEqual(result.status, 202);
            assert.deepStrictEqual(result.data, { id: 'test-measurement-id' });
            assert.deepStrictEqual(result.headers, {
                location: 'https://api.globalping.io/v1/measurements/test-measurement-id',
            });
            //assert.strictEqual(result.error, undefined);
        });

        it('should handle validation error when request body is missing', async () => {
            const result = await globalping.postMeasurement(undefined as any);

            assert.strictEqual(result.success, false);
            assert.strictEqual(result.status, 400);
            //assert.strictEqual(result.data, undefined);
            assert.deepStrictEqual(result.error, {
                type: 'validation_error',
                message: 'Request body is missing.',
            });
        });
    });

    describe('getMeasurement', () => {
        it('should retrieve an existing measurement successfully', async () => {
            const mockResponse = {
                status: 200,
                data: {
                    id: 'test-measurement-id',
                    status: 'finished',
                    results: [],
                },
                headers: {},
            };
            requestStub.resolves(mockResponse);

            const result = await globalping.getMeasurement('test-measurement-id');

            assert.strictEqual(result.success, true);
            assert.strictEqual(result.status, 200);
            assert.deepStrictEqual(result.data, {
                id: 'test-measurement-id',
                status: 'finished',
                results: [],
            });
            //assert.strictEqual(result.error, null);
        });

        it('should handle error when measurement id is missing', async () => {
            const result = await globalping.getMeasurement('');

            assert.strictEqual(result.success, false);
            assert.strictEqual(result.status, 400);
            //assert.strictEqual(result.data, null);
            assert.deepStrictEqual(result.error, {
                type: 'validation_error',
                message: 'Id is missing.',
            });
        });

        it('should retrieve an existing measurement successfully', async () => {
            const mockResponse = {
                status: 200,
                data: {
                    id: 'test-measurement-id',
                    status: 'finished',
                    results: [],
                },
                headers: {},
            };
            requestStub.resolves(mockResponse);

            const result = await globalping.getMeasurement('test-measurement-id');

            assert.strictEqual(result.success, true);
            assert.strictEqual(result.status, 200);
            assert.deepStrictEqual(result.data, {
                id: 'test-measurement-id',
                status: 'finished',
                results: [],
            });
            //assert.strictEqual(result.error, null);
        });
    });

    describe('probes', () => {
        it('should retrieve the list of probes successfully', async () => {
            const mockResponse = {
                status: 200,
                data: {
                    probes: [
                        { location: 'US', tags: ['datacenter'] },
                        { location: 'UK', tags: ['residential'] },
                    ],
                },
                headers: {},
            };
            requestStub.resolves(mockResponse);

            const result = await globalping.probes();

            assert.strictEqual(result.success, true);
            assert.strictEqual(result.status, 200);
            assert.deepStrictEqual(result.data, {
                probes: [
                    { location: 'US', tags: ['datacenter'] },
                    { location: 'UK', tags: ['residential'] },
                ],
            });
            //assert.strictEqual(result.error, null);
        });
    });

    describe('limits', () => {
        it('should retrieve the rate limits successfully', async () => {
            const mockResponse = {
                status: 200,
                data: {
                    measurement: {
                        limit: 100,
                        remaining: 95,
                        reset: 3600,
                    },
                },
                headers: {},
            };
            requestStub.resolves(mockResponse);

            const result = await globalping.limits();

            assert.strictEqual(result.success, true);
            assert.strictEqual(result.status, 200);
            assert.deepStrictEqual(result.data, {
                measurement: {
                    limit: 100,
                    remaining: 95,
                    reset: 3600,
                },
            });
            //assert.strictEqual(result.error, null);
        });
    });
});
