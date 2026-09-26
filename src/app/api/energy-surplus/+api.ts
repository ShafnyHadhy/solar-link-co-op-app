// Energy Surplus API Route
// GET /api/energy-surplus?assetId=... — calculate available surplus for an asset

import { getAvailableSurplus } from "@/lib/server/services/energyService";
import { BadRequestError } from "@/lib/server/utils/errors";
import {
    errorResponse,
    successResponse,
} from "@/lib/server/utils/response";

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const assetId = url.searchParams.get("assetId");

        if (!assetId) {
            throw new BadRequestError("assetId is required");
        }

        const surplus = await getAvailableSurplus(assetId);

        return successResponse({ surplus });
    } catch (error) {
        return errorResponse(error);
    }
}
