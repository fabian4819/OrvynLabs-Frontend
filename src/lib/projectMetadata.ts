// Client-side project metadata storage (categories & tags)
// For MVP: stores in localStorage
// Future: move to IPFS or backend database

const STORAGE_KEY = "project_metadata";

export type ProjectCategory =
  | "AI/ML"
  | "Blockchain"
  | "Biology"
  | "Physics"
  | "Chemistry"
  | "Medicine"
  | "Engineering"
  | "Social Science"
  | "Mathematics"
  | "Environmental"
  | "Other";

export const CATEGORIES: ProjectCategory[] = [
  "AI/ML",
  "Blockchain",
  "Biology",
  "Physics",
  "Chemistry",
  "Medicine",
  "Engineering",
  "Social Science",
  "Mathematics",
  "Environmental",
  "Other",
];

export const CATEGORY_ICONS: Record<ProjectCategory, string> = {
  "AI/ML": "🤖",
  "Blockchain": "⛓️",
  "Biology": "🧬",
  "Physics": "⚛️",
  "Chemistry": "🧪",
  "Medicine": "💊",
  "Engineering": "⚙️",
  "Social Science": "📊",
  "Mathematics": "📐",
  "Environmental": "🌍",
  "Other": "🔬",
};

export const CATEGORY_COLORS: Record<ProjectCategory, string> = {
  "AI/ML": "bg-purple-500/20 text-purple-400 border-purple-500/30",
  "Blockchain": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "Biology": "bg-green-500/20 text-green-400 border-green-500/30",
  "Physics": "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  "Chemistry": "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "Medicine": "bg-red-500/20 text-red-400 border-red-500/30",
  "Engineering": "bg-gray-500/20 text-gray-400 border-gray-500/30",
  "Social Science": "bg-pink-500/20 text-pink-400 border-pink-500/30",
  "Mathematics": "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  "Environmental": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  "Other": "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

export interface ProjectMetadata {
  category?: ProjectCategory;
  tags: string[];
  description?: string;
  websiteUrl?: string;
  githubUrl?: string;
}

type ProjectMetadataMap = Record<string, ProjectMetadata>;

/**
 * Get all project metadata from localStorage
 */
function getProjectMetadataMap(): ProjectMetadataMap {
  if (typeof window === "undefined") return {};

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * Save project metadata
 */
export function saveProjectMetadata(
  projectAddress: string,
  metadata: ProjectMetadata
) {
  if (typeof window === "undefined") return;

  const map = getProjectMetadataMap();
  map[projectAddress.toLowerCase()] = metadata;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

/**
 * Get project metadata
 */
export function getProjectMetadata(
  projectAddress: string
): ProjectMetadata | null {
  const map = getProjectMetadataMap();
  return map[projectAddress.toLowerCase()] || null;
}

/**
 * Get all projects by category
 */
export function getProjectsByCategory(category: ProjectCategory): string[] {
  const map = getProjectMetadataMap();
  return Object.entries(map)
    .filter(([_, metadata]) => metadata.category === category)
    .map(([address]) => address);
}

/**
 * Get all projects by tag
 */
export function getProjectsByTag(tag: string): string[] {
  const map = getProjectMetadataMap();
  return Object.entries(map)
    .filter(([_, metadata]) => metadata.tags.includes(tag.toLowerCase()))
    .map(([address]) => address);
}

/**
 * Get all unique tags across all projects
 */
export function getAllTags(): string[] {
  const map = getProjectMetadataMap();
  const tagsSet = new Set<string>();

  Object.values(map).forEach((metadata) => {
    metadata.tags.forEach((tag) => tagsSet.add(tag));
  });

  return Array.from(tagsSet).sort();
}

/**
 * Get tag usage count
 */
export function getTagUsage(): Record<string, number> {
  const map = getProjectMetadataMap();
  const tagCount: Record<string, number> = {};

  Object.values(map).forEach((metadata) => {
    metadata.tags.forEach((tag) => {
      tagCount[tag] = (tagCount[tag] || 0) + 1;
    });
  });

  return tagCount;
}
