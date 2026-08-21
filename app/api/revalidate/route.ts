import { NextRequest, NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";

/**
 * On-demand cache revalidation endpoint.
 * Example invocation:
 * POST /api/revalidate?secret=YOUR_SECRET_TOKEN&tag=drive-projects
 * POST /api/revalidate?secret=YOUR_SECRET_TOKEN&path=/projects
 */
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  const tag = searchParams.get("tag");
  const path = searchParams.get("path");

  const expectedSecret = process.env.REVALIDATION_SECRET || "development-revalidate-secret";

  if (secret !== expectedSecret) {
    return NextResponse.json({ message: "Invalid revalidation secret" }, { status: 401 });
  }

  try {
    if (tag) {
      revalidateTag(tag, "max");
      return NextResponse.json({ revalidated: true, tag, timestamp: Date.now() });
    }

    if (path) {
      revalidatePath(path);
      return NextResponse.json({ revalidated: true, path, timestamp: Date.now() });
    }

    // Default revalidate all portfolio projects
    revalidateTag("drive-projects", "max");
    revalidatePath("/projects");
    revalidatePath("/sitemap.xml");

    return NextResponse.json({
      revalidated: true,
      message: "Revalidated default project tags and paths",
      timestamp: Date.now(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Revalidation error";
    return NextResponse.json({ message }, { status: 500 });
  }
}
