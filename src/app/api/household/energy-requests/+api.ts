import { requireHousehold } from "@/lib/server/auth/authorization";
import {
    createHouseholdEnergyRequest,
    getEnergyRequestsByHousehold,
} from "@/lib/server/services/energyRequestService";
import { BadRequestError } from "@/lib/server/utils/errors";
import {
    errorResponse,
    successResponse,
} from "@/lib/server/utils/response";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const authUser = await requireHousehold(request, searchParams.get("householdId") || undefined);
        const householdId = authUser.id;

        const requests = await getEnergyRequestsByHousehold(householdId);

        return successResponse({ requests });
    } catch (error) {
        return errorResponse(error);
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));
        const authUser = await requireHousehold(request, body?.householdId);
        const householdId = authUser.id;

        const { requestedEnergyKwh, reason } = body;

        if (requestedEnergyKwh === undefined || requestedEnergyKwh === null || requestedEnergyKwh === "") {
            throw new BadRequestError("'requestedEnergyKwh' is required in request body.");
        }

        const newRequest = await createHouseholdEnergyRequest({
            householdId,
            requestedEnergyKwh,
            reason,
        });

        return successResponse({ request: newRequest }, 201);
    } catch (error) {
        return errorResponse(error);
    }
}
