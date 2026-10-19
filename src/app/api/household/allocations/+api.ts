import { requireHousehold } from "@/lib/server/auth/authorization";
import { getDispatchesByHousehold } from "@/lib/server/services/dispatchService";
import { errorResponse, successResponse } from "@/lib/server/utils/response";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const authUser = await requireHousehold(request, searchParams.get("householdId") || undefined);
        const householdId = authUser.id;

        const allocations = await getDispatchesByHousehold(householdId);

        return successResponse({
            allocations,
            dispatches: allocations,
        });
    } catch (error) {
        return errorResponse(error);
    }
}
