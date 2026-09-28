import { getApiUrl } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";

export interface ManagerSolarOffer {
    id: string;
    ownerId: string;
    ownerName: string | null;
    ownerEmail: string | null;
    energyAmountKwh: string;
    minimumBatteryPercent: string | null;
    status: "pending" | "approved" | "rejected" | "completed" | "cancelled";
    offeredAt: string;
    expiresAt: string | null;
    createdAt: string;
}

export function useSolarOffers() {
    const [offers, setOffers] = useState<ManagerSolarOffer[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOffers = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(getApiUrl("/api/manager/solar-offers"));

            if (!response.ok) {
                throw new Error(`Failed to fetch solar offers (${response.status})`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || "Failed to load solar offers");
            }

            setOffers(data.offers ?? []);
        } catch (err: any) {
            console.error("[useSolarOffers Error]", err);
            setError(err?.message || "Failed to load solar offers");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOffers();
    }, [fetchOffers]);

    return {
        offers,
        loading,
        error,
        refetch: fetchOffers,
    };
}
