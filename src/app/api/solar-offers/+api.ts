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

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const { id, ownerId, assetId, energyAmountKwh, minimumBatteryPercent, expiresAt } = body;

        if (!id || !ownerId || !assetId || energyAmountKwh === undefined) {
            throw new BadRequestError(
                "id, ownerId, assetId and energyAmountKwh are required"
            );
        }

        const requestedEnergy = Number(energyAmountKwh);

        if (requestedEnergy <= 0) {
            throw new BadRequestError("Energy amount must be greater than 0");
        }

        const surplus = await getAvailableSurplus(assetId, ownerId);

        if (requestedEnergy > surplus.surplusKwh) {
            return Response.json(
                {
                    success: false,
                    error: "Offer amount exceeds available surplus",
                    availableSurplusKwh: surplus.surplusKwh,
                },
                { status: 400 }
            );
        }

        const offer = await createSolarOffer({
            id,
            ownerId,
            energyAmountKwh: requestedEnergy.toString(),
            minimumBatteryPercent:
                minimumBatteryPercent !== undefined
                    ? minimumBatteryPercent.toString()
                    : undefined,
            status: "pending",
            expiresAt: expiresAt ? new Date(expiresAt) : undefined,
        });

        return successResponse({ offer }, 201);
    } catch (error) {
        return errorResponse(error);
    }
}
