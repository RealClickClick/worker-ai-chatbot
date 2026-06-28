import { createCache, setKVNamespace } from '../utils/cache.ts';
import type { Env } from '../types/env.d.ts';

let dbCache: ReturnType<typeof createCache> | null = null;

export function initCache(env: Env): void {
  if (env.KV_CACHE) {
    setKVNamespace(env.KV_CACHE);
  }
  dbCache = createCache('db', { ttl: 3000, maxSize: 500 });
}

export const CACHE_TTL = {
  settings: 3000,
  analytics: 120000,
};

export async function cacheGet<T = unknown>(key: string): Promise<T | null> {
  if (!dbCache) return null;
  return await dbCache.get(key) as T | null;
}

export async function cacheSet<T>(key: string, value: T, ttl: number): Promise<void> {
  if (!dbCache) return;
  await dbCache.set(key, value, ttl);
}

export async function cacheDel(key: string): Promise<void> {
  if (!dbCache) return;
  await dbCache.delete(key);
}

export async function cacheDelByPrefix(prefix: string): Promise<void> {
  if (!dbCache) return;
  dbCache.deleteByPrefix(prefix);
}

let cacheGeneration = 0;

export function bumpCacheGen(): void {
  cacheGeneration++;
}

export async function clearDBCache(): Promise<void> {
  if (!dbCache) return;
  await dbCache.clear();
  cacheGeneration = 0;
}
