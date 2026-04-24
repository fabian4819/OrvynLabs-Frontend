// Client-side project image storage
// For MVP: stores IPFS hashes in localStorage
// Future: move to on-chain metadata or backend database

const STORAGE_KEY = "project_images";

interface ProjectImageData {
  ipfsHash: string;
  url: string;
  timestamp: number;
}

type ProjectImagesMap = Record<string, ProjectImageData>;

/**
 * Get all project images from localStorage
 */
function getProjectImages(): ProjectImagesMap {
  if (typeof window === "undefined") return {};

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * Save project image IPFS hash
 */
export function saveProjectImage(projectAddress: string, ipfsHash: string, url: string) {
  if (typeof window === "undefined") return;

  const images = getProjectImages();
  images[projectAddress.toLowerCase()] = {
    ipfsHash,
    url,
    timestamp: Date.now(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
}

/**
 * Get project image URL by address
 */
export function getProjectImage(projectAddress: string): string | null {
  const images = getProjectImages();
  const imageData = images[projectAddress.toLowerCase()];

  return imageData?.url || null;
}

/**
 * Remove project image
 */
export function removeProjectImage(projectAddress: string) {
  if (typeof window === "undefined") return;

  const images = getProjectImages();
  delete images[projectAddress.toLowerCase()];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
}

/**
 * Get default placeholder image
 */
export function getPlaceholderImage(): string {
  // Return a data URL or path to placeholder
  return "/placeholder-project.svg";
}

/**
 * Get project image with fallback to placeholder
 */
export function getProjectImageOrPlaceholder(projectAddress: string): string {
  return getProjectImage(projectAddress) || getPlaceholderImage();
}
