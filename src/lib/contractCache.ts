const CACHE_KEY = "w3rk_contracts_cache";
const CACHE_TTL = 60 * 1000; // 1 minute

interface CacheEntry {
  data: any[];
  timestamp: number;
  userAddress: string;
}

const isBrowser = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export function getCachedContracts(userAddress: string): any[] | null {
  if (!isBrowser()) return null;

  const cached = window.localStorage.getItem(CACHE_KEY);
  if (!cached) return null;

  try {
    const entry: CacheEntry = JSON.parse(cached);
    if (entry.userAddress.toLowerCase() !== userAddress.toLowerCase()) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL) return null;
    return entry.data;
  } catch (error) {
    console.error("Error reading contract cache:", error);
    return null;
  }
}

export function setCachedContracts(userAddress: string, data: any[]): void {
  if (!isBrowser()) return;

  const entry: CacheEntry = {
    data,
    timestamp: Date.now(),
    userAddress,
  };
  window.localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
}

export function invalidateContractsCache(userAddress?: string): void {
  if (!isBrowser()) return;

  if (!userAddress) {
    window.localStorage.removeItem(CACHE_KEY);
    return;
  }

  const cached = window.localStorage.getItem(CACHE_KEY);
  if (!cached) return;

  try {
    const entry: CacheEntry = JSON.parse(cached);
    if (entry.userAddress.toLowerCase() === userAddress.toLowerCase()) {
      window.localStorage.removeItem(CACHE_KEY);
    }
  } catch {
    window.localStorage.removeItem(CACHE_KEY);
  }
}
