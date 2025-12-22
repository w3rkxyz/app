import { StorageClient } from "@lens-chain/storage-client";

// Create StorageClient - it defaults to testnet when no environment is specified
export const storageClient = StorageClient.create();

/**
 * Uploads JSON metadata to Lens Storage and returns the URI
 * @param metadata - The metadata object to upload
 * @returns The URI string pointing to the uploaded metadata
 */
export const uploadMetadataToLensStorage = async (metadata: any): Promise<string> => {
  try {
    // Use uploadAsJson method for JSON metadata
    const { uri } = await storageClient.uploadAsJson(metadata);
    return uri;
  } catch (error) {
    console.error("Failed to upload to Lens Storage:", error);
    throw error;
  }
};
