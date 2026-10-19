// Manager Solar Offers API Route
// GET /api/manager/solar-offers — retrieve solar offers with owner details
// GET /api/manager/solar-offers?view=reserve — retrieve community energy reserve

import { requireManager } from "@/lib/server/auth/authorization";
import { getCommunityReserve, getSolarOffers } from "@/lib/server/services/solarOfferService";
import { errorResponse } from "@/lib/server/utils/response";

export async function GET(request: Request) {
    try {
        await requireManager(request);

        const url = new URL(request.url);
        const view = url.searchParams.get("view") || url.searchParams.get("summary");

        if (view === "reserve") {
            const reserveData = await getCommunityReserve();
            return Response.json({
                success: true,
                data: reserveData,
                ...reserveData,
            });
        }

        const offers = await getSolarOffers();

        return Response.json({
            success: true,
            offers,
        });
    } catch (error) {
        return errorResponse(error);
    }
}

