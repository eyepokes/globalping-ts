import {Globalping} from "globalping-ts";

(async () => {
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
})();
