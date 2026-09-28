import { getServiceTicketById } from "@/lib/server/services/maintenanceService";
import {
    errorResponse,
    successResponse,
} from "@/lib/server/utils/response";

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