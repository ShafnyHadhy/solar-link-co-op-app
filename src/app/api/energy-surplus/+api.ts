import { requireSolarOwner } from "@/lib/server/auth/authorization";
import { getAvailableSurplus } from "@/lib/server/services/energyService";
import { BadRequestError } from "@/lib/server/utils/errors";
import {
    errorResponse,
    successResponse,
} from "@/lib/server/utils/response";

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        await requireSolarOwner(request, url.searchParams.get("ownerId") || undefined);

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
