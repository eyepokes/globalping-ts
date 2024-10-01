import { afterEach, beforeEach, it } from 'mocha';
import { Globalping } from '../src';
import { MeasurementRequestBody } from '../src';
import { MeasurementPostResponseBody } from '../dist';
import { sleep } from '../dist/utils';

describe('Globalping', () => {
    afterEach(function () {});

    beforeEach(() => {});

    it('postMeasurement(): ping: specific locations', async () => {
        const requestBody = {
            type: 'ping',
            target: 'cdn.jsdelivr.net',
            locations: [
                {
                    country: 'DE',
                },
                {
                    country: 'PL',
                },
            ],
        };

        const api = new Globalping();

        let response = await api.postMeasurement(requestBody);

        if (!response.success) {
            console.log(JSON.stringify(response.error, null, 4));
            return;
        }

        console.log(JSON.stringify(response.data, null, 4));
    }).timeout(0);

    it('postMeasurement(): ping: specific locations and limit', async () => {
        const requestBody = {
            type: 'ping',
            target: 'cdn.jsdelivr.net',
            locations: [
                {
                    country: 'DE',
                    limit: 4,
                },
                {
                    country: 'PL',
                    limit: 2,
                },
            ],
        };

        const api = new Globalping();

        let response = await api.postMeasurement(requestBody);

        if (!response.success) {
            console.log(JSON.stringify(response.error, null, 4));
            return;
        }

        console.log(JSON.stringify(response.data, null, 4));
    }).timeout(0);

    it('getMeasurement()', async () => {
        const api = new Globalping();

        let response = await api.getMeasurement('vSS6vepg04STxzGB');

        if (!response.success) {
            console.log(JSON.stringify(response.error, null, 4));
            return;
        }

        console.log(JSON.stringify(response.data, null, 4));
    }).timeout(0);

    it('probes()', async () => {
        const api = new Globalping();

        let response = await api.probes();

        if (!response.success) {
            console.log(JSON.stringify(response.error, null, 4));
            return;
        }

        console.log(JSON.stringify(response.data, null, 4));
    }).timeout(0);

    it('limits()', async () => {
        const api = new Globalping();

        let response = await api.limits();

        if (!response.success) {
            console.log(JSON.stringify(response.error, null, 4));
            return;
        }

        console.log(JSON.stringify(response.data, null, 4));
    }).timeout(0);

    it('postMeasurement(): ping: specific locations with types casted', async () => {
        const requestBody: MeasurementRequestBody = {
            type: 'ping',
            target: 'cdn.jsdelivr.net',
            locations: [
                {
                    country: 'DE1',
                },
                {
                    country: 'PL',
                },
            ],
        };

        const api = new Globalping();

        let response = await api.postMeasurement(requestBody);
        if (!response.success) {
            console.log(JSON.stringify(response.error, null, 4));
            return;
        }

        console.log(JSON.stringify(response.data, null, 4));
    }).timeout(0);

    it('postMeasurement(): ping: specific locations and getMeasurement()', async () => {
        const requestBody = {
            type: 'ping',
            target: 'cdn.jsdelivr.net',
            locations: [
                {
                    country: 'DE',
                },
                {
                    country: 'PL',
                },
            ],
        };

        const api = new Globalping();

        let response = await api.postMeasurement(requestBody);

        if (!response.success) {
            console.log(JSON.stringify(response.error, null, 4));
            return;
        }

        const { id, probesCount } = response.data;
        console.log(id, probesCount);

        let attempts = 5;
        while (attempts > 0) {
            console.log(`Current attempt: ${attempts} out of 5`);
            attempts--;
            let response = await api.getMeasurement(id);
            if (!response.success) {
                console.log(JSON.stringify(response.error, null, 4));
                return;
            }

            if (response.data.status === 'in-progress') {
                await sleep(0.5);
                continue;
            }

            console.log(JSON.stringify(response.data, null, 4));
            break;
        }
    }).timeout(0);

    it('postMeasurement(): ping: specific locations send 3 times in row', async () => {
        const requestBody = {
            type: 'ping',
            target: 'cdn.jsdelivr.net',
            locations: [
                {
                    country: 'DE',
                },
                {
                    country: 'PL',
                },
            ],
        };

        const api = new Globalping({ debug: true });

        for (let i = 0; i < 3; i++) {
            let response = await api.postMeasurement(requestBody);

            if (!response.success) {
                console.log(JSON.stringify(response.error, null, 4));
                return;
            }

            console.log(JSON.stringify(response, null, 4));
            await sleep(1);
        }
    }).timeout(0);

    it('getMeasurement() 3 times', async () => {
        const api = new Globalping({ debug: true, disableEtagCaching: false });
        for (let i = 0; i < 3; i++) {
            let response = await api.getMeasurement('l08wEGyKOV1NcZVL');
            /*if(response.success) {
                console.log(response.data);
            }*/
            console.log(JSON.stringify({ status: response.status, headers: response.headers }, null, 4));
        }
    }).timeout(0);

    it('probes() 3 times', async () => {
        const api = new Globalping({ debug: true });
        for (let i = 0; i < 3; i++) {
            let response = await api.probes();

            console.log(JSON.stringify(response.headers, null, 4));
        }
    }).timeout(0);

    it('limits() 3 times', async () => {
        const api = new Globalping({ debug: true });
        for (let i = 0; i < 3; i++) {
            let response = await api.limits();

            console.log(JSON.stringify(response.headers, null, 4));
        }
    }).timeout(0);
});
