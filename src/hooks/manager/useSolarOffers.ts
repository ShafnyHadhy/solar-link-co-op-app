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

export interface ManagerSolarOfferDetail extends ManagerSolarOffer {
    ownerPhone?: string | null;
    ownerGrid?: string | null;
    ownerSolarCapacityKw?: string | null;
    owner?: {
        id: string;
        name: string | null;
        email: string | null;
        phone: string | null;
        assignedGrid: string | null;
        solarCapacityKw: string | null;
    };
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

/**
 * Hook to retrieve a single solar offer by ID.
 * Returns { offer, loading, error, notFound, refetch }
 */
export function useSolarOfferDetail(offerId: string | null) {
    const [offer, setOffer] = useState<ManagerSolarOfferDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [notFound, setNotFound] = useState<boolean>(false);

    const fetchDetail = useCallback(async () => {
        if (!offerId) {
            setOffer(null);
            setLoading(false);
            setError(null);
            setNotFound(false);
            return;
        }

        setLoading(true);
        setError(null);
        setNotFound(false);

        try {
            const response = await fetch(getApiUrl(`/api/manager/solar-offers/${offerId}`));

            if (response.status === 404) {
                setNotFound(true);
                setOffer(null);
                return;
            }

            if (!response.ok) {
                throw new Error(`Failed to fetch solar offer (${response.status})`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || "Failed to load solar offer details");
            }

            setOffer(data.offer || data.data);
        } catch (err: any) {
            console.error("[useSolarOfferDetail Error]", err);
            setError(err?.message || "Failed to load solar offer details");
        } finally {
            setLoading(false);
        }
    }, [offerId]);

    useEffect(() => {
        fetchDetail();
    }, [fetchDetail]);

    return {
        offer,
        loading,
        error,
        notFound,
        refetch: fetchDetail,
    };
}
