// Maintenance Records API Routes
// POST /api/maintenance-records - record technician diagnosis

import {
    createMaintenanceDiagnosis,
    getMaintenanceHistory,
    updateMaintenanceDiagnosis,
    updateMaintenanceNotes,
    updateMaintenanceParts,
} from "@/lib/server/services/maintenanceService";
import { BadRequestError } from "@/lib/server/utils/errors";
import {
    errorResponse,
    successResponse,
} from "@/lib/server/utils/response";

// CESA-209 - Get maintenance history for a service ticket
export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const ticketId =
            url.searchParams.get("ticketId");

        if (!ticketId) {
            throw new BadRequestError(
                "ticketId is required"
            );
        }

        const records =
            await getMaintenanceHistory(ticketId);

        return successResponse({ records });
    } catch (error) {
        return errorResponse(error);
    }
}

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


// CESA-255, CESA-206 & CESA-207 - Update maintenance record
export async function PATCH(request: Request) {
    try {
        const body = await request.json();

        const {
            recordId,
            diagnosis,
            partsUsed,
            notes,
        } = body;

        if (!recordId) {
            throw new BadRequestError(
                "recordId is required"
            );
        }

        let record;

        // CESA-255 - Update diagnosis
        if (
            typeof diagnosis === "string" &&
            diagnosis.trim()
        ) {
            record = await updateMaintenanceDiagnosis(
                recordId,
                diagnosis.trim()
            );
        }

        // CESA-257 / existing CESA-206 - Replacement parts
        else if (
            typeof partsUsed === "string" &&
            partsUsed.trim()
        ) {
            record = await updateMaintenanceParts(
                recordId,
                partsUsed.trim()
            );
        }

        // CESA-256 / existing CESA-207 - Maintenance notes
        else if (
            typeof notes === "string" &&
            notes.trim()
        ) {
            record = await updateMaintenanceNotes(
                recordId,
                notes.trim()
            );
        } else {
            throw new BadRequestError(
                "diagnosis, partsUsed or notes is required"
            );
        }

        if (!record) {
            return Response.json(
                {
                    success: false,
                    message: "Maintenance record not found",
                },
                { status: 404 }
            );
        }

        return successResponse({ record });
    } catch (error) {
        return errorResponse(error);
    }
}