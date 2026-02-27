import { StorageClient, immutable } from "@lens-chain/storage-client";

type StorageEnvironmentConfig = {
  name: string;
  backend: string;
  defaultChainId: number;
  cachingTimeout: number;
  propagationTimeout: number;
  statusPollingInterval: number;
};

// Lens mainnet storage (default package environment)
const MAINNET_STORAGE_ENV: StorageEnvironmentConfig = {
  name: "production",
  backend: "https://api.grove.storage",
  defaultChainId: 232,
  cachingTimeout: 5000,
  propagationTimeout: 10000,
  statusPollingInterval: 500,
};

// Lens testnet storage (required when app targets Lens testnet)
const TESTNET_STORAGE_ENV: StorageEnvironmentConfig = {
  name: "staging",
  backend: "https://api.staging.grove.storage",
  defaultChainId: 37111,
  cachingTimeout: 10000,
  propagationTimeout: 20000,
  statusPollingInterval: 500,
};

const lensApiUrl = (
  process.env.NEXT_PUBLIC_LENS_API_URL || "https://api.testnet.lens.xyz/graphql"
).toLowerCase();
const lensChainIdEnv = process.env.NEXT_PUBLIC_LENS_CHAIN_ID;
const chainIdOverride = Number(lensChainIdEnv);
const hasChainOverride = Number.isFinite(chainIdOverride);

const isTestnetTarget =
  lensApiUrl.includes("testnet") ||
  (hasChainOverride && chainIdOverride === TESTNET_STORAGE_ENV.defaultChainId);

const primaryEnv = isTestnetTarget ? TESTNET_STORAGE_ENV : MAINNET_STORAGE_ENV;
const secondaryEnv = isTestnetTarget ? MAINNET_STORAGE_ENV : TESTNET_STORAGE_ENV;

const primaryStorageClient = StorageClient.create(primaryEnv);
const secondaryStorageClient = StorageClient.create(secondaryEnv);

// Storage client used by settings/profile uploads + URI resolving.
export const storageClient = primaryStorageClient;

const isRetryableUploadError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const maybeMessage = (error as { message?: unknown }).message;
  if (typeof maybeMessage !== "string") {
    return false;
  }

  const msg = maybeMessage.toLowerCase();
  return (
    msg.includes("failed to fetch") ||
    msg.includes("fetch failed") ||
    msg.includes("network") ||
    msg.includes("timeout") ||
    msg.includes("eof") ||
    msg.includes("protocol") ||
    msg.includes("dns") ||
    msg.includes("502") ||
    msg.includes("503") ||
    msg.includes("504")
  );
};

type UploadAttempt = {
  client: StorageClient;
  chainId: number;
};

const buildUploadAttempts = (): UploadAttempt[] => {
  const attempts: UploadAttempt[] = [
    {
      client: primaryStorageClient,
      chainId: hasChainOverride ? chainIdOverride : primaryStorageClient.env.defaultChainId,
    },
    {
      client: secondaryStorageClient,
      chainId: hasChainOverride ? chainIdOverride : secondaryStorageClient.env.defaultChainId,
    },
  ];

  if (hasChainOverride && chainIdOverride !== primaryStorageClient.env.defaultChainId) {
    attempts.push({
      client: primaryStorageClient,
      chainId: primaryStorageClient.env.defaultChainId,
    });
  }

  if (hasChainOverride && chainIdOverride !== secondaryStorageClient.env.defaultChainId) {
    attempts.push({
      client: secondaryStorageClient,
      chainId: secondaryStorageClient.env.defaultChainId,
    });
  }

  const deduped = new Map<string, UploadAttempt>();
  for (const attempt of attempts) {
    const key = `${attempt.client.env.backend}|${attempt.chainId}`;
    if (!deduped.has(key)) {
      deduped.set(key, attempt);
    }
  }

  return [...deduped.values()];
};

const uploadWithStorageFallback = async <T>(
  uploadFn: (client: StorageClient, chainId: number) => Promise<T>
): Promise<T> => {
  const attempts = buildUploadAttempts();
  let lastError: unknown = null;

  for (let i = 0; i < attempts.length; i += 1) {
    const attempt = attempts[i];

    try {
      return await uploadFn(attempt.client, attempt.chainId);
    } catch (error) {
      lastError = error;

      const hasNextAttempt = i < attempts.length - 1;
      if (!hasNextAttempt) {
        break;
      }

      if (!isRetryableUploadError(error)) {
        continue;
      }
    }
  }

  throw lastError;
};

const uploadMetadataAsFile = async (
  metadata: unknown,
  client: StorageClient,
  chainId: number
): Promise<{ uri: string }> => {
  const metadataFile = new File(
    [JSON.stringify(metadata)],
    "metadata.json",
    // Use text/plain for broader compatibility in strict CORS/proxy environments.
    { type: "text/plain;charset=utf-8" }
  );

  return client.uploadFile(metadataFile, {
    acl: immutable(chainId),
  });
};

/**
 * Uploads JSON metadata to Lens Storage and returns the URI
 * @param metadata - The metadata object to upload
 * @returns The URI string pointing to the uploaded metadata
 */
export const uploadMetadataToLensStorage = async (metadata: any): Promise<string> => {
  try {
    const { uri } = await uploadWithStorageFallback((client, chainId) =>
      client.uploadAsJson(metadata, {
        acl: immutable(chainId),
      })
    );
    return uri;
  } catch (error) {
    console.warn(
      "JSON metadata upload failed; retrying with file-based upload:",
      error
    );

    try {
      const { uri } = await uploadWithStorageFallback((client, chainId) =>
        uploadMetadataAsFile(metadata, client, chainId)
      );
      return uri;
    } catch (fallbackError) {
      console.error("Failed to upload metadata to Lens Storage:", fallbackError);
      throw fallbackError;
    }
  }
};

/**
 * Uploads a file asset (image/video/etc) to Lens Storage and returns the URI.
 */
export const uploadFileToLensStorage = async (file: File): Promise<string> => {
  try {
    const { uri } = await uploadWithStorageFallback((client, chainId) =>
      client.uploadFile(file, {
        acl: immutable(chainId),
      })
    );
    return uri;
  } catch (error) {
    console.error("Failed to upload file to Lens Storage:", error);
    throw error;
  }
};

/**
 * Returns which chain IDs are attempted for storage uploads.
 * Useful for debugging client-side upload issues in different environments.
 */
export const getStorageUploadChainConfig = () => {
  return {
    target: isTestnetTarget ? "testnet" : "mainnet",
    attempts: buildUploadAttempts().map(attempt => ({
      backend: attempt.client.env.backend,
      chainId: attempt.chainId,
    })),
  };
};
