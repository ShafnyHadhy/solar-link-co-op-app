import { requireHousehold } from "@/lib/server/auth/authorization";
import {
    cancelHouseholdEnergyRequest,
    getEnergyRequestById,
} from "@/lib/server/services/energyRequestService";
import { BadRequestError } from "@/lib/server/utils/errors";
import {
    errorResponse,
    successResponse,
} from "@/lib/server/utils/response";

export async function GET(
    request: Request,
    { id }: { id: string }
) {
    try {
        const { searchParams } = new URL(request.url);
        await requireHousehold(request, searchParams.get("householdId") || undefined);

        if (!id) {
            throw new BadRequestError("Request ID is required.");
        }

        const energyRequest = await getEnergyRequestById(id);

        return successResponse({ request: energyRequest });
    } catch (error) {
        return errorResponse(error);
    }
}

export async function PATCH(
    request: Request,
    { id }: { id: string }
) {
    try {
        const body = await request.json().catch(() => ({}));
        const authUser = await requireHousehold(request, body?.householdId);
        const householdId = authUser.id;

        const { action } = body;

        if (!id) {
            throw new BadRequestError("Request ID is required.");
        }

        if (action !== "cancel") {
            throw new BadRequestError("Unsupported action. Only 'cancel' is allowed for households.");
        }

        const updated = await cancelHouseholdEnergyRequest(id, householdId);

        return successResponse({ request: updated });
    } catch (error) {
        return errorResponse(error);
    }
}

export async function DELETE(
    request: Request,
    { id }: { id: string }
) {
    try {
        const { searchParams } = new URL(request.url);
        const authUser = await requireHousehold(request, searchParams.get("householdId") || undefined);
        const householdId = authUser.id;

        if (!id) {
            throw new BadRequestError("Request ID is required.");
        }

        const updated = await cancelHouseholdEnergyRequest(id, householdId);

        return successResponse({ request: updated });
    } catch (error) {
        return errorResponse(error);
    }
}
