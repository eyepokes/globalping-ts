import crypto from 'crypto';
import { CacheEntry } from './types';

export class Cache {
    private maxCacheSize = 200;

    public cache: Map<string, CacheEntry> = new Map();

    constructor(maxCacheSize: number) {
        this.maxCacheSize = maxCacheSize;
    }

    get(key: string): CacheEntry | undefined {
        return this.cache.get(key);
    }

    generateCacheKey(endpoint: string, params: Record<string, any>): string {
        return crypto
            .createHash('md5')
            .update(`${endpoint}?${JSON.stringify(params)}`)
            .digest('hex');
    }

    addToCache(key: string, entry: CacheEntry): void {
        if (this.cache.size >= this.maxCacheSize) {
            const oldestKey = this.findOldestCacheEntry();
            if (oldestKey) {
                this.cache.delete(oldestKey);
            }
        }
        this.cache.set(key, entry);
    }

    updateCacheEntryTimestamp(key: string): void {
        const entry = this.cache.get(key);
        if (entry) {
            entry.timestamp = Date.now();
            this.cache.set(key, entry);
        }
    }

    private findOldestCacheEntry(): string | null {
        let oldestKey: string | null = null;
        let oldestTimestamp = Infinity;

        for (const [key, entry] of this.cache.entries()) {
            if (entry.timestamp < oldestTimestamp) {
                oldestTimestamp = entry.timestamp;
                oldestKey = key;
            }
        }

        return oldestKey;
    }

    clearCache(): void {
        this.cache.clear();
    }

    getCacheSize(): number {
        return this.cache.size;
    }

    removeCacheEntry(endpoint: string, params: Record<string, any>): boolean {
        const key = this.generateCacheKey(endpoint, params);
        return this.cache.delete(key);
    }

    getCachedKeys(): string[] {
        return Array.from(this.cache.keys());
    }
}
