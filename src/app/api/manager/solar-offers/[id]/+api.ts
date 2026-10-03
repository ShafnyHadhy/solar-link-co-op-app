// Manager Individual Solar Offer API Route
// GET /api/manager/solar-offers/:id — retrieve single solar offer details
// PATCH /api/manager/solar-offers/:id — approve or reject a pending solar offer

import {
    approveSolarOffer,
    getSolarOfferById,
    rejectSolarOffer,
} from "@/lib/server/services/solarOfferService";
import { requireManager } from "@/lib/server/auth/authorization";
import { BadRequestError } from "@/lib/server/utils/errors";
import { errorResponse } from "@/lib/server/utils/response";

export async function GET(
    request: Request,
    context?: { params?: { id?: string } }
) {
    try {
        await requireManager(request);

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

export async function PATCH(
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

        const body = await request.json().catch(() => ({}));

        // Authenticate user and confirm authoritative PostgreSQL DB role is manager
        const manager = await requireManager(request, body?.managerId);
        const managerId = manager.id;

        if (body?.action !== "approve" && body?.action !== "reject") {
            throw new BadRequestError(
                "Invalid action. Expected { \"action\": \"approve\" } or { \"action\": \"reject\" }"
            );
        }

        const updatedOffer =
            body.action === "approve"
                ? await approveSolarOffer(id, managerId)
                : await rejectSolarOffer(id, managerId);

        const message =
            body.action === "approve"
                ? "Solar offer approved successfully"
                : "Solar offer rejected successfully";

        return Response.json({
            success: true,
            message,
            offer: updatedOffer,
            data: updatedOffer,
        });
    } catch (error) {
        return errorResponse(error);
    }
}
