import { requireSolarOwner } from "@/lib/server/auth/authorization";
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
    request: Request,
    { id }: Record<string, string>
) {
    try {
        const url = new URL(request.url);
        await requireSolarOwner(request, url.searchParams.get("ownerId") || undefined);

        const existing = await getOfferById(id);

        if (!existing) {
            throw new NotFoundError("Solar offer not found");
        }

        if (existing.status !== "pending") {
            throw new BadRequestError(
                "Only pending offers can be cancelled"
            );
        }

        const offer = await cancelSolarOffer(id);

        return successResponse({ offer });
    } catch (error) {
        return errorResponse(error);
    }
}
