// Solar Assets API Routes
// GET  /api/solar-assets?ownerId=...  — list owner's solar assets
// POST /api/solar-assets              — register a new solar asset

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
                { error: "ownerId is required" },
                { status: 400 }
            );
        }

        const assets = await getAssetsByOwner(ownerId);

        return Response.json({
            success: true,
            assets,
        });
    } catch (error) {
        console.error("Failed to get solar assets:", error);

        return Response.json(
            { error: "Failed to get solar assets" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (!body.id || !body.ownerId || !body.name || !body.assetType) {
            return Response.json(
                {
                    error: "id, ownerId, name and assetType are required",
                },
                { status: 400 }
            );
        }

        const asset = await createAsset({
            id: body.id,
            ownerId: body.ownerId,
            assetType: body.assetType,
            name: body.name,
            capacityKw: body.capacityKw,
            status: body.status ?? "active",
            location: body.location,
            installedAt: body.installedAt
                ? new Date(body.installedAt)
                : undefined,
        });

        return Response.json(
            {
                success: true,
                asset,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Failed to create solar asset:", error);

        return Response.json(
            { error: "Failed to create solar asset" },
            { status: 500 }
        );
    }
}
