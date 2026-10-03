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

    // Mark single notification as read
    const markAsRead = useCallback(
        async (notificationId: string) => {
            if (!notificationId) return;

            // Optimistic update
            setNotifications((prev) =>
                prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));

            try {
                const url = getApiUrl("/api/notifications");
                await fetch(url, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "x-user-id": userId || "",
                    },
                    body: JSON.stringify({
                        id: notificationId,
                        userId,
                    }),
                });
            } catch (err) {
                console.error("[useNotifications markAsRead Error]", err);
                // Refetch on error to restore correct state
                fetchNotifications();
            }
        },
        [userId, fetchNotifications]
    );

    // Mark all notifications as read
    const markAllAsRead = useCallback(async () => {
        if (!userId) return;

        // Optimistic update
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);

        try {
            const url = getApiUrl("/api/notifications");
            await fetch(url, {
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
        } catch (err) {
            console.error("[useNotifications markAllAsRead Error]", err);
            fetchNotifications();
        }
    }, [userId, fetchNotifications]);

    return {
        notifications,
        unreadCount,
        loading,
        error,
        refetch: fetchNotifications,
        markAsRead,
        markAllAsRead,
    };
}
