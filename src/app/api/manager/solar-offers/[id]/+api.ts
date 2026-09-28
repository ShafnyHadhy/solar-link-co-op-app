// Manager Individual Solar Offer API Route
// GET /api/manager/solar-offers/:id — retrieve single solar offer details

import { getSolarOfferById } from "@/lib/server/services/solarOfferService";
import { BadRequestError } from "@/lib/server/utils/errors";
import { errorResponse } from "@/lib/server/utils/response";

export async function GET(
    request: Request,
    context?: { params?: { id?: string } }
) {
    try {
        // Retrieve id from route params or fallback to URL pathname
        let id = context?.params?.id;

        if (!id && request.url) {
            const urlObj = new URL(request.url);
            const segments = urlObj.pathname.split("/").filter(Boolean);
            id = segments[segments.length - 1];
        }

        if (!id) {
            throw new BadRequestError("Solar offer ID is required");
        }

        const solarOffer = await getSolarOfferById(id);

        return Response.json({
            success: true,
            offer: solarOffer,
            data: solarOffer,
        });
    } catch (error) {
        return errorResponse(error);
    }
}
