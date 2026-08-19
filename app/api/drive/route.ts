import { NextResponse } from "next/server";

// Category Folder Mapping
const CATEGORY_FOLDERS: Record<string, string> = {
    graphics: "1BdHXZtv7ZB3MLm3-w0hqRautdcJ2nSeH",
    photo: "1V0RiV4vSQrdaDA0MusUM3lCmzf5pqjLy",
    video: "1LegkSLHQUz1_Yf-nzslSsyhpjo9qI6m6",
    website: "1aOWMBHdYlGcg_7_ZyKq0Q-gWiRlnkary",
};

export async function GET() {
    const apiKey = process.env.GOOGLE_DRIVE_API_KEY;

    if (!apiKey) {
        return NextResponse.json(
            { error: "GOOGLE_DRIVE_API_KEY is missing in environment variables." },
            { status: 500 }
        );
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

                return (data.files || []).map((file: any) => ({
                    id: file.id,
                    image: file.thumbnailLink
                        ? file.thumbnailLink.replace(/=s\d+/, "=s1000")
                        : "/placeholder.jpg",
                    category: category,
                }));
            }
        );

        const results = await Promise.all(fetchPromises);
        const projects = results.flat();

        return NextResponse.json({ projects });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}