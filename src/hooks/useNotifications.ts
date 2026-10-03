import { getApiUrl } from "@/lib/api";
import { useUser } from "@clerk/expo";
import { useCallback, useEffect, useState } from "react";

export interface AppNotification {
    id: string;
    userId: string;
    type: "energy" | "maintenance" | "request" | "system" | "announcement";
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

export interface UseNotificationsOptions {
    unreadOnly?: boolean;
    limit?: number;
    enabled?: boolean;
    pollIntervalMs?: number;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
    const { unreadOnly = false, limit, enabled = true, pollIntervalMs } = options;
    const { user, isLoaded, isSignedIn } = useUser();

    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const userId = user?.id;

    const fetchNotifications = useCallback(async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        setError(null);

        try {
            const params = new URLSearchParams();
            params.set("userId", userId);
            if (unreadOnly) params.set("unreadOnly", "true");
            if (limit) params.set("limit", limit.toString());

            const url = getApiUrl(`/api/notifications?${params.toString()}`);
            const response = await fetch(url, {
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": userId,
                },
            });

            if (!response.ok) {
                const errJson = await response.json().catch(() => ({}));
                throw new Error(errJson.error || `Failed to fetch notifications (${response.status})`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || "Failed to load notifications");
            }

            const list: AppNotification[] = data.notifications || data.data?.notifications || [];
            const count: number =
                typeof data.unreadCount === "number"
                    ? data.unreadCount
                    : list.filter((n) => !n.isRead).length;

            setNotifications(list);
            setUnreadCount(count);
        } catch (err: any) {
            console.error("[useNotifications Error]", err);
            setError(err?.message || "Failed to load notifications");
        } finally {
            setLoading(false);
        }
    }, [userId, unreadOnly, limit]);

    // Initial load
    useEffect(() => {
        if (enabled && isLoaded && isSignedIn && userId) {
            fetchNotifications();
        } else if (isLoaded && !isSignedIn) {
            setLoading(false);
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [enabled, isLoaded, isSignedIn, userId, fetchNotifications]);

    // Optional background polling
    useEffect(() => {
        if (!pollIntervalMs || !enabled || !userId) return;

        const interval = setInterval(() => {
            fetchNotifications();
        }, pollIntervalMs);

        return () => clearInterval(interval);
    }, [pollIntervalMs, enabled, userId, fetchNotifications]);

    const [markingReadId, setMarkingReadId] = useState<string | null>(null);
    const [isMarkingAllRead, setIsMarkingAllRead] = useState<boolean>(false);

    // Mark single notification as read
    const markAsRead = useCallback(
        async (notificationId: string): Promise<boolean> => {
            if (!notificationId) return false;
            if (!userId) {
                throw new Error("You must be signed in to perform this action");
            }

            setMarkingReadId(notificationId);
            try {
                const url = getApiUrl("/api/notifications");
                const response = await fetch(url, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "x-user-id": userId,
                    },
                    body: JSON.stringify({
                        id: notificationId,
                        userId,
                    }),
                });

                const data = await response.json().catch(() => ({}));

                if (!response.ok || data.success === false) {
                    const message =
                        data.error ||
                        data.message ||
                        `Failed to mark notification as read (${response.status})`;
                    throw new Error(message);
                }

                // Update the UI immediately after success
                setNotifications((prev) =>
                    prev.map((n) =>
                        n.id === notificationId ? { ...n, isRead: true } : n
                    )
                );
                setUnreadCount((prev) => Math.max(0, prev - 1));
                return true;
            } catch (err: any) {
                console.error("[useNotifications markAsRead Error]", err);
                throw err;
            } finally {
                setMarkingReadId(null);
            }
        },
        [userId]
    );

    // Mark all notifications as read
    const markAllAsRead = useCallback(async (): Promise<boolean> => {
        if (!userId) {
            throw new Error("You must be signed in to perform this action");
        }

        setIsMarkingAllRead(true);
        try {
            const url = getApiUrl("/api/notifications");
            const response = await fetch(url, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": userId,
                },
                body: JSON.stringify({
                    markAll: true,
                    userId,
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok || data.success === false) {
                const message =
                    data.error ||
                    data.message ||
                    `Failed to mark all notifications as read (${response.status})`;
                throw new Error(message);
            }

            // Update the UI immediately after success
            setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
            setUnreadCount(0);
            return true;
        } catch (err: any) {
            console.error("[useNotifications markAllAsRead Error]", err);
            throw err;
        } finally {
            setIsMarkingAllRead(false);
        }
    }, [userId]);

    return {
        notifications,
        unreadCount,
        loading,
        error,
        markingReadId,
        isMarkingAllRead,
        refetch: fetchNotifications,
        markAsRead,
        markAllAsRead,
    };
}
