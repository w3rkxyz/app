// Data URI helpers for Lens Protocol metadata
// Lens Protocol accepts data URIs (base64-encoded JSON), eliminating need for external services

/**
 * Converts JSON to a data URI (base64-encoded)
 * This works directly with Lens Protocol without requiring external services
 * @param json - The JSON object to encode
 * @returns Data URI string (data:application/json;base64,...)
 */
export const jsonToDataURI = async (json: any): Promise<string> => {
  const serialized = JSON.stringify(json);
  
  // Create base64-encoded data URI (UTF-8 safe)
  // btoa() only handles Latin1, so we need to convert UTF-8 to base64 properly
  let base64Metadata: string;
  
  if (typeof window !== 'undefined' && window.btoa) {
    // Browser: Convert UTF-8 string to base64 using encodeURIComponent + unescape + btoa
    // This handles Unicode characters (emojis, special chars) correctly
    base64Metadata = window.btoa(unescape(encodeURIComponent(serialized)));
  } else {
    // Node.js: Use Buffer which handles UTF-8 natively
    base64Metadata = Buffer.from(serialized, 'utf8').toString('base64');
  }
  
  const dataUri = `data:application/json;base64,${base64Metadata}`;
  return dataUri;
};

/**
 * Converts a file to a data URI (base64-encoded)
 * For images and small files, data URIs work well
 * For larger files, consider implementing a different solution
 * @param file - File or FileList to encode
 * @returns Data URI string
 */
export const fileToDataURI = async (file: any): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const fileToUpload = file instanceof FileList ? file[0] : file;
      if (!fileToUpload) {
        reject(new Error("No file provided"));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        resolve(dataUri);
      };
      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };
      reader.readAsDataURL(fileToUpload);
    } catch (error) {
      reject(error);
    }
  });
};

// Legacy exports for backward compatibility during migration
// TODO: Remove these after all imports are updated
export const uploadJsonToIPFS = jsonToDataURI;
export const uploadFileToIPFS = fileToDataURI;

