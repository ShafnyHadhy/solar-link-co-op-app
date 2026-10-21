// Solar Offers API Routes
// GET  /api/solar-offers?ownerId=... — list owner's offers
// POST /api/solar-offers             — create a new sharing offer

import { requireSolarOwner } from "@/lib/server/auth/authorization";
import { getAvailableSurplus } from "@/lib/server/services/energyService";
import {
  createSolarOffer,
  getOffersByOwner,
} from "@/lib/server/services/solarOfferService";
import { BadRequestError } from "@/lib/server/utils/errors";
import { errorResponse, successResponse } from "@/lib/server/utils/response";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const authUser = await requireSolarOwner(
      request,
      url.searchParams.get("ownerId") || undefined,
    );

    const offers = await getOffersByOwner(authUser.id);

    return successResponse({ offers });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    let body: {
      id?: string;
      ownerId?: string;
      assetId?: string;
      energyAmountKwh?: number | string;
      minimumBatteryPercent?: number | string;
      expiresAt?: string;
    };

    try {
      body = await request.json();
    } catch {
      throw new BadRequestError("Request body must be valid JSON");
    }

    const authUser = await requireSolarOwner(request, body.ownerId);
    const {
      id,
      assetId,
      energyAmountKwh,
      minimumBatteryPercent,
      expiresAt,
    } = body;

    if (!id || !assetId || energyAmountKwh === undefined) {
      throw new BadRequestError(
        "id, assetId and energyAmountKwh are required",
      );
    }

    const requestedEnergy = Number(energyAmountKwh);
    if (!Number.isFinite(requestedEnergy) || requestedEnergy <= 0) {
      throw new BadRequestError("Energy amount must be a positive number");
    }

    const surplus = await getAvailableSurplus(assetId, authUser.id);
    if (requestedEnergy > surplus.surplusKwh) {
      return Response.json(
        {
          success: false,
          error: "Offer amount exceeds available surplus",
          availableSurplusKwh: surplus.surplusKwh,
        },
        { status: 400 },
      );
    }

    const offer = await createSolarOffer({
      id,
      ownerId: authUser.id,
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
