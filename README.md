# Globalping API Library

[![NPM version](https://img.shields.io/npm/v/globalping-ts.svg)](https://npmjs.org/package/globalping-ts) ![npm bundle size](https://img.shields.io/bundlephobia/minzip/globalping-ts)

This library provides access to the Globalping API from TypeScript or JavaScript.
To learn how to use the Globalping API, check out [API Reference](https://www.jsdelivr.com/docs/api.globalping.io) and [Documentation](https://github.com/jsdelivr/globalping).

## Installation

```sh
npm install globalping-ts
```

## Usage
```js
import { Globalping } from 'globalping-ts';
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
```
## Requirements

TypeScript >= 4.5 is supported.

The following runtimes are supported:

- Node.js 18 LTS or later ([non-EOL](https://endoflife.date/nodejs)) versions.
