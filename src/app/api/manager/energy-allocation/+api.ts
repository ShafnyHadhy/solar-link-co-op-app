// Manager Community Energy Allocation API Route
// GET /api/manager/energy-allocation?date=YYYY-MM-DD
// Returns real community energy allocation from dispatches for Today (or selected date) vs Yesterday

import { getCommunityEnergyAllocation } from "@/lib/server/services/dispatchService";
import { errorResponse } from "@/lib/server/utils/response";

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const date = url.searchParams.get("date") || undefined;

        const allocationData = await getCommunityEnergyAllocation({ date });

        return Response.json({
            success: true,
            data: allocationData,
            ...allocationData,
        });
    } catch (error) {
        return errorResponse(error);
    }
}
