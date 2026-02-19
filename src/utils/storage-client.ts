import { StorageClient, immutable } from "@lens-chain/storage-client";

// Storage client used by settings/profile uploads.
export const storageClient = StorageClient.create();
const LENS_TESTNET_CHAIN_ID = Number(process.env.NEXT_PUBLIC_LENS_CHAIN_ID || 37111);

/**
 * Uploads JSON metadata to Lens Storage and returns the URI
 * @param metadata - The metadata object to upload
 * @returns The URI string pointing to the uploaded metadata
 */
export const uploadMetadataToLensStorage = async (metadata: any): Promise<string> => {
  try {
    // Use uploadAsJson method for JSON metadata
    const { uri } = await storageClient.uploadAsJson(metadata, {
      acl: immutable(LENS_TESTNET_CHAIN_ID),
    });
    return uri;
  } catch (error) {
    console.error("Failed to upload to Lens Storage:", error);
    throw error;
  }
};

/**
 * Uploads a file asset (image/video/etc) to Lens Storage and returns the URI.
 * Uses immutable ACL for the current default chain.
 */
export const uploadFileToLensStorage = async (file: File): Promise<string> => {
  try {
    const { uri } = await storageClient.uploadFile(file, {
      acl: immutable(LENS_TESTNET_CHAIN_ID),
    });
    return uri;
  } catch (error) {
    console.error("Failed to upload file to Lens Storage:", error);
    throw error;
  }
};
