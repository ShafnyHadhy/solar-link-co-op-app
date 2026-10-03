// Manager Dispatches API Route
// POST /api/manager/dispatches — create a new energy dispatch
// GET  /api/manager/dispatches — retrieve all dispatches with details

import { requireManager } from "@/lib/server/auth/authorization";
import {
    createDispatch,
    getDispatches,
} from "@/lib/server/services/dispatchService";
import { BadRequestError } from "@/lib/server/utils/errors";
import { errorResponse } from "@/lib/server/utils/response";

export async function GET(request: Request) {
    try {
        await requireManager(request);

        const url = new URL(request.url);
        const requestId = url.searchParams.get("requestId") || undefined;
        const offerId = url.searchParams.get("offerId") || undefined;
        const managerId = url.searchParams.get("managerId") || undefined;
        const householdId = url.searchParams.get("householdId") || undefined;

        const dispatchesList = await getDispatches({
            requestId,
            offerId,
            managerId,
            householdId,
        });

        return Response.json({
            success: true,
            dispatches: dispatchesList,
            data: dispatchesList,
        });
    } catch (error) {
        return errorResponse(error);
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));
        const manager = await requireManager(request, body?.managerId);
        const managerId = manager.id;

        const { id, offerId, requestId, dispatchedEnergyKwh, notes } = body;

        if (!offerId) {
            throw new BadRequestError("offerId is required");
        }
        if (!requestId) {
            throw new BadRequestError("requestId is required");
        }
        if (dispatchedEnergyKwh === undefined || dispatchedEnergyKwh === null) {
            throw new BadRequestError("dispatchedEnergyKwh is required");
        }

        const newDispatch = await createDispatch({
            id,
            offerId,
            requestId,
            managerId,
            dispatchedEnergyKwh,
            notes,
        });

        return Response.json(
            {
                success: true,
                message: "Energy dispatch created successfully",
                dispatch: newDispatch,
                data: newDispatch,
            },
            { status: 201 }
        );
    } catch (error) {
        return errorResponse(error);
    }
}
