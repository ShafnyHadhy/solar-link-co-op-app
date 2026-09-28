// Manager Individual Energy Request API Route
// GET /api/manager/energy-requests/:id — retrieve single energy request details

import { getEnergyRequestById } from "@/lib/server/services/energyRequestService";
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
            throw new BadRequestError("Energy request ID is required");
        }



        const energyRequest = await getEnergyRequestById(id);

        return Response.json({
            success: true,
            request: energyRequest,
            data: energyRequest,
        });
    } catch (error) {
        return errorResponse(error);
    }
}
