// Cancel Solar Offer Route
// PATCH /api/solar-offers/:id/cancel — cancel a pending solar offer

import {
    cancelSolarOffer,
    getOfferById,
} from "@/lib/server/services/solarOfferService";
import { BadRequestError, NotFoundError } from "@/lib/server/utils/errors";
import {
    errorResponse,
    successResponse,
} from "@/lib/server/utils/response";

export async function PATCH(
    _request: Request,
    context: { params: { id: string } }
) {
    try {
        const existing = await getOfferById(context.params.id);

        if (!existing) {
            throw new NotFoundError("Solar offer not found");
        }

        if (existing.status !== "pending") {
            throw new BadRequestError(
                "Only pending offers can be cancelled"
            );
        }

        const offer = await cancelSolarOffer(context.params.id);

        return successResponse({ offer });
    } catch (error) {
        return errorResponse(error);
    }
}
