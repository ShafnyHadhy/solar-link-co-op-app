import { getApiUrl } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";

export interface ManagerSolarOffer {
    id: string;
    ownerId: string;
    ownerName: string | null;
    ownerEmail: string | null;
    energyAmountKwh: string;
    totalDispatchedKwh?: number;
    remainingEnergyKwh?: number;
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

export function useSolarOffers(options: { enabled?: boolean; managerId?: string } = {}) {
    const { enabled = true, managerId } = options;
    const [offers, setOffers] = useState<ManagerSolarOffer[]>([]);
    const [loading, setLoading] = useState<boolean>(enabled);
    const [error, setError] = useState<string | null>(null);

    const fetchOffers = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const headers: Record<string, string> = {};
            if (managerId) {
                headers["x-user-id"] = managerId;
            }

            const response = await fetch(getApiUrl("/api/manager/solar-offers"), { headers });

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
        if (enabled) {
            fetchOffers();
        }
    }, [enabled, fetchOffers]);

    const approveOffer = useCallback(
        async (offerId: string, managerId?: string) => {
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
            };
            if (managerId) {
                headers["x-user-id"] = managerId;
            }

            const response = await fetch(
                getApiUrl(`/api/manager/solar-offers/${offerId}`),
                {
                    method: "PATCH",
                    headers,
                    body: JSON.stringify({ action: "approve", managerId }),
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || "Failed to approve solar offer");
            }

            const updated: ManagerSolarOffer = data.offer || data.data;

            // Immediately synchronize local state with persisted database status
            setOffers((prev) =>
                prev.map((o) =>
                    o.id === offerId
                        ? { ...o, ...updated, status: updated.status }
                        : o
                )
            );

            // Refetch live list to ensure complete database synchronization
            await fetchOffers();

            return updated;
        },
        [fetchOffers]
    );

    const rejectOffer = useCallback(
        async (offerId: string, managerId?: string) => {
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
            };
            if (managerId) {
                headers["x-user-id"] = managerId;
            }

            const response = await fetch(
                getApiUrl(`/api/manager/solar-offers/${offerId}`),
                {
                    method: "PATCH",
                    headers,
                    body: JSON.stringify({ action: "reject", managerId }),
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || "Failed to reject solar offer");
            }

            const updated: ManagerSolarOffer = data.offer || data.data;

            // Immediately synchronize local state with persisted database status
            setOffers((prev) =>
                prev.map((o) =>
                    o.id === offerId
                        ? { ...o, ...updated, status: updated.status }
                        : o
                )
            );

            // Refetch live list to ensure complete database synchronization
            await fetchOffers();

            return updated;
        },
        [fetchOffers]
    );

    return {
        offers,
        loading,
        error,
        refetch: fetchOffers,
        approveOffer,
        rejectOffer,
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
