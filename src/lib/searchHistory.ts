// Client-side search history storage

const STORAGE_KEY = "search_history";
const MAX_HISTORY = 10;

interface SearchEntry {
  query: string;
  timestamp: number;
}

/**
 * Get search history
 */
export function getSearchHistory(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const entries: SearchEntry[] = JSON.parse(stored);
    return entries.map((e) => e.query);
  } catch {
    return [];
  }
}

/**
 * Add a search query to history
 */
export function addToSearchHistory(query: string): void {
  if (typeof window === "undefined" || !query.trim()) return;

  try {
    const trimmed = query.trim();
    const stored = localStorage.getItem(STORAGE_KEY);
    let entries: SearchEntry[] = stored ? JSON.parse(stored) : [];

    // Remove if already exists (to move to top)
    entries = entries.filter((e) => e.query.toLowerCase() !== trimmed.toLowerCase());

    // Add to beginning
    entries.unshift({
      query: trimmed,
      timestamp: Date.now(),
    });

    // Keep only MAX_HISTORY items
    entries = entries.slice(0, MAX_HISTORY);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error("Failed to save search history:", error);
  }
}

/**
 * Clear all search history
 */
export function clearSearchHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Remove a specific query from history
 */
export function removeFromSearchHistory(query: string): void {
  if (typeof window === "undefined") return;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    let entries: SearchEntry[] = JSON.parse(stored);
    entries = entries.filter((e) => e.query !== query);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error("Failed to remove from search history:", error);
  }
}
