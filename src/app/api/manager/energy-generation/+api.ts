// Manager Community Energy Generation API Route
// GET /api/manager/energy-generation?date=YYYY-MM-DD
// Returns real community solar energy generation for Today (or selected date) vs Yesterday

import { getCommunityEnergyGeneration } from "@/lib/server/services/energyService";
import { errorResponse } from "@/lib/server/utils/response";

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const date = url.searchParams.get("date") || undefined;

        const generationData = await getCommunityEnergyGeneration({ date });

        return Response.json({
            success: true,
            data: generationData,
            ...generationData,
        });
    } catch (error) {
        return errorResponse(error);
    }
}
