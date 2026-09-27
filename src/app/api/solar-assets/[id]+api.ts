// Solar Asset [id] API Routes
// GET /api/solar-assets/:id  — get single asset
// PUT /api/solar-assets/:id  — update asset

import {
    getAssetById,
    updateAsset,
} from "@/lib/server/services/solarService";
import {
    errorResponse,
    successResponse,
} from "@/lib/server/utils/response";

export async function GET(
    _request: Request,
    context: { params: { id: string } }
) {
    try {
        const asset = await getAssetById(context.params.id);

        return successResponse({ asset });
    } catch (error) {
        return errorResponse(error);
    }
}

export async function PUT(
    request: Request,
    context: { params: { id: string } }
) {
    try {
        const body = await request.json();

        const asset = await updateAsset(context.params.id, {
            name: body.name,
            assetType: body.assetType,
            capacityKw: body.capacityKw,
            status: body.status,
            location: body.location,
            installedAt: body.installedAt
                ? new Date(body.installedAt)
                : undefined,
        });

        if (!asset) {
            return Response.json(
                { success: false, error: "Solar asset not found" },
                { status: 404 }
            );
        }

        return successResponse({ asset });
    } catch (error) {
        return errorResponse(error);
    }
}
