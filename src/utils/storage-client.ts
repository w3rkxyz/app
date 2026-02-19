import { StorageClient, immutable } from "@lens-chain/storage-client";

// Storage client used by settings/profile uploads.
export const storageClient = StorageClient.create();
const PRIMARY_CHAIN_ID = Number(
  process.env.NEXT_PUBLIC_LENS_CHAIN_ID || storageClient.env.defaultChainId
);
const FALLBACK_CHAIN_ID = storageClient.env.defaultChainId;

const isRetryableUploadError = (error: unknown): boolean => {
  if (!error || typeof error !== "object") {
    return false;
  }

  const maybeMessage = (error as { message?: unknown }).message;
  if (typeof maybeMessage !== "string") {
    return false;
  }

  const msg = maybeMessage.toLowerCase();
  return msg.includes("failed to fetch") || msg.includes("network");
};

const uploadWithChainFallback = async <T>(
  uploadFn: (chainId: number) => Promise<T>
): Promise<T> => {
  try {
    return await uploadFn(PRIMARY_CHAIN_ID);
  } catch (error) {
    if (
      PRIMARY_CHAIN_ID !== FALLBACK_CHAIN_ID &&
      isRetryableUploadError(error)
    ) {
      return await uploadFn(FALLBACK_CHAIN_ID);
    }
    throw error;
  }
};

/**
 * Uploads JSON metadata to Lens Storage and returns the URI
 * @param metadata - The metadata object to upload
 * @returns The URI string pointing to the uploaded metadata
 */
export const uploadMetadataToLensStorage = async (metadata: any): Promise<string> => {
  try {
    const { uri } = await uploadWithChainFallback(chainId =>
      storageClient.uploadAsJson(metadata, {
        acl: immutable(chainId),
      })
    );
    return uri;
  } catch (error) {
    console.error("Failed to upload to Lens Storage:", error);
    throw error;
  }
};

/**
 * Uploads a file asset (image/video/etc) to Lens Storage and returns the URI.
 */
export const uploadFileToLensStorage = async (file: File): Promise<string> => {
  try {
    const { uri } = await uploadWithChainFallback(chainId =>
      storageClient.uploadFile(file, {
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
    primary: PRIMARY_CHAIN_ID,
    fallback: FALLBACK_CHAIN_ID,
  };
};
