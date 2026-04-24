// Client-side favorites/bookmarks storage
// For MVP: stores in localStorage keyed by wallet address

const STORAGE_KEY = "project_favorites";

interface FavoriteData {
  projectAddress: string;
  addedAt: number;
}

/**
 * Get favorites for a specific wallet address
 */
export function getFavorites(walletAddress: string): string[] {
  if (typeof window === "undefined" || !walletAddress) return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const allFavorites: Record<string, FavoriteData[]> = JSON.parse(stored);
    const userFavorites = allFavorites[walletAddress.toLowerCase()] || [];

    // Sort by most recently added first
    return userFavorites
      .sort((a, b) => b.addedAt - a.addedAt)
      .map((f) => f.projectAddress);
  } catch {
    return [];
  }
}

/**
 * Check if a project is favorited
 */
export function isFavorite(walletAddress: string, projectAddress: string): boolean {
  const favorites = getFavorites(walletAddress);
  return favorites.includes(projectAddress.toLowerCase());
}

/**
 * Add a project to favorites
 */
export function addFavorite(walletAddress: string, projectAddress: string): void {
  if (typeof window === "undefined" || !walletAddress) return;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const allFavorites: Record<string, FavoriteData[]> = stored ? JSON.parse(stored) : {};

    const userKey = walletAddress.toLowerCase();
    const projectKey = projectAddress.toLowerCase();

    if (!allFavorites[userKey]) {
      allFavorites[userKey] = [];
    }

    // Check if already favorited
    const exists = allFavorites[userKey].some((f) => f.projectAddress === projectKey);
    if (exists) return;

    allFavorites[userKey].push({
      projectAddress: projectKey,
      addedAt: Date.now(),
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(allFavorites));
  } catch (error) {
    console.error("Failed to add favorite:", error);
  }
}

/**
 * Remove a project from favorites
 */
export function removeFavorite(walletAddress: string, projectAddress: string): void {
  if (typeof window === "undefined" || !walletAddress) return;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    const allFavorites: Record<string, FavoriteData[]> = JSON.parse(stored);
    const userKey = walletAddress.toLowerCase();
    const projectKey = projectAddress.toLowerCase();

    if (!allFavorites[userKey]) return;

    allFavorites[userKey] = allFavorites[userKey].filter(
      (f) => f.projectAddress !== projectKey
    );

    localStorage.setItem(STORAGE_KEY, JSON.stringify(allFavorites));
  } catch (error) {
    console.error("Failed to remove favorite:", error);
  }
}

/**
 * Toggle favorite status
 */
export function toggleFavorite(walletAddress: string, projectAddress: string): boolean {
  const isFav = isFavorite(walletAddress, projectAddress);

  if (isFav) {
    removeFavorite(walletAddress, projectAddress);
    return false;
  } else {
    addFavorite(walletAddress, projectAddress);
    return true;
  }
}

/**
 * Get favorite count for a user
 */
export function getFavoriteCount(walletAddress: string): number {
  return getFavorites(walletAddress).length;
}
