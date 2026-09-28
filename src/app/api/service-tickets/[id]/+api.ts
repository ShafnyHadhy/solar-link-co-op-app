import {
    getServiceTicketById,
    updateServiceTicketStatus,
} from "@/lib/server/services/maintenanceService";
import {
    errorResponse,
    successResponse,
} from "@/lib/server/utils/response";

const validStatuses = [
    "open",
    "assigned",
    "in_progress",
    "resolved",
    "closed",
] as const;

type TicketStatus = (typeof validStatuses)[number];

export async function GET(
    _request: Request,
    { id }: { id: string }
) {
    try {
        const ticket = await getServiceTicketById(id);

        if (!ticket) {
            return Response.json(
                {
                    success: false,
                    message: "Service ticket not found",
                },
                { status: 404 }
            );
        }

        return successResponse({ ticket });
    } catch (error) {
        return errorResponse(error);
    }
}

export async function PATCH(
    request: Request,
    { id }: { id: string }
) {
    try {
        const body = await request.json();
        const status = body.status as TicketStatus;

        if (
            !status ||
            !validStatuses.includes(status)
        ) {
            return Response.json(
                {
                    success: false,
                    message: "Invalid ticket status",
                },
                { status: 400 }
            );
        }

        const ticket =
            await updateServiceTicketStatus(
                id,
                status
            );

        if (!ticket) {
            return Response.json(
                {
                    success: false,
                    message: "Service ticket not found",
                },
                { status: 404 }
            );
        }

        return successResponse({ ticket });
    } catch (error) {
        return errorResponse(error);
    }
}