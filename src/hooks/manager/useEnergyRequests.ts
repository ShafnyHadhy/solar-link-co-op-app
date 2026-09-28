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

export interface EnergyRequestDetail {
    id: string;
    householdId: string;
    householdName: string | null;
    householdEmail: string | null;
    householdPhone?: string | null;
    householdGrid?: string | null;
    requestedEnergyKwh: string;
    reason: string | null;
    status: "pending" | "approved" | "rejected" | "fulfilled" | "cancelled";
    requestedAt: string;
    reviewedAt: string | null;
    reviewedBy: string | null;
    household?: {
        id: string;
        name: string | null;
        email: string | null;
        phone?: string | null;
        assignedGrid?: string | null;
    };
}

export function useEnergyRequestDetail(requestId: string | null) {
    const [request, setRequest] = useState<EnergyRequestDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [notFound, setNotFound] = useState<boolean>(false);

    const fetchDetail = useCallback(async () => {
        if (!requestId) {
            setRequest(null);
            setLoading(false);
            setError(null);
            setNotFound(false);
            return;
        }

        setLoading(true);
        setError(null);
        setNotFound(false);

        try {
            const response = await fetch(getApiUrl(`/api/manager/energy-requests/${requestId}`));

            if (response.status === 404) {
                setNotFound(true);
                setRequest(null);
                return;
            }

            if (!response.ok) {
                throw new Error(`Failed to fetch request details (${response.status})`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || "Failed to load request details");
            }

            setRequest(data.request || data.data || null);
        } catch (err: any) {
            console.error("[useEnergyRequestDetail Error]", err);
            setError(err?.message || "Failed to load request details");
        } finally {
            setLoading(false);
        }
    }, [requestId]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    return {
        request,
        loading,
        error,
        notFound,
        refetch: fetchDetail,
    };
}
