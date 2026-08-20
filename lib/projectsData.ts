// lib/projectsData.ts
export interface ProjectItem {
  id: string | number;
  image: string;
  category: string;
  width?: number;
  height?: number;
  aspectRatio?: number;
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
      const fetched: ProjectItem[] = (data.projects || []).filter(
        (project: ProjectItem) =>
          project.id !== undefined &&
          project.id !== null &&
          project.id !== '' &&
          project.image &&
          project.image.trim() !== '' &&
          project.category &&
          project.category.trim() !== ''
      );
      cachedProjects = fetched;
      return fetched;
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
