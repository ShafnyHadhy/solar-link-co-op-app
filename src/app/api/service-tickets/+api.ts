import { getServiceTickets } from "@/lib/server/services/maintenanceService";
import {
    errorResponse,
    successResponse,
} from "@/lib/server/utils/response";

export async function GET() {
    try {
        const tickets = await getServiceTickets();

        return successResponse({ tickets });
    } catch (error) {
        return errorResponse(error);
    }
}