import { getApiUrl } from "@/lib/api";
import { useUser } from "@clerk/expo";
import { useCallback, useEffect, useState } from "react";

export interface HouseholdEnergyRequest {
    id: string;
    householdId: string;
    requestedEnergyKwh: string;
    reason: string | null;
    status: "pending" | "approved" | "rejected" | "fulfilled" | "cancelled";
    requestedAt: string;
    reviewedAt: string | null;
    reviewedBy: string | null;
}

export interface HouseholdEnergyStats {
    householdId: string;
    monthlyAllocationKwh: number;
    totalRequestsCount: number;
    pendingRequestsCount: number;
    approvedRequestsCount: number;
    rejectedRequestsCount: number;
    totalRequestedKwh: number;
    approvedKwh: number;
    cleanEnergyUsedKwh: number;
    monthlySavingsLKR: number;
    lifetimeSavingsLKR: number;
    gridCostLKR: number;
    solarCostLKR: number;
    co2SavedKg: number;
}

export interface CreateEnergyRequestInput {
    requestedEnergyKwh: number | string;
    duration?: string;
    purpose?: string;
    priority?: string;
    notes?: string;
}

export function useHouseholdEnergyRequests() {
    const { user, isLoaded, isSignedIn } = useUser();
    const [requests, setRequests] = useState<HouseholdEnergyRequest[]>([]);
    const [stats, setStats] = useState<HouseholdEnergyStats | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const householdId = user?.id;

    const fetchRequestsAndStats = useCallback(async () => {
        if (!householdId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // 1. Fetch user's requests
            const reqRes = await fetch(
                `${getApiUrl("/api/household/energy-requests")}?householdId=${encodeURIComponent(householdId)}`
            );
            const reqJson = await reqRes.json();

            if (reqRes.ok && reqJson.success) {
                setRequests(reqJson.data?.requests ?? reqJson.requests ?? []);
            } else {
                throw new Error(reqJson.error || "Failed to load energy requests");
            }

            // 2. Fetch user's energy & savings stats
            const statsRes = await fetch(
                `${getApiUrl("/api/household/stats")}?householdId=${encodeURIComponent(householdId)}`
            );
            const statsJson = await statsRes.json();

            if (statsRes.ok && statsJson.success) {
                setStats(statsJson.data?.stats ?? statsJson.stats ?? null);
            }
        } catch (err: any) {
            console.error("[useHouseholdEnergyRequests Error]", err);
            setError(err?.message || "Failed to fetch household data");
        } finally {
            setLoading(false);
        }
    }, [householdId]);

    useEffect(() => {
        if (isLoaded && isSignedIn && householdId) {
            fetchRequestsAndStats();
        }
    }, [isLoaded, isSignedIn, householdId, fetchRequestsAndStats]);

    /**
     * Submit a new energy request to the microgrid co-op.
     */
    const createRequest = useCallback(
        async (input: CreateEnergyRequestInput) => {
            if (!householdId) {
                throw new Error("You must be signed in to submit an energy request.");
            }

            setSubmitting(true);
            setError(null);

            try {
                // Compose reason payload from structured inputs
                const structuredDetails = [
                    input.purpose ? `Purpose: ${input.purpose}` : null,
                    input.duration ? `Duration: ${input.duration}` : null,
                    input.priority ? `Priority: ${input.priority}` : null,
                    input.notes ? `Notes: ${input.notes}` : null,
                ]
                    .filter(Boolean)
                    .join(" | ");

                const response = await fetch(getApiUrl("/api/household/energy-requests"), {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        householdId,
                        requestedEnergyKwh: input.requestedEnergyKwh,
                        reason: structuredDetails || "Household usage request",
                    }),
                });

                const json = await response.json();

                if (!response.ok || !json.success) {
                    throw new Error(json.error || "Failed to submit energy request");
                }

                const createdRequest: HouseholdEnergyRequest =
                    json.data?.request ?? json.request;

                // Optimistically prepend to list
                setRequests((prev) => [createdRequest, ...prev]);

                // Synchronize fresh stats
                await fetchRequestsAndStats();

                return createdRequest;
            } catch (err: any) {
                console.error("[CreateRequest Error]", err);
                setError(err?.message || "Failed to submit request");
                throw err;
            } finally {
                setSubmitting(false);
            }
        },
        [householdId, fetchRequestsAndStats]
    );

    /**
     * Cancel an active pending energy request.
     */
    const cancelRequest = useCallback(
        async (requestId: string) => {
            if (!householdId) {
                throw new Error("User identity required");
            }

            try {
                const response = await fetch(
                    getApiUrl(`/api/household/energy-requests/${requestId}`),
                    {
                        method: "PATCH",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            householdId,
                            action: "cancel",
                        }),
                    }
                );

                const json = await response.json();

                if (!response.ok || !json.success) {
                    throw new Error(json.error || "Failed to cancel energy request");
                }

                const updated: HouseholdEnergyRequest =
                    json.data?.request ?? json.request;

                setRequests((prev) =>
                    prev.map((r) => (r.id === requestId ? { ...r, status: "cancelled" } : r))
                );

                // Refresh stats
                await fetchRequestsAndStats();

                return updated;
            } catch (err: any) {
                console.error("[CancelRequest Error]", err);
                setError(err?.message || "Failed to cancel request");
                throw err;
            }
        },
        [householdId, fetchRequestsAndStats]
    );

    return {
        requests,
        stats,
        loading,
        submitting,
        error,
        refetch: fetchRequestsAndStats,
        createRequest,
        cancelRequest,
    };
}
