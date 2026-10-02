import { getApiUrl } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";

export interface ManagerAlert {
    id: string;
    userId: string;
    type: "energy" | "maintenance" | "request" | "system" | "announcement";
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

export interface UseManagerAlertsOptions {
    userId?: string;
    unreadOnly?: boolean;
    limit?: number;
    enabled?: boolean;
}

export function useManagerAlerts(options: UseManagerAlertsOptions = {}) {
    const { userId, unreadOnly = false, limit = 10, enabled = true } = options;
    const [alerts, setAlerts] = useState<ManagerAlert[]>([]);
    const [loading, setLoading] = useState<boolean>(enabled);
    const [error, setError] = useState<string | null>(null);

    const fetchAlerts = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const queryParams = new URLSearchParams();
            if (userId) queryParams.set("userId", userId);
            if (unreadOnly) queryParams.set("unreadOnly", "true");
            if (limit) queryParams.set("limit", limit.toString());

            const url = getApiUrl(`/api/manager/notifications?${queryParams.toString()}`);
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Failed to fetch alerts (${response.status})`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || "Failed to load alerts");
            }

            setAlerts(data.alerts || data.notifications || []);
        } catch (err: any) {
            console.error("[useManagerAlerts Error]", err);
            setError(err?.message || "Failed to load alerts");
        } finally {
            setLoading(false);
        }
    }, [userId, unreadOnly, limit]);

    useEffect(() => {
        if (enabled) {
            fetchAlerts();
        }
    }, [enabled, fetchAlerts]);

    const markAsRead = useCallback(
        async (alertId: string) => {
            try {
                const response = await fetch(getApiUrl("/api/manager/notifications"), {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: alertId }),
                });

                if (!response.ok) {
                    throw new Error(`Failed to mark alert as read (${response.status})`);
                }

                const data = await response.json();
                if (!data.success) {
                    throw new Error(data.error || "Failed to mark alert as read");
                }

                if (unreadOnly) {
                    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
                } else {
                    setAlerts((prev) =>
                        prev.map((a) => (a.id === alertId ? { ...a, isRead: true } : a))
                    );
                }
            } catch (err: any) {
                console.error("[markAsRead Error]", err);
                throw err;
            }
        },
        [unreadOnly]
    );

    return {
        alerts,
        loading,
        error,
        refetch: fetchAlerts,
        markAsRead,
    };
}
