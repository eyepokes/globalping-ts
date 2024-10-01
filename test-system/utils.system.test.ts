import { afterEach, beforeEach, it } from 'mocha';
import { Globalping } from '../src';
import { parseETag } from '../src/utils';

describe('Globalping', () => {
    afterEach(function () {});

    beforeEach(() => {});

    it('parseEtag()', async () => {
        const etag = 'W/"32-ie7KaEMauh4fBGFQxr55KTRNmrU"';

        console.log(parseETag(etag));
    }).timeout(0);
});
