import { NextResponse } from "next/server";

// Category Folder Mapping
const CATEGORY_FOLDERS: Record<string, string> = {
    graphics: "1BdHXZtv7ZB3MLm3-w0hqRautdcJ2nSeH",
    photo: "1V0RiV4vSQrdaDA0MusUM3lCmzf5pqjLy",
    video: "1LegkSLHQUz1_Yf-nzslSsyhpjo9qI6m6",
    website: "1aOWMBHdYlGcg_7_ZyKq0Q-gWiRlnkary",
};

// Fallback high-resolution projects for Jericho Urbano portfolio when Drive API key is pending
const FALLBACK_PROJECTS = [
    {
        id: "fb-g-1",
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
        category: "graphics",
    },
    {
        id: "fb-p-1",
        image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1200&auto=format&fit=crop",
        category: "photo",
    },
    {
        id: "fb-v-1",
        image: "https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=1200&auto=format&fit=crop",
        category: "video",
    },
    {
        id: "fb-w-1",
        image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1200&auto=format&fit=crop",
        category: "website",
    },
    {
        id: "fb-g-2",
        image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=1200&auto=format&fit=crop",
        category: "graphics",
    },
    {
        id: "fb-p-2",
        image: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?q=80&w=1200&auto=format&fit=crop",
        category: "photo",
    },
    {
        id: "fb-v-2",
        image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1200&auto=format&fit=crop",
        category: "video",
    },
    {
        id: "fb-w-2",
        image: "https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=1200&auto=format&fit=crop",
        category: "website",
    },
    {
        id: "fb-g-3",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop",
        category: "graphics",
    },
    {
        id: "fb-p-3",
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&auto=format&fit=crop",
        category: "photo",
    },
    {
        id: "fb-v-3",
        image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=1200&auto=format&fit=crop",
        category: "video",
    },
    {
        id: "fb-w-3",
        image: "https://images.unsplash.com/photo-1522542550221-31fd19575a2d?q=80&w=1200&auto=format&fit=crop",
        category: "website",
    },
];

interface DriveFile {
    id: string;
    name?: string;
    mimeType?: string;
    thumbnailLink?: string;
}

export async function GET() {
    const apiKey = process.env.GOOGLE_DRIVE_API_KEY;

    if (!apiKey) {
        return NextResponse.json({ projects: FALLBACK_PROJECTS });
    }

    try {
        // Fetch files from each subfolder concurrently
        const fetchPromises = Object.entries(CATEGORY_FOLDERS).map(
            async ([category, folderId]) => {
                const query = `'${folderId}' in parents and mimeType != 'application/vnd.google-apps.folder' and trashed = false`;
                const fields = "files(id, name, mimeType, thumbnailLink)";
                const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
                    query
                )}&fields=${encodeURIComponent(fields)}&key=${apiKey}`;

                const res = await fetch(url, { next: { revalidate: 10 } });
                const data = await res.json();

                if (!res.ok) {
                    console.error(`Error fetching category ${category}:`, data.error?.message);
                    return [];
                }

                return (data.files || []).map((file: DriveFile) => ({
                    id: file.id,
                    image: file.thumbnailLink
                        ? file.thumbnailLink.replace(/=s\d+/, "=s1200")
                        : "/placeholder.jpg",
                    category: category,
                }));
            }
        );

        const results = await Promise.all(fetchPromises);
        const projects = results.flat();

        if (projects.length === 0) {
            return NextResponse.json({ projects: FALLBACK_PROJECTS });
        }

        return NextResponse.json({ projects });
    } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : "Unknown error";
        console.error("Drive fetch error:", errorMsg);
        return NextResponse.json({ projects: FALLBACK_PROJECTS });
    }
}
