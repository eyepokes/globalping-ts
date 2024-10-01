import {Globalping} from "globalping-ts";

(async () => {
    async function sleep(seconds: number) {
        return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
    }

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
})();
