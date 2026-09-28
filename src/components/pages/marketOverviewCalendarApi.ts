export type MarketHolidayExchangeWindow = {
  exchange: string;
  start_time: number;
  end_time: number;
};

export type MarketHolidayRecord = {
  date: string;
  description: string;
  holiday_type: 'SETTLEMENT_HOLIDAY' | 'TRADING_HOLIDAY' | 'SPECIAL_TIMING' | string;
  closed_exchanges: string[];
  open_exchanges: MarketHolidayExchangeWindow[];
};

export type MarketHolidaysResponse = {
  status: string;
  data: MarketHolidayRecord[];
};

export type FetchHolidaysOptions = {
  force?: boolean;
  signal?: AbortSignal;
  ttlMs?: number;
};

const MARKET_HOLIDAYS_BASE_URL = 'https://api.upstox.com/v2/market/holidays';
const CACHE_STORAGE_PREFIX = 'seefin.market_holidays.v1.';
const DEFAULT_CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

type CacheEntry = {
  timestamp: number;
  expiresAt: number;
  payload: MarketHolidaysResponse;
};

const memoryCache = new Map<string, CacheEntry>();
const inFlightRequests = new Map<string, Promise<MarketHolidaysResponse>>();

const getCacheKey = (date?: string) => `${CACHE_STORAGE_PREFIX}${date || 'index'}`;

const buildMarketHolidaysUrl = (date?: string) => {
  const url = new URL(MARKET_HOLIDAYS_BASE_URL);

  if (date) {
    url.pathname = `${url.pathname.replace(/\/$/, '')}/${date}`;
  }

  return url;
};

export const getCachedMarketHolidays = (date?: string): { data: MarketHolidayRecord[]; timestamp: number } | null => {
  const cacheKey = getCacheKey(date);

  const memoryEntry = memoryCache.get(cacheKey);
  if (memoryEntry && memoryEntry.expiresAt > Date.now()) {
    return { data: memoryEntry.payload.data, timestamp: memoryEntry.timestamp };
  }

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(cacheKey);
      if (raw) {
        const parsed = JSON.parse(raw) as CacheEntry;
        if (parsed && typeof parsed.expiresAt === 'number' && parsed.expiresAt > Date.now() && parsed.payload?.data) {
          memoryCache.set(cacheKey, parsed);
          return { data: parsed.payload.data, timestamp: parsed.timestamp };
        }
      }
    } catch {
      // Ignore storage parse errors
    }
  }

  return null;
};

export const getStaleCachedMarketHolidays = (date?: string): { data: MarketHolidayRecord[]; timestamp: number } | null => {
  const cacheKey = getCacheKey(date);

  const memoryEntry = memoryCache.get(cacheKey);
  if (memoryEntry?.payload?.data) {
    return { data: memoryEntry.payload.data, timestamp: memoryEntry.timestamp };
  }

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(cacheKey);
      if (raw) {
        const parsed = JSON.parse(raw) as CacheEntry;
        if (parsed?.payload?.data) {
          return { data: parsed.payload.data, timestamp: parsed.timestamp };
        }
      }
    } catch {
      // Ignore storage parse errors
    }
  }

  return null;
};

const saveToCache = (date: string | undefined, payload: MarketHolidaysResponse, ttlMs: number) => {
  const cacheKey = getCacheKey(date);
  const now = Date.now();
  const entry: CacheEntry = {
    timestamp: now,
    expiresAt: now + ttlMs,
    payload,
  };

  memoryCache.set(cacheKey, entry);

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(cacheKey, JSON.stringify(entry));
    } catch {
      // Ignore storage quota errors
    }
  }
};

export const clearMarketHolidaysCache = (date?: string) => {
  if (date) {
    const key = getCacheKey(date);
    memoryCache.delete(key);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(key);
      } catch {
        // Ignore
      }
    }
  } else {
    memoryCache.clear();
    if (typeof window !== 'undefined') {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i += 1) {
          const key = localStorage.key(i);
          if (key?.startsWith(CACHE_STORAGE_PREFIX)) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      } catch {
        // Ignore
      }
    }
  }
};

export const fetchMarketHolidays = async (
  date?: string,
  options?: FetchHolidaysOptions | AbortSignal
): Promise<MarketHolidaysResponse> => {
  const opts: FetchHolidaysOptions =
    options instanceof AbortSignal
      ? { signal: options }
      : options ?? {};

  const { force = false, signal, ttlMs = DEFAULT_CACHE_TTL_MS } = opts;
  const cacheKey = getCacheKey(date);

  if (!force) {
    const cached = getCachedMarketHolidays(date);
    if (cached) {
      return {
        status: 'success',
        data: cached.data,
      };
    }
  }

  const existingRequest = inFlightRequests.get(cacheKey);
  if (existingRequest && !force) {
    return existingRequest;
  }

  const fetchPromise = (async () => {
    try {
      const response = await fetch(buildMarketHolidaysUrl(date), {
        signal,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Holiday data request failed (${response.status})`);
      }

      const json = (await response.json()) as MarketHolidaysResponse;
      if (Array.isArray(json.data)) {
        saveToCache(date, json, ttlMs);
      }
      return json;
    } catch (error) {
      const stale = getStaleCachedMarketHolidays(date);
      if (stale) {
        return {
          status: 'success',
          data: stale.data,
        };
      }
      throw error;
    } finally {
      inFlightRequests.delete(cacheKey);
    }
  })();

  inFlightRequests.set(cacheKey, fetchPromise);
  return fetchPromise;
};
