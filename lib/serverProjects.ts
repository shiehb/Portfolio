import { cache } from "react";
import { ProjectItem, groupProjectsByFileName, transformDriveAssetUrl, getGoogleDriveVideoUrl } from "@/lib/projectsData";
import { getBaseUrl } from "@/lib/metadata";

/**
 * Server-side deduplicated project fetcher.
 * React cache() ensures that layout.tsx, page.tsx, and generateMetadata
 * share the exact same promise during a single server render lifecycle.
 */
export const getCachedServerProjects = cache(async (): Promise<ProjectItem[]> => {
  const baseUrl = getBaseUrl();

  try {
    const res = await fetch(`${baseUrl}/api/drive`, {
      next: {
        revalidate: 600,
        tags: ["drive-projects"],
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch server projects: ${res.statusText}`);
    }

    const data = await res.json();
    const rawList: ProjectItem[] = (data.projects || []).map((project: ProjectItem) => {
      const isVideo =
        Boolean(project.isVideo) ||
        project.category === "video" ||
        Boolean(project.mimeType?.startsWith("video/")) ||
        Boolean(project.videoUrl?.match(/\.(mp4|webm|mov|ogg)($|\?)/i)) ||
        Boolean(project.name?.match(/\.(mp4|webm|mov|ogg)($|\?)/i));

      const image = transformDriveAssetUrl(project.image, false);
      const images = project.images ? project.images.map((img) => transformDriveAssetUrl(img, false)) : undefined;
      const videoUrl = isVideo
        ? project.videoUrl
          ? transformDriveAssetUrl(project.videoUrl, true)
          : typeof project.id === "string"
          ? getGoogleDriveVideoUrl(project.id)
          : undefined
        : undefined;

      return {
        ...project,
        image,
        images,
        isVideo,
        videoUrl,
      };
    }).filter(
      (project: ProjectItem) =>
        project.id !== undefined &&
        project.id !== null &&
        project.id !== "" &&
        project.image &&
        project.image.trim() !== "" &&
        project.category &&
        project.category.trim() !== ""
    );

    return groupProjectsByFileName(rawList);
  } catch (error) {
    console.error("Error in getCachedServerProjects:", error);
    return [];
  }
});
