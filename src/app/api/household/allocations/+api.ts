// Household Allocations API Route
// GET /api/household/allocations?householdId=... — retrieve all energy dispatches (allocations) for an authenticated household

import { getDispatchesByHousehold } from "@/lib/server/services/dispatchService";
import { BadRequestError } from "@/lib/server/utils/errors";
import { errorResponse, successResponse } from "@/lib/server/utils/response";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const householdId = searchParams.get("householdId") || request.headers.get("x-user-id");

        if (!householdId) {
            throw new BadRequestError("Query parameter 'householdId' or 'x-user-id' header is required.");
        }

        const allocations = await getDispatchesByHousehold(householdId);

        return successResponse({
            allocations,
            dispatches: allocations,
        });
    } catch (error) {
        return errorResponse(error);
    }
}
