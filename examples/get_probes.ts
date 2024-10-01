import {Globalping} from "globalping-ts";

(async () => {
    const api = new Globalping();

    let response = await api.probes();

    if (!response.success) {
        console.log(JSON.stringify(response.error, null, 4));
        return;
    }

    console.log(JSON.stringify(response.data, null, 4));
})();