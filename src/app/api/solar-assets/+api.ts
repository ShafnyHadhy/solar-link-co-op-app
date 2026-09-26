// Solar Asset API Routes
// GET  /api/solar-assets?ownerId=...  — list owner's assets
// POST /api/solar-assets              — create new asset

import {
    createAsset,
    getAssetsByOwner,
} from "@/lib/server/services/solarService";
import { BadRequestError } from "@/lib/server/utils/errors";
import {
    errorResponse,
    successResponse,
} from "@/lib/server/utils/response";

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const ownerId = url.searchParams.get("ownerId");

        if (!ownerId) {
            throw new BadRequestError("ownerId is required");
        }

        const assets = await getAssetsByOwner(ownerId);

        return successResponse({ assets });
    } catch (error) {
        return errorResponse(error);
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (!body.id || !body.ownerId || !body.name || !body.assetType) {
            throw new BadRequestError(
                "id, ownerId, name and assetType are required"
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

        return successResponse({ asset }, 201);
    } catch (error) {
        return errorResponse(error);
    }
}
