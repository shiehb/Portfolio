// lib/projectsData.ts

export interface ProjectItem {
  id: string | number;
  name?: string;
  title?: string;
  image: string;
  images?: string[];
  category: string;
  mimeType?: string;
  isVideo?: boolean;
  videoUrl?: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
}

/**
 * Extracts a normalized base group key and human-friendly title from a filename.
 * E.g.:
 *  "Brand_Visual_Identity_1.jpg" -> groupKey: "brand-visual-identity", title: "Brand Visual Identity", orderIndex: 1
 *  "Campus_Photojournalism_02.jpg" -> groupKey: "campus-photojournalism", title: "Campus Photojournalism", orderIndex: 2
 *  "Editorial_Magazine_Web (3).png" -> groupKey: "editorial-magazine-web", title: "Editorial Magazine Web", orderIndex: 3
 */
export function parseFileName(fileName: string): { groupKey: string; title: string; orderIndex: number } {
  if (!fileName || typeof fileName !== 'string') {
    return { groupKey: '', title: '', orderIndex: 0 };
  }

  // 1. Remove file extension
  const withoutExt = fileName.replace(/\.[a-zA-Z0-9]+$/, '');

  // 2. Look for trailing numeric or letter suffixes like: _01, -1, (2), [3], #1, _part2, etc.
  let cleanName = withoutExt;
  let orderIndex = 0;

  const match = withoutExt.match(/^(.*?)(?:[_\-\s]+(?:part|v)?(\d+)|[_\-\s]*\((\d+)\)|[_\-\s]*\[(\d+)\]|[_\-\s]*#(\d+)|[_\-\s]+([a-zA-Z]))$/i);
  if (match) {
    cleanName = match[1];
    const num = match[2] || match[3] || match[4] || match[5];
    if (num) {
      orderIndex = parseInt(num, 10);
    } else if (match[6]) {
      orderIndex = match[6].toUpperCase().charCodeAt(0);
    }
  }

  // Clean spaces, hyphens, underscores for display title
  const formattedTitle = cleanName
    .replace(/[_\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map(w => w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : '')
    .join(' ');

  const groupKey = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '');

  return {
    groupKey: groupKey || withoutExt.toLowerCase(),
    title: formattedTitle || withoutExt,
    orderIndex,
  };
}

/**
 * Groups raw items by base filename within the same category into multi-image stacks.
 */
export function groupProjectsByFileName(items: ProjectItem[]): ProjectItem[] {
  const groups = new Map<string, ProjectItem[]>();
  const nonGroupable: ProjectItem[] = [];

  for (const item of items) {
    const fileName = item.name || '';
    if (!fileName) {
      nonGroupable.push(item);
      continue;
    }

    const { groupKey } = parseFileName(fileName);
    const fullKey = `${item.category}:${groupKey}`;

    if (!groups.has(fullKey)) {
      groups.set(fullKey, []);
    }
    groups.get(fullKey)!.push(item);
  }

  const result: ProjectItem[] = [];

  groups.forEach((groupItems) => {
    if (groupItems.length === 1) {
      const item = groupItems[0];
      const parsed = item.name ? parseFileName(item.name) : null;
      result.push({
        ...item,
        title: item.title || (parsed ? parsed.title : undefined),
        images: item.images && item.images.length > 0 ? item.images : [item.image],
      });
    } else {
      // Sort items by extracted orderIndex or name
      groupItems.sort((a, b) => {
        const orderA = a.name ? parseFileName(a.name).orderIndex : 0;
        const orderB = b.name ? parseFileName(b.name).orderIndex : 0;
        if (orderA !== orderB) return orderA - orderB;
        return (a.name || '').localeCompare(b.name || '');
      });

      const first = groupItems[0];
      const parsed = first.name ? parseFileName(first.name) : null;
      const allImages = groupItems.map(i => i.image).filter(Boolean);

      result.push({
        ...first,
        id: `group-${first.id}`,
        title: first.title || (parsed ? parsed.title : undefined),
        image: allImages[0],
        images: allImages,
      });
    }
  });

  // Add items without filenames
  for (const item of nonGroupable) {
    result.push({
      ...item,
      images: item.images && item.images.length > 0 ? item.images : [item.image],
    });
  }

  return result;
}

let cachedProjects: ProjectItem[] | null = null;
let fetchPromise: Promise<ProjectItem[]> | null = null;

export async function getProjects(): Promise<ProjectItem[]> {
  if (cachedProjects && cachedProjects.length > 0) {
    return cachedProjects;
  }

  if (fetchPromise) {
    return fetchPromise;
  }

  fetchPromise = (async () => {
    try {
      const res = await fetch('/api/drive');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load projects');
      }
      const rawList: ProjectItem[] = (data.projects || []).filter(
        (project: ProjectItem) =>
          project.id !== undefined &&
          project.id !== null &&
          project.id !== '' &&
          project.image &&
          project.image.trim() !== '' &&
          project.category &&
          project.category.trim() !== ''
      );

      // Group images with the same base name into unified stack containers
      const grouped = groupProjectsByFileName(rawList);
      cachedProjects = grouped;
      return grouped;
    } catch (err) {
      console.error('Error fetching projects cache:', err);
      throw err;
    } finally {
      fetchPromise = null;
    }
  })();

  return fetchPromise;
}

export function getCachedProjects(): ProjectItem[] | null {
  return cachedProjects;
}

