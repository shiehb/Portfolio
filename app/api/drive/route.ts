import { NextResponse } from "next/server";

// Category Folder Mapping
const CATEGORY_FOLDERS: Record<string, string> = {
    graphics: "1BdHXZtv7ZB3MLm3-w0hqRautdcJ2nSeH",
    photo: "1V0RiV4vSQrdaDA0MusUM3lCmzf5pqjLy",
    video: "1LegkSLHQUz1_Yf-nzslSsyhpjo9qI6m6",
    website: "1aOWMBHdYlGcg_7_ZyKq0Q-gWiRlnkary",
};

const FALLBACK_PROJECTS = [
    {
        id: "mock-g1",
        category: "graphics",
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop"
    },
    {
        id: "mock-g2",
        category: "graphics",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop"
    },
    {
        id: "mock-g3",
        category: "graphics",
        image: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?q=80&w=1000&auto=format&fit=crop"
    },
    {
        id: "mock-p1",
        category: "photo",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop"
    },
    {
        id: "mock-p2",
        category: "photo",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop"
    },
    {
        id: "mock-p3",
        category: "photo",
        image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=1000&auto=format&fit=crop"
    },
    {
        id: "mock-v1",
        category: "video",
        image: "https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=1000&auto=format&fit=crop"
    },
    {
        id: "mock-v2",
        category: "video",
        image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1000&auto=format&fit=crop"
    },
    {
        id: "mock-v3",
        category: "video",
        image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1000&auto=format&fit=crop"
    },
    {
        id: "mock-w1",
        category: "website",
        image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1000&auto=format&fit=crop"
    },
    {
        id: "mock-w2",
        category: "website",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop"
    },
    {
        id: "mock-w3",
        category: "website",
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop"
    }
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
        return NextResponse.json({
            projects: FALLBACK_PROJECTS,
            warning: "GOOGLE_DRIVE_API_KEY not configured, serving fallback gallery."
        });
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
                        ? file.thumbnailLink.replace(/=s\d+/, "=s600")
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
        console.warn("Drive fetch error, using fallback:", errorMsg);
        return NextResponse.json({ projects: FALLBACK_PROJECTS });
    }
}