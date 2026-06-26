const stores = new Map();

function hash(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return h.toString(36);
}

export function createCache(name: string, { ttl = 30000, maxSize = 100 }: { ttl?: number; maxSize?: number } = {}) {
  if (stores.has(name)) return stores.get(name);

  const store = new Map<string, { value: any; expiry: number }>();
  const timers = new Map<string, any>();

  function prune() {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.expiry) {
        store.delete(key);
        timers.delete(key);
      }
    }
    if (store.size > maxSize) {
      const toDelete = store.size - maxSize;
      const keys = [...store.keys()].slice(0, toDelete);
      for (const key of keys) {
        store.delete(key);
        timers.delete(key);
      }
    }
  }

  const api = {
    get(key: string) {
      const entry = store.get(key);
      if (!entry) return null;
      if (Date.now() > entry.expiry) {
        store.delete(key);
        timers.delete(key);
        return null;
      }
      return entry.value;
    },
    set(key: string, value: any, customTtl?: number) {
      if (store.size >= maxSize) prune();
      store.set(key, { value, expiry: Date.now() + (customTtl || ttl) });
    },
    has(key: string) {
      return api.get(key) !== null;
    },
    delete(key: string) {
      store.delete(key);
      timers.delete(key);
    },
    clear() {
      store.clear();
      timers.clear();
    },
    size() { return store.size; },
  };

  stores.set(name, api);
  return api;
}

export function createCacheKey(...parts: string[]): string {
  return hash(parts.join('||'));
}

const responseCache = createCache('ai_responses', { ttl: 60000, maxSize: 50 });
const searchCache = createCache('web_search', { ttl: 120000, maxSize: 30 });

export function getCachedResponse(modelKey: string, systemContent: string, messages: any[]): string | null {
  const key = createCacheKey(modelKey, systemContent, JSON.stringify(messages));
  return responseCache.get(key);
}

export function setCachedResponse(modelKey: string, systemContent: string, messages: any[], response: string): void {
  const key = createCacheKey(modelKey, systemContent, JSON.stringify(messages));
  responseCache.set(key, response);
}

export function getCachedSearch(query: string) {
  return searchCache.get(query.toLowerCase().trim());
}

export function setCachedSearch(query: string, results: any) {
  searchCache.set(query.toLowerCase().trim(), results);
}
