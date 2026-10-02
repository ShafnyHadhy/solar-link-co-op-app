import { getApiUrl } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";

export interface ManagerDispatchRecord {
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

export function useDispatches() {
    const [dispatches, setDispatches] = useState<ManagerDispatchRecord[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDispatches = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(getApiUrl("/api/manager/dispatches"));

            if (!response.ok) {
                throw new Error(`Failed to fetch dispatches (${response.status})`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || "Failed to load dispatches");
            }

            setDispatches(data.dispatches ?? []);
        } catch (err: any) {
            console.error("[useDispatches Error]", err);
            setError(err?.message || "Failed to load dispatches");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDispatches();
    }, [fetchDispatches]);

    const executeDispatch = useCallback(
        async (input: {
            offerId: string;
            requestId: string;
            dispatchedEnergyKwh: number;
            notes?: string;
            managerId?: string;
        }) => {
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
            };
            if (input.managerId) {
                headers["x-user-id"] = input.managerId;
            }

            const response = await fetch(getApiUrl("/api/dispatches"), {
                method: "POST",
                headers,
                body: JSON.stringify({
                    offerId: input.offerId,
                    requestId: input.requestId,
                    dispatchedEnergyKwh: input.dispatchedEnergyKwh,
                    notes: input.notes,
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok || !data.success) {
                throw new Error(data.error || data.message || "Failed to create dispatch");
            }

            // Refresh dispatches list to include newly created dispatch
            await fetchDispatches();

            return data.dispatch as ManagerDispatchRecord;
        },
        [fetchDispatches]
    );

    return {
        dispatches,
        loading,
        error,
        refetch: fetchDispatches,
        executeDispatch,
    };
}
