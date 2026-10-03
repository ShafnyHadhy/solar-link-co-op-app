import { getApiUrl } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";

export interface CommunityAssetBreakdown {
    assetId: string;
    assetName: string;
    capacityKw: number;
    generationKwh: number;
    readingTime: string;
}

export interface CommunityGenerationData {
    period: "today";
    date: string;
    generatedTodayKwh: number;
    generatedYesterdayKwh: number;
    changePercentage: number | null;
    trend: "up" | "down" | "neutral";
    activeAssetsCount: number;
    reportingAssetsCount: number;
    readingsCount: number;
    latestReadingTime: string | null;
    breakdownByAsset?: CommunityAssetBreakdown[];
}

export function useCommunityGeneration(options?: { date?: string; managerId?: string }) {
    const [data, setData] = useState<CommunityGenerationData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchGeneration = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const query = options?.date ? `?date=${encodeURIComponent(options.date)}` : "";
            const headers: Record<string, string> = {};
            if (options?.managerId) {
                headers["x-user-id"] = options.managerId;
            }

            const response = await fetch(getApiUrl(`/api/manager/energy-generation${query}`), { headers });

            if (!response.ok) {
                throw new Error(`Failed to fetch generation data (${response.status})`);
            }

            const json = await response.json();

            if (!json.success) {
                throw new Error(json.error || "Failed to load generation data");
            }

            setData(json.data || json);
        } catch (err: any) {
            console.error("[useCommunityGeneration Error]", err);
            setError(err?.message || "Failed to load community generation");
        } finally {
            setLoading(false);
        }
    }, [options?.date]);

    useEffect(() => {
        fetchGeneration();
    }, [fetchGeneration]);

    return {
        data,
        loading,
        error,
        refetch: fetchGeneration,
    };
}
