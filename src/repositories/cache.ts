const cache = new Map<string, { value: any; gen: number; expiry: number }>();
let cacheGeneration = 0;

export const CACHE_TTL = { settings: 3000, analytics: 120000 };

export function cacheGet<T = unknown>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry || entry.gen !== cacheGeneration) { cache.delete(key); return null; }
  return entry.value as T;
}

export function cacheSet<T>(key: string, value: T, ttl: number): void {
  cache.set(key, { value, gen: cacheGeneration, expiry: Date.now() + ttl });
}

export function cacheDel(key: string): void {
  cache.delete(key);
}

export function bumpCacheGen(): void {
  cacheGeneration++;
  if (cacheGeneration > 1000000) cacheGeneration = 0;
}

export function clearDBCache(): void {
  cache.clear();
  bumpCacheGen();
}
