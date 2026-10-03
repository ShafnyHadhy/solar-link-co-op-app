import { getApiUrl } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";

export interface CommunityReserveBreakdownItem {
    id: string;
    ownerName: string | null;
    offeredKwh: number;
    dispatchedKwh: number;
    remainingKwh: number;
    status: string;
}

export interface CommunityReserveData {
    availableReserveKwh: number;
    totalPoolCapacityKwh: number;
    totalDispatchedKwh: number;
    percentageAvailable: number;
    percentageAllocated: number;
    activeOffersCount: number;
    breakdownByOffer?: CommunityReserveBreakdownItem[];
}

export function useCommunityReserve(options?: { managerId?: string }) {
    const [data, setData] = useState<CommunityReserveData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchReserve = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const headers: Record<string, string> = {};
            if (options?.managerId) {
                headers["x-user-id"] = options.managerId;
            }

            const response = await fetch(getApiUrl("/api/manager/solar-offers?view=reserve"), { headers });

            if (!response.ok) {
                throw new Error(`Failed to fetch community reserve (${response.status})`);
            }

            const json = await response.json();

            if (!json.success) {
                throw new Error(json.error || "Failed to load community reserve");
            }

            setData(json.data || json);
        } catch (err: any) {
            console.error("[useCommunityReserve Error]", err);
            setError(err?.message || "Failed to load community reserve");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchReserve();
    }, [fetchReserve]);

    return {
        data,
        loading,
        error,
        refetch: fetchReserve,
    };
}
