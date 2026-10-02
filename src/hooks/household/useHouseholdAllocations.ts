import { getApiUrl } from "@/lib/api";
import { useUser } from "@clerk/expo";
import { useCallback, useEffect, useState } from "react";

export interface HouseholdAllocationRecord {
    id: string;
    offerId: string;
    requestId: string;
    managerId: string;
    dispatchedEnergyKwh: string;
    dispatchedAt: string;
    notes: string | null;
    manager: {
        id: string;
        name: string | null;
        email: string | null;
        role: string;
    };
    request: {
        id: string;
        householdId: string;
        householdName: string | null;
        householdEmail: string | null;
        householdPhone: string | null;
        householdGrid: string | null;
        requestedEnergyKwh: string;
        remainingRequestedKwh?: number;
        reason: string | null;
        status: string;
        requestedAt: string;
    };
    offer: {
        id: string;
        ownerId: string;
        ownerName: string | null;
        ownerEmail: string | null;
        ownerPhone: string | null;
        ownerGrid: string | null;
        energyAmountKwh: string;
        availableOfferKwh?: number;
        minimumBatteryPercent: string | null;
        status: string;
        offeredAt: string;
        expiresAt: string | null;
    };
}

export function useHouseholdAllocations() {
    const { user, isLoaded, isSignedIn } = useUser();
    const [allocations, setAllocations] = useState<HouseholdAllocationRecord[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const householdId = user?.id;

    const fetchAllocations = useCallback(async () => {
        if (!householdId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const url = `${getApiUrl("/api/household/allocations")}?householdId=${encodeURIComponent(householdId)}`;
            const response = await fetch(url, {
                headers: {
                    "Content-Type": "application/json",
                    "x-user-id": householdId,
                },
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || `Failed to fetch allocations (${response.status})`);
            }

            const json = await response.json();
            if (!json.success) {
                throw new Error(json.error || "Failed to load energy allocations");
            }

            const data = (json.data?.allocations ?? json.allocations ?? []) as HouseholdAllocationRecord[];
            setAllocations(data);
        } catch (err: any) {
            console.error("[useHouseholdAllocations Error]", err);
            setError(err?.message || "Failed to load energy allocations");
        } finally {
            setLoading(false);
        }
    }, [householdId]);

    useEffect(() => {
        if (isLoaded && isSignedIn && householdId) {
            fetchAllocations();
        } else if (isLoaded && !isSignedIn) {
            setLoading(false);
        }
    }, [isLoaded, isSignedIn, householdId, fetchAllocations]);

    const totalAllocatedKwh = allocations.reduce(
        (sum, a) => sum + (parseFloat(a.dispatchedEnergyKwh) || 0),
        0
    );

    return {
        allocations,
        totalAllocatedKwh,
        loading,
        error,
        refetch: fetchAllocations,
    };
}
