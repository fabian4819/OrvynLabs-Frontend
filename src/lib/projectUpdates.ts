// Client-side project updates storage
// For MVP: stores in localStorage
// Production: would store on IPFS and reference from smart contract events

const STORAGE_KEY = "project_updates";

export interface ProjectUpdate {
  id: string;
  projectAddress: string;
  author: string; // Wallet address of the researcher
  title: string;
  content: string;
  timestamp: number;
  ipfsHash?: string; // For future IPFS integration
}

/**
 * Get all updates for a specific project
 */
export function getProjectUpdates(projectAddress: string): ProjectUpdate[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const allUpdates: ProjectUpdate[] = JSON.parse(stored);
    return allUpdates
      .filter((u) => u.projectAddress.toLowerCase() === projectAddress.toLowerCase())
      .sort((a, b) => b.timestamp - a.timestamp); // Most recent first
  } catch {
    return [];
  }
}

/**
 * Get all updates across all projects
 */
export function getAllUpdates(): ProjectUpdate[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const allUpdates: ProjectUpdate[] = JSON.parse(stored);
    return allUpdates.sort((a, b) => b.timestamp - a.timestamp);
  } catch {
    return [];
  }
}

/**
 * Add a new project update
 */
export function addProjectUpdate(
  projectAddress: string,
  author: string,
  title: string,
  content: string
): ProjectUpdate {
  if (typeof window === "undefined") {
    throw new Error("Cannot add update on server side");
  }

  const newUpdate: ProjectUpdate = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    projectAddress: projectAddress.toLowerCase(),
    author: author.toLowerCase(),
    title: title.trim(),
    content: content.trim(),
    timestamp: Date.now(),
  };

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const allUpdates: ProjectUpdate[] = stored ? JSON.parse(stored) : [];

    allUpdates.push(newUpdate);

    // Keep only last 1000 updates total
    const trimmed = allUpdates.slice(-1000);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));

    return newUpdate;
  } catch (error) {
    console.error("Failed to add project update:", error);
    throw error;
  }
}

/**
 * Delete a project update (only by author)
 */
export function deleteProjectUpdate(
  updateId: string,
  authorAddress: string
): boolean {
  if (typeof window === "undefined") return false;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return false;

    let allUpdates: ProjectUpdate[] = JSON.parse(stored);

    // Find the update and verify author
    const updateIndex = allUpdates.findIndex((u) => u.id === updateId);
    if (updateIndex === -1) return false;

    const update = allUpdates[updateIndex];
    if (update.author.toLowerCase() !== authorAddress.toLowerCase()) {
      throw new Error("Only the author can delete this update");
    }

    allUpdates = allUpdates.filter((u) => u.id !== updateId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allUpdates));

    return true;
  } catch (error) {
    console.error("Failed to delete project update:", error);
    return false;
  }
}

/**
 * Get update count for a project
 */
export function getUpdateCount(projectAddress: string): number {
  return getProjectUpdates(projectAddress).length;
}
