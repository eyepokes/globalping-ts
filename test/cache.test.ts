import assert from 'assert';
import { Cache } from '../src/cache';
import { CacheEntry } from '../src/types';
import { sleep } from '../dist/utils';

describe('Cache', () => {
    let cache: Cache;
    const etag = 'W/"8b1-5ZhY8vjaueP1RgpwTkntboZTYkU"';

    beforeEach(() => {
        cache = new Cache(3); // Set max size to 3 for easier testing
    });

    it('should add and retrieve entries', () => {
        const key = 'test-key';
        const entry: CacheEntry = { data: 'test-data', timestamp: Date.now(), etag };

        cache.addToCache(key, entry);
        const retrievedEntry = cache.get(key);

        assert.deepStrictEqual(retrievedEntry, entry);
    });

    it('should generate correct cache key', () => {
        const endpoint = '/api/data';
        const params = { id: 1, name: 'test' };
        const key = cache.generateCacheKey(endpoint, params);

        assert.strictEqual(typeof key, 'string');
        assert.strictEqual(key.length, 32); // MD5 hash is 32 characters long
    });

    it('should remove oldest entry when cache is full', () => {
        const entry1: CacheEntry = { data: 'data1', timestamp: Date.now(), etag };
        const entry2: CacheEntry = { data: 'data2', timestamp: Date.now() + 1, etag };
        const entry3: CacheEntry = { data: 'data3', timestamp: Date.now() + 2, etag };
        const entry4: CacheEntry = { data: 'data4', timestamp: Date.now() + 3, etag };

        cache.addToCache('key1', entry1);
        cache.addToCache('key2', entry2);
        cache.addToCache('key3', entry3);
        cache.addToCache('key4', entry4);

        assert.strictEqual(cache.getCacheSize(), 3);
        assert.strictEqual(cache.get('key1'), undefined);
        assert.deepStrictEqual(cache.get('key4'), entry4);
    });

    it('should update cache entry timestamp', async () => {
        const key = 'test-key';
        const entry: CacheEntry = { data: 'test-data', timestamp: Date.now(), etag };

        cache.addToCache(key, entry);
        const originalTimestamp = entry.timestamp;
        await sleep(0.01);
        cache.updateCacheEntryTimestamp(key);
        const updatedEntry = cache.get(key);

        assert.notStrictEqual(updatedEntry!.timestamp, originalTimestamp);
        assert.ok(updatedEntry!.timestamp > originalTimestamp);
    });

    it('should clear the cache', () => {
        cache.addToCache('key1', { data: 'data1', timestamp: Date.now(), etag });
        cache.addToCache('key2', { data: 'data2', timestamp: Date.now(), etag });

        cache.clearCache();

        assert.strictEqual(cache.getCacheSize(), 0);
    });

    it('should remove a specific cache entry', () => {
        const endpoint = '/api/data';
        const params = { id: 1 };
        const key = cache.generateCacheKey(endpoint, params);

        cache.addToCache(key, { data: 'test-data', timestamp: Date.now(), etag });
        assert.strictEqual(cache.getCacheSize(), 1);

        const removed = cache.removeCacheEntry(endpoint, params);
        assert.strictEqual(removed, true);
        assert.strictEqual(cache.getCacheSize(), 0);
    });

    it('should return cached keys', () => {
        cache.addToCache('key1', { data: 'data1', timestamp: Date.now(), etag });
        cache.addToCache('key2', { data: 'data2', timestamp: Date.now(), etag });

        const keys = cache.getCachedKeys();

        assert.deepStrictEqual(keys, ['key1', 'key2']);
    });
});
