// Manager Energy Requests API Route
// GET /api/manager/energy-requests — retrieve energy requests with household details

import { getEnergyRequests } from "@/lib/server/services/energyRequestService";
import { errorResponse } from "@/lib/server/utils/response";

export async function GET() {
    try {
        const requests = await getEnergyRequests();

        return Response.json({
            success: true,
            requests,
        });
    } catch (error) {
        return errorResponse(error);
    }
}
