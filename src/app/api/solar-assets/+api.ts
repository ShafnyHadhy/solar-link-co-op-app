// Solar Asset API Routes
// GET  /api/solar-assets?ownerId=...  — list owner's assets
// POST /api/solar-assets              — create new asset

import {
    createAsset,
    getAssetsByOwner,
} from "@/lib/server/services/solarService";

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const ownerId = url.searchParams.get("ownerId");

        if (!ownerId) {
            return Response.json(
                { success: false, error: "ownerId is required" },
                { status: 400 }
            );
        }

        const assets = await getAssetsByOwner(ownerId);

        return Response.json({ success: true, assets });
    } catch (error) {
        console.error("[solar-assets GET]", error);
        return Response.json(
            { success: false, error: "Failed to get solar assets" },
            { status: 500 }
        );
    }
}
