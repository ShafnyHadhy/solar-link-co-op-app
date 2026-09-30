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
        const householdId = searchParams.get("householdId");

        if (!householdId) {
            throw new BadRequestError("Query parameter 'householdId' is required.");
        }

        const requests = await getEnergyRequestsByHousehold(householdId);

        return successResponse({ requests });
    } catch (error) {
        return errorResponse(error);
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { householdId, requestedEnergyKwh, reason } = body;

        if (!householdId) {
            throw new BadRequestError("'householdId' is required in request body.");
        }

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
