// Notifications API Route
// GET   /api/notifications — retrieve notifications for authenticated user
// PATCH /api/notifications — mark notification(s) as read

import {
    getNotificationsForUser,
    getUnreadNotificationsForUser,
    markAllNotificationsAsRead,
    markNotificationAsRead,
} from "@/lib/server/services/notificationService";
import { BadRequestError, UnauthorizedError } from "@/lib/server/utils/errors";
import { errorResponse, successResponse } from "@/lib/server/utils/response";

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const userId =
            url.searchParams.get("userId") ||
            request.headers.get("x-user-id") ||
            undefined;

        if (!userId) {
            throw new UnauthorizedError(
                "Authentication required: user ID is missing"
            );
        }

        const unreadOnly = url.searchParams.get("unreadOnly") === "true";
        const limitParam = url.searchParams.get("limit");
        const limit = limitParam ? parseInt(limitParam, 10) : undefined;

        // Retrieve notifications strictly belonging to this authenticated user
        const notifications = await getNotificationsForUser(userId, {
            unreadOnly,
            limit,
        });

        // Also fetch total unread count for badge indicators
        const unreadNotifications = await getUnreadNotificationsForUser(userId);
        const unreadCount = unreadNotifications.length;

        return Response.json({
            success: true,
            notifications,
            unreadCount,
            data: {
                notifications,
                unreadCount,
            },
        });
    } catch (error) {
        return errorResponse(error);
    }
}

export async function PATCH(request: Request) {
    try {
        const url = new URL(request.url);
        const headerUserId = request.headers.get("x-user-id");
        const body = await request.json().catch(() => ({}));

        const userId = body.userId || headerUserId || url.searchParams.get("userId");
        const notificationId = body.id || body.notificationId;
        const markAll = body.markAll === true;

        if (markAll) {
            if (!userId) {
                throw new BadRequestError("userId is required to mark all notifications as read");
            }

            const updated = await markAllNotificationsAsRead(userId);
            return successResponse({
                message: "All notifications marked as read",
                updatedCount: updated.length,
            });
        }

        if (!notificationId) {
            throw new BadRequestError("notificationId or id is required");
        }

        const updated = await markNotificationAsRead(notificationId, userId || undefined);

        return successResponse({
            notification: updated,
        });
    } catch (error) {
        return errorResponse(error);
    }
}
