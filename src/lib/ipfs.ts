// IPFS upload utility using Pinata API
// Get your API keys from https://app.pinata.cloud/

const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_API_SECRET = process.env.NEXT_PUBLIC_PINATA_API_SECRET;
const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;

export interface UploadResult {
  hash: string;
  url: string;
  name: string;
}

/**
 * Upload an image file to IPFS via Pinata
 */
export async function uploadImageToIPFS(file: File): Promise<UploadResult> {
  // Validate file
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error("File size must be less than 5MB");
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("File must be an image (JPG, PNG, WebP, or GIF)");
  }

  // Check if Pinata credentials are configured
  if (!PINATA_JWT && (!PINATA_API_KEY || !PINATA_API_SECRET)) {
    console.warn("Pinata credentials not configured. Using placeholder.");
    // Return a placeholder for development
    return {
      hash: "QmPlaceholder",
      url: getIPFSUrl("QmPlaceholder"),
      name: file.name,
    };
  }

  try {
    const formData = new FormData();
    formData.append("file", file);

    // Add metadata
    const metadata = JSON.stringify({
      name: file.name,
    });
    formData.append("pinataMetadata", metadata);

    const options = JSON.stringify({
      cidVersion: 1,
    });
    formData.append("pinataOptions", options);

    // Use JWT if available, otherwise use API key/secret
    const headers: HeadersInit = PINATA_JWT
      ? {
          Authorization: `Bearer ${PINATA_JWT}`,
        }
      : {
          pinata_api_key: PINATA_API_KEY!,
          pinata_secret_api_key: PINATA_API_SECRET!,
        };

    const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to upload to IPFS");
    }

    const data = await response.json();
    const hash = data.IpfsHash;

    return {
      hash,
      url: getIPFSUrl(hash),
      name: file.name,
    };
  } catch (error) {
    console.error("IPFS upload error:", error);
    throw error;
  }
}

/**
 * Get IPFS gateway URL for a hash
 */
export function getIPFSUrl(hash: string): string {
  if (!hash || hash === "QmPlaceholder") {
    return "/placeholder-project.svg";
  }
  // Use Pinata's dedicated gateway for better performance
  return `https://gateway.pinata.cloud/ipfs/${hash}`;
}

/**
 * Upload JSON metadata to IPFS
 */
export async function uploadMetadataToIPFS(metadata: object): Promise<UploadResult> {
  if (!PINATA_JWT && (!PINATA_API_KEY || !PINATA_API_SECRET)) {
    console.warn("Pinata credentials not configured. Using placeholder.");
    return {
      hash: "QmMetadataPlaceholder",
      url: getIPFSUrl("QmMetadataPlaceholder"),
      name: "metadata.json",
    };
  }

  try {
    const headers: HeadersInit = PINATA_JWT
      ? {
          Authorization: `Bearer ${PINATA_JWT}`,
          "Content-Type": "application/json",
        }
      : {
          pinata_api_key: PINATA_API_KEY!,
          pinata_secret_api_key: PINATA_API_SECRET!,
          "Content-Type": "application/json",
        };

    const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers,
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: {
          name: "project-metadata.json",
        },
        pinataOptions: {
          cidVersion: 1,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to upload metadata to IPFS");
    }

    const data = await response.json();
    const hash = data.IpfsHash;

    return {
      hash,
      url: getIPFSUrl(hash),
      name: "metadata.json",
    };
  } catch (error) {
    console.error("IPFS metadata upload error:", error);
    throw error;
  }
}
