# Globalping API Library

[![NPM version](https://img.shields.io/npm/v/globalping-ts.svg)](https://npmjs.org/package/globalping-ts) ![npm bundle size](https://img.shields.io/bundlephobia/minzip/globalping-ts)

This library provides access to the Globalping API from TypeScript or JavaScript.
To learn how to use the Globalping API, check out [API Reference](https://globalping.io/docs/api.globalping.io#overview) and [Documentation](https://github.com/jsdelivr/globalping).

## Installation

```sh
npm install globalping-ts
```

## Usage

The Globalping class provides an easy way to interact with the Globalping API. Here's how to use it:

### Initialization

First, import and initialize the Globalping class:

```javascript
import { Globalping } from 'globalping-ts';

const globalping = new Globalping({
    token: 'your-api-token', // Optional
    maxCacheSize: 200, // Optional, default is 200
    debug: false, // Optional, default is false
    disableEtagCaching: false // Optional, default is false
});
```

### Creating a Measurement

To create a new measurement:

```javascript
const measurementBody = {
    type: 'ping',
    target: 'example.com',
    locations: [
        { country: 'US' },
        { continent: 'EU' }
    ]
};

const result = await globalping.postMeasurement(measurementBody);

if (result.success) {
    console.log('Measurement created:', result.data);
} else {
    console.error('Error creating measurement:', result.error);
}
```

### Retrieving a Measurement

To retrieve the results of a measurement:

```javascript
const measurementId = 'your-measurement-id';
const result = await globalping.getMeasurement(measurementId);

if (result.success) {
    console.log('Measurement results:', result.data);
} else {
    console.error('Error retrieving measurement:', result.error);
}
```

### Getting Probe Information

To get information about available probes:

```javascript
const result = await globalping.probes();

if (result.success) {
    console.log('Probe information:', result.data);
} else {
    console.error('Error retrieving probe information:', result.error);
}
```

### Checking API Limits

To check your current API rate limits:

```javascript
const result = await globalping.limits();

if (result.success) {
    console.log('API limits:', result.data);
} else {
    console.error('Error retrieving API limits:', result.error);
}
```

### Error Handling

All methods return an `ApiResponse` object with a `success` property. Always check this property before accessing the `data`. If `success` is `false`, error information will be available in the `error` property.

### Caching

The Globalping class uses [ETag](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag) caching by default lets caches be more efficient and save bandwidth. You can disable this feature by setting `disableEtagCaching: true` when initializing the class.

Remember to handle API responses and errors appropriately in your application.

### Examples
Check out more examples [here](https://github.com/eyepokes/globalping-ts/tree/main/examples)
## Requirements

TypeScript >= 4.5 is supported.

The following runtimes are supported:

- Node.js 18 LTS or later ([non-EOL](https://endoflife.date/nodejs)) versions.
