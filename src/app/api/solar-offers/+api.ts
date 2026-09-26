// Solar Offers API Routes
// GET  /api/solar-offers?ownerId=... — list owner's offers
// POST /api/solar-offers             — create a new sharing offer

import {
    createSolarOffer,
    getOffersByOwner,
} from "@/lib/server/services/solarOfferService";
import { getAvailableSurplus } from "@/lib/server/services/energyService";
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

        const offers = await getOffersByOwner(ownerId);

        return successResponse({ offers });
    } catch (error) {
        return errorResponse(error);
    }
}
