// Manager Dispatches Validate API Route
// POST /api/manager/dispatches/validate — validate available energy and dispatch parameters

import { validateDispatchEnergy } from "@/lib/server/services/dispatchService";
import { BadRequestError } from "@/lib/server/utils/errors";
import { errorResponse } from "@/lib/server/utils/response";

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));
        const { offerId, requestId, dispatchedEnergyKwh, allocationAmountKwh } = body;
        const amount = dispatchedEnergyKwh ?? allocationAmountKwh;

        if (!offerId) {
            throw new BadRequestError("offerId is required");
        }
        if (!requestId) {
            throw new BadRequestError("requestId is required");
        }
        if (amount === undefined || amount === null) {
            throw new BadRequestError("dispatchedEnergyKwh is required");
        }

        const validation = await validateDispatchEnergy({
            offerId,
            requestId,
            dispatchedEnergyKwh: amount,
        });

        return Response.json({
            success: true,
            valid: true,
            message: "Dispatch parameters are valid and available for execution",
            validation,
            data: validation,
        });
    } catch (error) {
        return errorResponse(error);
    }
}
