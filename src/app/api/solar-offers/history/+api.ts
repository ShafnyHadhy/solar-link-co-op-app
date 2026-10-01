// Solar Owner Sharing History API Route
// GET /api/solar-offers/history?ownerId=... — retrieve completed dispatches & earned credits summary

import {
    getOwnerSharingHistory,
    getOwnerOfferSummary,
} from "@/lib/server/services/solarOfferService";
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

        const history = await getOwnerSharingHistory(ownerId);
        const summary = await getOwnerOfferSummary(ownerId);

        return successResponse({
            history,
            summary,
        });
    } catch (error) {
        return errorResponse(error);
    }
}
