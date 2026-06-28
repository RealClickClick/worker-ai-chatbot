const stores = new Map<string, { value: any; expiry: number }>();
const timers = new Map<string, any>();
let kvNamespace: any = null;

export function setKVNamespace(kv: any): void {
  kvNamespace = kv;
}

function hash(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return h.toString(36);
}

export function createCache(name: string, { ttl = 30000, maxSize = 100 }: { ttl?: number; maxSize?: number } = {}) {
  const kvPrefix = `cache:${name}:`;

  const api = {
    async get(key: string) {
      const entry = stores.get(key);
      if (entry) {
        if (Date.now() > entry.expiry) {
          stores.delete(key);
          timers.delete(key);
        } else {
          return entry.value;
        }
      }
      if (kvNamespace) {
        try {
          const kvEntry = await kvNamespace.get(`${kvPrefix}${key}`, 'text');
          if (kvEntry) {
            const parsed = JSON.parse(kvEntry);
            if (parsed.expiry > Date.now()) {
              stores.set(key, { value: parsed.value, expiry: parsed.expiry });
              return parsed.value;
            }
            await kvNamespace.delete(`${kvPrefix}${key}`).catch(() => {});
          }
        } catch {}
      }
      return null;
    },
    async set(key: string, value: any, customTtl?: number) {
      const expiryMs = customTtl || ttl;
      const expiry = Date.now() + expiryMs;
      if (stores.size >= maxSize) {
        const keys = [...stores.keys()].slice(0, stores.size - maxSize + 1);
        for (const k of keys) { stores.delete(k); timers.delete(k); }
      }
      stores.set(key, { value, expiry });
      if (kvNamespace) {
        try {
          await kvNamespace.put(`${kvPrefix}${key}`, JSON.stringify({ value, expiry }), {
            expirationTtl: Math.ceil(expiryMs / 1000),
          });
        } catch {}
      }
    },
    async has(key: string) {
      return (await api.get(key)) !== null;
    },
    async delete(key: string) {
      stores.delete(key);
      timers.delete(key);
      if (kvNamespace) {
        try { await kvNamespace.delete(`${kvPrefix}${key}`).catch(() => {}); } catch {}
      }
    },
    async clear() {
      stores.clear();
      timers.clear();
      if (kvNamespace) {
        try {
          const listed = await kvNamespace.list({ prefix: kvPrefix });
          for (const key of listed.keys) {
            await kvNamespace.delete(key.name).catch(() => {});
          }
        } catch {}
      }
    },
    deleteByPrefix(prefix: string) {
      for (const key of stores.keys()) {
        if (key.startsWith(prefix)) {
          stores.delete(key);
          timers.delete(key);
        }
      }
      if (kvNamespace) {
        try {
          const fullPrefix = `${kvPrefix}${prefix}`;
          kvNamespace.list({ prefix: fullPrefix }).then((listed: { keys: { name: string }[] }) => {
            for (const k of listed.keys) {
              kvNamespace.delete(k.name).catch(() => {});
            }
          }).catch(() => {});
        } catch {}
      }
    },
    size() { return stores.size; },
  };

  return api;
}

export function createCacheKey(...parts: string[]): string {
  return hash(parts.join('||'));
}

const responseCache = createCache('ai_responses', { ttl: 60000, maxSize: 50 });
const searchCache = createCache('web_search', { ttl: 120000, maxSize: 30 });
const settingsCache = createCache('settings', { ttl: 30000, maxSize: 200 });

export async function getCachedResponse(modelKey: string, systemContent: string, messages: any[]): Promise<string | null> {
  const key = createCacheKey(modelKey, systemContent, JSON.stringify(messages));
  return await responseCache.get(key);
}

export async function setCachedResponse(modelKey: string, systemContent: string, messages: any[], response: string): Promise<void> {
  const key = createCacheKey(modelKey, systemContent, JSON.stringify(messages));
  await responseCache.set(key, response);
}

export async function getCachedSearch(query: string): Promise<any> {
  return await searchCache.get(query.toLowerCase().trim());
}

export async function setCachedSearch(query: string, results: any): Promise<void> {
  await searchCache.set(query.toLowerCase().trim(), results);
}

export async function getCachedSettings<T>(key: string): Promise<T | null> {
  return await settingsCache.get(key);
}

export async function setCachedSettings<T>(key: string, value: T): Promise<void> {
  await settingsCache.set(key, value, 30000);
}

export async function clearCachedSettings(key: string): Promise<void> {
  await settingsCache.delete(key);
}
