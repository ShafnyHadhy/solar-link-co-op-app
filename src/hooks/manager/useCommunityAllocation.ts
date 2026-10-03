import { getApiUrl } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";

export interface CommunityAllocationBreakdownItem {
    id: string;
    dispatchedEnergyKwh: number;
    dispatchedAt: string;
    householdName: string | null;
    solarOwnerName: string | null;
}

export interface CommunityAllocationData {
    period: "today";
    date: string;
    allocatedTodayKwh: number;
    allocatedYesterdayKwh: number;
    changePercentage: number | null;
    trend: "up" | "down" | "neutral";
    dispatchesTodayCount: number;
    dispatchesYesterdayCount: number;
    totalDispatchesCount: number;
    breakdownByDispatch?: CommunityAllocationBreakdownItem[];
}

export function useCommunityAllocation(options?: { date?: string; managerId?: string }) {
    const [data, setData] = useState<CommunityAllocationData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAllocation = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const query = options?.date ? `?date=${encodeURIComponent(options.date)}` : "";
            const headers: Record<string, string> = {};
            if (options?.managerId) {
                headers["x-user-id"] = options.managerId;
            }

            const response = await fetch(getApiUrl(`/api/manager/energy-allocation${query}`), { headers });

            if (!response.ok) {
                throw new Error(`Failed to fetch allocation data (${response.status})`);
            }

            const json = await response.json();

            if (!json.success) {
                throw new Error(json.error || "Failed to load allocation data");
            }

            setData(json.data || json);
        } catch (err: any) {
            console.error("[useCommunityAllocation Error]", err);
            setError(err?.message || "Failed to load community allocation");
        } finally {
            setLoading(false);
        }
    }, [options?.date]);

    useEffect(() => {
        fetchAllocation();
    }, [fetchAllocation]);

    return {
        data,
        loading,
        error,
        refetch: fetchAllocation,
    };
}
