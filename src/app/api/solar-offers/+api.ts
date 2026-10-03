import { requireSolarOwner } from "@/lib/server/auth/authorization";
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
        const authUser = await requireSolarOwner(request, url.searchParams.get("ownerId") || undefined);
        const ownerId = authUser.id;

        const offers = await getOffersByOwner(ownerId);

        return successResponse({ offers });
    } catch (error) {
        return errorResponse(error);
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));
        const authUser = await requireSolarOwner(request, body?.ownerId);
        const ownerId = authUser.id;

        const { id, assetId, energyAmountKwh, minimumBatteryPercent, expiresAt } = body;

        if (!id || !assetId || energyAmountKwh === undefined) {
            throw new BadRequestError(
                "id, assetId and energyAmountKwh are required"
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
