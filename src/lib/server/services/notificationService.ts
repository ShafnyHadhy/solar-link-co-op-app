import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "../db/client";
import { notifications, users } from "../db/schema";
import { BadRequestError, NotFoundError } from "../utils/errors";

export interface GetNotificationsOptions {
    unreadOnly?: boolean;
    limit?: number;
}

/**
 * Retrieve notifications for a specific user ID.
 */
export async function getNotificationsForUser(
    userId: string,
    options: GetNotificationsOptions = {}
) {
    const conditions = [eq(notifications.userId, userId)];
    if (options.unreadOnly) {
        conditions.push(eq(notifications.isRead, false));
    }

    let query = db
        .select({
            id: notifications.id,
            userId: notifications.userId,
            type: notifications.type,
            title: notifications.title,
            message: notifications.message,
            isRead: notifications.isRead,
            createdAt: notifications.createdAt,
        })
        .from(notifications)
        .where(and(...conditions))
        .orderBy(desc(notifications.createdAt));

    if (options.limit) {
        return query.limit(options.limit);
    }

    return query;
}

/**
 * Retrieve notifications relevant to managers.
 * Matches notifications targeted directly to managerId or to any user with role = 'manager'.
 */
export async function getManagerNotifications(
    managerId?: string,
    options: GetNotificationsOptions = {}
) {
    const managerUserIds: string[] = [];
    if (managerId) {
        managerUserIds.push(managerId);
    }

    // Include all users who have the 'manager' role
    const managerUsers = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.role, "manager"));

    for (const u of managerUsers) {
        if (!managerUserIds.includes(u.id)) {
            managerUserIds.push(u.id);
        }
    }

    if (managerUserIds.length === 0) {
        return [];
    }

    const conditions = [inArray(notifications.userId, managerUserIds)];
    if (options.unreadOnly) {
        conditions.push(eq(notifications.isRead, false));
    }

    let query = db
        .select({
            id: notifications.id,
            userId: notifications.userId,
            type: notifications.type,
            title: notifications.title,
            message: notifications.message,
            isRead: notifications.isRead,
            createdAt: notifications.createdAt,
        })
        .from(notifications)
        .where(and(...conditions))
        .orderBy(desc(notifications.createdAt));

    if (options.limit) {
        return query.limit(options.limit);
    }

    return query;
}

/**
 * Mark a notification as read.
 */
export async function markNotificationAsRead(notificationId: string) {
    if (!notificationId) {
        throw new BadRequestError("Notification ID is required");
    }

    const result = await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, notificationId))
        .returning();

    if (!result.length) {
        throw new NotFoundError("Notification not found");
    }

    return result[0];
}

/**
 * Create a new notification.
 */
export async function createNotification(data: {
    userId: string;
    type: "energy" | "maintenance" | "request" | "system" | "announcement";
    title: string;
    message: string;
    isRead?: boolean;
}) {
    const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const result = await db
        .insert(notifications)
        .values({
            id,
            userId: data.userId,
            type: data.type,
            title: data.title,
            message: data.message,
            isRead: data.isRead ?? false,
        })
        .returning();

    return result[0];
}