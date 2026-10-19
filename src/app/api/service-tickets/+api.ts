// Service Tickets API Routes
// GET  /api/service-tickets?reportedBy=... — list user's tickets or all tickets
// POST /api/service-tickets               — create a new maintenance ticket

import {
    createServiceTicket,
    getAllServiceTickets,
    getAssignedServiceTickets,
    getServiceTicketsByOwner,
} from "@/lib/server/services/maintenanceService";
import { BadRequestError } from "@/lib/server/utils/errors";
import {
    errorResponse,
    successResponse,
} from "@/lib/server/utils/response";

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);

        const reportedBy =
            url.searchParams.get("reportedBy");

        const assignedTechnicianId =
            url.searchParams.get(
                "assignedTechnicianId"
            );

        // CESA-253 - Retrieve tickets assigned to technician
        if (assignedTechnicianId) {
            const tickets =
                await getAssignedServiceTickets(
                    assignedTechnicianId
                );

            return successResponse({ tickets });
        }

        if (reportedBy) {
            const tickets =
                await getServiceTicketsByOwner(
                    reportedBy
                );

            return successResponse({ tickets });
        }

        const tickets =
            await getAllServiceTickets();

        return successResponse({ tickets });
    } catch (error) {
        return errorResponse(error);
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            id,
            reportedBy,
            title,
            description,
            priority,
            assetId,
            location,
            assignedTechnicianId,
        } = body;

        if (!reportedBy || !title) {
            throw new BadRequestError("reportedBy and title are required");
        }

        const ticketId = id || `SR-${Math.floor(100 + Math.random() * 900)}`;

        const ticket = await createServiceTicket({
            id: ticketId,
            reportedBy,
            title,
            description,
            priority: priority || "medium",
            status: "open",
            assetId,
            location,
            assignedTechnicianId: assignedTechnicianId || "user_3IHfICokymVrhEPN8Duj05YgYYO", // Azmil Ahamed
        });

        return successResponse({ ticket }, 201);
    } catch (error) {
        return errorResponse(error);
    }
}