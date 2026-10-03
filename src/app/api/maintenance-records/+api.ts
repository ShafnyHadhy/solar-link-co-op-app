import { requireTechnician } from "@/lib/server/auth/authorization";
import {
    createMaintenanceDiagnosis,
    getMaintenanceHistory,
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
        await requireTechnician(request);

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
        const body = await request.json().catch(() => ({}));

        const technician = await requireTechnician(request, body?.technicianId);
        const technicianId = technician.id;

        const {
            id,
            ticketId,
            diagnosis,
        } = body;

        if (!ticketId || !diagnosis) {
            throw new BadRequestError(
                "ticketId and diagnosis are required"
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

// CESA-206 & CESA-207 - Update maintenance record
export async function PATCH(request: Request) {
    try {
        await requireTechnician(request);

        const body = await request.json();

        const {
            recordId,
            partsUsed,
            notes,
        } = body;

        if (!recordId) {
            throw new BadRequestError(
                "recordId is required"
            );
        }

        let record;

        // CESA-206 - Record replaced parts
        if (
            typeof partsUsed === "string" &&
            partsUsed.trim()
        ) {
            record = await updateMaintenanceParts(
                recordId,
                partsUsed.trim()
            );
        }

        // CESA-207 - Record maintenance notes
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
                "partsUsed or notes is required"
            );
        }

        if (!record) {
            return Response.json(
                {
                    success: false,
                    message:
                        "Maintenance record not found",
                },
                { status: 404 }
            );
        }

        return successResponse({ record });
    } catch (error) {
        return errorResponse(error);
    }
}