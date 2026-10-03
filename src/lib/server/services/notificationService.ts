import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "../db/client";
import {
    Notification,
    notifications,
    notificationTypeEnum,
    users,
} from "../db/schema";
import { BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError } from "../utils/errors";

export type NotificationType = (typeof notificationTypeEnum.enumValues)[number];

export interface GetNotificationsOptions {
    unreadOnly?: boolean;
    limit?: number;
}

export interface CreateNotificationInput {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    isRead?: boolean;
}

/**
 * 1. Create a notification
 * - Generates a unique notification ID
 * - Validates notification type against the existing enum
 * - Defaults isRead to false
 * - Stores the notification in Neon
 * - Returns the created notification
 */
export async function createNotification(
    data: CreateNotificationInput
): Promise<Notification> {
    if (!data.userId) {
        throw new BadRequestError("User ID is required");
    }
    if (!data.title || !data.title.trim()) {
        throw new BadRequestError("Notification title is required");
    }
    if (!data.message || !data.message.trim()) {
        throw new BadRequestError("Notification message is required");
    }
    if (!data.type || !notificationTypeEnum.enumValues.includes(data.type)) {
        throw new BadRequestError(
            `Invalid notification type: "${data.type}". Allowed values are: ${notificationTypeEnum.enumValues.join(", ")}`
        );
    }

    const id = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const [created] = await db
        .insert(notifications)
        .values({
            id,
            userId: data.userId,
            type: data.type,
            title: data.title.trim(),
            message: data.message.trim(),
            isRead: data.isRead ?? false,
        })
        .returning();

    return created;
}

/**
 * 2. Get notifications for a user
 * - Strictly returns only notifications belonging to the requested user.
 * - Supports options for unread filtering and pagination limit.
 * - Ordered by createdAt descending (most recent first).
 */
export async function getNotificationsForUser(
    userId: string,
    options: GetNotificationsOptions = {}
): Promise<Notification[]> {
    if (!userId) {
        throw new BadRequestError("User ID is required");
    }

    const conditions = [eq(notifications.userId, userId)];
    if (options.unreadOnly) {
        conditions.push(eq(notifications.isRead, false));
    }

    let query = db
        .select()
        .from(notifications)
        .where(and(...conditions))
        .orderBy(desc(notifications.createdAt));

    if (options.limit && options.limit > 0) {
        return query.limit(options.limit);
    }

    return query;
}

/**
 * 3. Get unread notifications for a user
 * - Strictly returns only unread notifications belonging to the requested user.
 */
export async function getUnreadNotificationsForUser(
    userId: string,
    options: Omit<GetNotificationsOptions, "unreadOnly"> = {}
): Promise<Notification[]> {
    return getNotificationsForUser(userId, { ...options, unreadOnly: true });
}

/**
 * 4. Mark a notification as read
 * - Verifies that the notification exists.
 * - Verifies that the notification belongs to the authenticated user.
 * - Strictly disallows one user from marking another user's notification as read (throws 403 Forbidden).
 * - Updates isRead to true in the existing notifications table.
 */
export async function markNotificationAsRead(
    notificationId: string,
    userId?: string
): Promise<Notification> {
    if (!notificationId) {
        throw new BadRequestError("Notification ID is required");
    }

    // 1. Fetch notification first to verify existence and ownership
    const [existing] = await db
        .select()
        .from(notifications)
        .where(eq(notifications.id, notificationId))
        .limit(1);

    if (!existing) {
        throw new NotFoundError("Notification not found");
    }

    // 2. If userId is provided, strictly enforce ownership
    if (userId && existing.userId !== userId) {
        throw new ForbiddenError(
            "Forbidden: You cannot modify another user's notification"
        );
    }

    // 3. If already marked as read, return immediately
    if (existing.isRead) {
        return existing;
    }

    // 4. Update isRead = true in the notifications table
    const [updated] = await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, notificationId))
        .returning();

    return updated;
}

/**
 * 5. Mark all notifications as read for a user
 * - Strictly verifies userId authentication.
 * - Marks all unread notifications belonging to the requested user as read.
 * - Prevents modifying any other user's notifications.
 */
export async function markAllNotificationsAsRead(
    userId: string
): Promise<Notification[]> {
    if (!userId) {
        throw new UnauthorizedError("Authentication required: user ID is missing");
    }

    const updated = await db
        .update(notifications)
        .set({ isRead: true })
        .where(
            and(
                eq(notifications.userId, userId),
                eq(notifications.isRead, false)
            )
        )
        .returning();

    return updated;
}

/**
 * Retrieve notifications relevant to managers.
 * Matches notifications targeted directly to managerId or to any user with role = 'manager'.
 */
export async function getManagerNotifications(
    managerId?: string,
    options: GetNotificationsOptions = {}
): Promise<Notification[]> {
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
        .select()
        .from(notifications)
        .where(and(...conditions))
        .orderBy(desc(notifications.createdAt));

    if (options.limit && options.limit > 0) {
        return query.limit(options.limit);
    }

    return query;
}