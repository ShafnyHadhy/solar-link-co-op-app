// Manager Solar Offers API Route
// GET /api/manager/solar-offers — retrieve solar offers with owner details

import { getSolarOffers } from "@/lib/server/services/solarOfferService";
import { errorResponse } from "@/lib/server/utils/response";

export async function GET() {
    try {
        const offers = await getSolarOffers();

        return Response.json({
            success: true,
            offers,
        });
    } catch (error) {
        return errorResponse(error);
    }
}
