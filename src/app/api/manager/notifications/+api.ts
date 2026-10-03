// Manager Notifications API Route
// GET /api/manager/notifications — retrieve alerts/notifications for manager
// PATCH /api/manager/notifications — mark an alert as read

import { requireManager } from "@/lib/server/auth/authorization";
import {
    getManagerNotifications,
    markNotificationAsRead,
} from "@/lib/server/services/notificationService";
import { BadRequestError } from "@/lib/server/utils/errors";
import { errorResponse } from "@/lib/server/utils/response";

export async function GET(request: Request) {
    try {
        await requireManager(request);

        const url = new URL(request.url);
        const userId = url.searchParams.get("userId") || undefined;
        const unreadOnly = url.searchParams.get("unreadOnly") === "true";
        const limitParam = url.searchParams.get("limit");
        const limit = limitParam ? parseInt(limitParam, 10) : undefined;

        const alerts = await getManagerNotifications(userId, {
            unreadOnly,
            limit,
        });

        return Response.json({
            success: true,
            alerts,
            notifications: alerts,
        });
    } catch (error) {
        return errorResponse(error);
    }
}

export async function PATCH(request: Request) {
    try {
        await requireManager(request);

        const body = await request.json();
        const { id } = body;

        if (!id) {
            throw new BadRequestError("Notification ID is required");
        }

        const updated = await markNotificationAsRead(id);

        return Response.json({
            success: true,
            notification: updated,
            alert: updated,
        });
    } catch (error) {
        return errorResponse(error);
    }
}
