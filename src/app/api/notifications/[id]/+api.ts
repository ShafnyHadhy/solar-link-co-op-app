// Individual Notification API Route
// GET   /api/notifications/:id — retrieve single notification (with ownership check)
// PATCH /api/notifications/:id — mark single notification as read (with strict ownership check)

import { db } from "@/lib/server/db/client";
import { notifications } from "@/lib/server/db/schema";
import { markNotificationAsRead } from "@/lib/server/services/notificationService";
import { BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError } from "@/lib/server/utils/errors";
import { errorResponse, successResponse } from "@/lib/server/utils/response";
import { eq } from "drizzle-orm";

export async function GET(
    request: Request,
    context?: { params?: { id?: string } }
) {
    try {
        let id = context?.params?.id;

        if (!id && request.url) {
            const urlObj = new URL(request.url);
            const segments = urlObj.pathname.split("/").filter(Boolean);
            id = segments[segments.length - 1];
        }

        if (!id) {
            throw new BadRequestError("Notification ID is required");
        }

        const url = new URL(request.url);
        const headerUserId = request.headers.get("x-user-id");
        const userId = headerUserId || url.searchParams.get("userId");

        if (!userId) {
            throw new UnauthorizedError(
                "Authentication required: user ID is missing"
            );
        }

        const [notification] = await db
            .select()
            .from(notifications)
            .where(eq(notifications.id, id))
            .limit(1);

        if (!notification) {
            throw new NotFoundError("Notification not found");
        }

        if (notification.userId !== userId) {
            throw new ForbiddenError(
                "Forbidden: You cannot view another user's notification"
            );
        }

        return successResponse({
            notification,
        });
    } catch (error) {
        return errorResponse(error);
    }
}

export async function PATCH(
    request: Request,
    context?: { params?: { id?: string } }
) {
    try {
        let id = context?.params?.id;

        if (!id && request.url) {
            const urlObj = new URL(request.url);
            const segments = urlObj.pathname.split("/").filter(Boolean);
            id = segments[segments.length - 1];
        }

        if (!id) {
            throw new BadRequestError("Notification ID is required");
        }

        const url = new URL(request.url);
        const headerUserId = request.headers.get("x-user-id");
        const body = await request.json().catch(() => ({}));

        const userId = headerUserId || body?.userId || url.searchParams.get("userId");

        if (!userId) {
            throw new UnauthorizedError(
                "Authentication required: user ID is missing"
            );
        }

        const updated = await markNotificationAsRead(id, userId);

        return successResponse({
            notification: updated,
        });
    } catch (error) {
        return errorResponse(error);
    }
}
