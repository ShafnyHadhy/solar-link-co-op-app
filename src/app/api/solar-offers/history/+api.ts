import { requireSolarOwner } from "@/lib/server/auth/authorization";
import {
    getOwnerSharingHistory,
    getOwnerOfferSummary,
} from "@/lib/server/services/solarOfferService";
import {
    errorResponse,
    successResponse,
} from "@/lib/server/utils/response";

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const authUser = await requireSolarOwner(request, url.searchParams.get("ownerId") || undefined);
        const ownerId = authUser.id;

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
