// Create a client using keys returned from getKeys
const ENCODING = "binary";

const DEFAULT_XMTP_ENV = "dev";

export const getEnv = (): "dev" | "production" | "local" => {
  const configuredEnv = process.env.NEXT_PUBLIC_XMTP_ENV;
  if (
    configuredEnv === "local" ||
    configuredEnv === "dev" ||
    configuredEnv === "production"
  ) {
    return configuredEnv;
  }

  return DEFAULT_XMTP_ENV;
};

export const buildLocalStorageKey = (walletAddress: string) =>
  walletAddress ? `xmtp:${getEnv()}:keys:${walletAddress}` : "";

export const loadKeys = (walletAddress: string): Uint8Array | undefined => {
  const val = localStorage.getItem(buildLocalStorageKey(walletAddress));
  return val ? Buffer.from(val, ENCODING) : undefined;
};

export const storeKeys = (walletAddress: string, keys: Uint8Array) => {
  localStorage.setItem(buildLocalStorageKey(walletAddress), Buffer.from(keys).toString(ENCODING));
};

export const wipeKeys = (walletAddress: string) => {
  // This will clear the conversation cache + the private keys
  localStorage.removeItem(buildLocalStorageKey(walletAddress));
};
