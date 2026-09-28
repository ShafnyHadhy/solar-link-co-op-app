import { getApiUrl } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";

export interface ManagerEnergyRequest {
    id: string;
    householdId: string;
    householdName: string | null;
    householdEmail: string | null;
    requestedEnergyKwh: string;
    reason: string | null;
    status: "pending" | "approved" | "rejected" | "fulfilled" | "cancelled";
    requestedAt: string;
    reviewedAt: string | null;
    reviewedBy: string | null;
}

export function useEnergyRequests() {
    const [requests, setRequests] = useState<ManagerEnergyRequest[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(getApiUrl("/api/manager/energy-requests"));

            if (!response.ok) {
                throw new Error(`Failed to fetch energy requests (${response.status})`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || "Failed to load energy requests");
            }

            setRequests(data.requests ?? []);
        } catch (err: any) {
            console.error("[useEnergyRequests Error]", err);
            setError(err?.message || "Failed to load energy requests");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    return {
        requests,
        loading,
        error,
        refetch: fetchRequests,
    };
}
