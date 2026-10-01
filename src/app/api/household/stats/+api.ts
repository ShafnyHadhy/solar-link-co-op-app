import { getHouseholdEnergyStats } from "@/lib/server/services/energyRequestService";
import { BadRequestError } from "@/lib/server/utils/errors";
import {
    errorResponse,
    successResponse,
} from "@/lib/server/utils/response";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const householdId = searchParams.get("householdId");

        if (!householdId) {
            throw new BadRequestError("Query parameter 'householdId' is required.");
        }

        const stats = await getHouseholdEnergyStats(householdId);

        return successResponse({ stats });
    } catch (error) {
        return errorResponse(error);
    }
}
