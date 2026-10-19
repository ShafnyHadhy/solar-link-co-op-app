import { requireHousehold } from "@/lib/server/auth/authorization";
import { getHouseholdEnergyStats } from "@/lib/server/services/energyRequestService";
import {
    errorResponse,
    successResponse,
} from "@/lib/server/utils/response";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const authUser = await requireHousehold(request, searchParams.get("householdId") || undefined);
        const householdId = authUser.id;

        const stats = await getHouseholdEnergyStats(householdId);

        return successResponse({ stats });
    } catch (error) {
        return errorResponse(error);
    }
}
