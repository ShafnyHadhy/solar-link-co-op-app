// Maintenance Records API Routes
// POST /api/maintenance-records - record technician diagnosis

import { createMaintenanceDiagnosis } from "@/lib/server/services/maintenanceService";
import { BadRequestError } from "@/lib/server/utils/errors";
import {
    errorResponse,
    successResponse,
} from "@/lib/server/utils/response";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const {
            id,
            ticketId,
            technicianId,
            diagnosis,
        } = body;

        if (!ticketId || !technicianId || !diagnosis) {
            throw new BadRequestError(
                "ticketId, technicianId and diagnosis are required"
            );
        }

        const recordId =
            id ||
            `MR-${Date.now()}-${Math.floor(
                100 + Math.random() * 900
            )}`;

        const record = await createMaintenanceDiagnosis({
            id: recordId,
            ticketId,
            technicianId,
            diagnosis,
        });

        return successResponse({ record }, 201);
    } catch (error) {
        return errorResponse(error);
    }
}