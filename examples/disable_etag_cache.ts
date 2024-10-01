import {Globalping} from "globalping-ts";

(async () => {
    const api = new Globalping({
        disableEtagCaching: true, // enable ETag/If-none-Match caching, false by default
        maxCacheSize: 200 // increase or decrease the max number(200 by default) of responses to be stored in the memory
    });

    let response = await api.getMeasurement('vSS6vepg04STxzGB');

    if (!response.success) {
        console.log(JSON.stringify(response.error, null, 4));
        return;
    }

    console.log(JSON.stringify(response.data, null, 4));

    // the response below will be returned from the memory
    let anotherResponse = await api.getMeasurement('vSS6vepg04STxzGB');

    if (!anotherResponse.success) {
        console.log(JSON.stringify(anotherResponse.error, null, 4));
        return;
    }

    console.log(JSON.stringify(anotherResponse.data, null, 4));
})();
