import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getCachedServerProjects } from "@/lib/serverProjects";
import { getBaseUrl, siteConfig } from "@/lib/metadata";
import { ArrowLeft } from "lucide-react";

// Revalidate this page in background every 10 minutes
export const revalidate = 600;

// Allow on-demand generation for slugs not pre-rendered at build time
export const dynamicParams = true;

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

/**
 * 1. Build-Time Static Generation
 * Fetches all project IDs/slugs at build time to output static HTML
 */
export async function generateStaticParams() {
  const projects = await getCachedServerProjects();

  return projects.map((project) => ({
    slug: String(project.id).toLowerCase().replace(/^group-/, ""),
  }));
}

/**
 * Helper to resolve project by slug
 */
async function getProjectFromSlug(slug: string) {
  const projects = await getCachedServerProjects();
  const normalizedSlug = slug.toLowerCase();

  return (
    projects.find((p) => {
      const pId = String(p.id).toLowerCase().replace(/^group-/, "");
      return pId === normalizedSlug;
    }) || null
  );
}

/**
 * 2. Shared Dynamic Metadata Generation
 */
export async function generateMetadata(
  props: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await props.params;
  const project = await getProjectFromSlug(slug);

  if (!project) {
    return {
      title: "Project Not Found",
      description: "The requested project could not be found.",
      robots: { index: false, follow: false },
    };
  }

  const baseUrl = getBaseUrl();
  const canonicalUrl = `${baseUrl}/projects/${slug}`;
  const title = project.title || project.name || "Project Details";
  const description = `${title} - Selected project showcase by ${siteConfig.name}.`;
  const parentMetadata = await parent;
  const previousImages = parentMetadata.openGraph?.images || [];

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      url: canonicalUrl,
      type: "article",
      images: [
        {
          url: project.image,
          width: 1200,
          height: 630,
          alt: title,
        },
        ...previousImages,
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteConfig.name}`,
      description,
      images: [project.image],
    },
  };
}

/**
 * 3. Dynamic Page Component with notFound() handling
 */
export default async function ProjectDetailPage(props: PageProps) {
  const { slug } = await props.params;
  const project = await getProjectFromSlug(slug);

  // Trigger custom 404 boundary if not found
  if (!project) {
    notFound();
  }

  const title = project.title || project.name || "Project Showcase";
  const images = project.images && project.images.length > 0 ? project.images : [project.image];

  return (
    <article className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto font-display text-white">
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-400 hover:text-[#fd551d] transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Projects
      </Link>

      <header className="mb-10">
        <span className="text-xs uppercase tracking-widest text-[#fd551d] font-bold">
          {project.category}
        </span>
        <h1 className="text-3xl sm:text-5xl font-normal tracking-tight uppercase mt-2">
          {title}
        </h1>
      </header>

      {/* Media Display */}
      <div className="space-y-6">
        {project.isVideo && project.videoUrl ? (
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-zinc-800">
            <video
              src={project.videoUrl}
              controls
              poster={project.image}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {images.map((imgSrc, idx) => (
              <div
                key={imgSrc + idx}
                className="relative w-full aspect-[4/3] sm:aspect-[16/10] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800"
              >
                <Image
                  src={imgSrc}
                  alt={`${title} - image ${idx + 1}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 1024px"
                  className="object-cover"
                  priority={idx === 0}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
