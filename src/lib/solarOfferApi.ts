import { getApiUrl } from "@/lib/api";
import type { SolarOffer, NewSolarOffer } from "@/lib/server/db/schema";

/**
 * Fetch all solar offers submitted by an owner.
 */
export async function fetchSolarOffers(ownerId: string): Promise<SolarOffer[]> {
    const response = await fetch(
        `${getApiUrl("/api/solar-offers")}?ownerId=${ownerId}`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch solar offers");
    }

    const data = await response.json();
    return data.data.offers;
}

/**
 * Create a new solar sharing offer.
 */
export async function createSolarOffer(
    offer: NewSolarOffer
): Promise<SolarOffer> {
    const response = await fetch(getApiUrl("/api/solar-offers"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(offer),
    });

    if (!response.ok) {
        throw new Error("Failed to create solar offer");
    }

    const data = await response.json();
    return data.data.offer;
}

/**
 * Cancel a pending solar offer by ID.
 */
export async function cancelSolarOffer(offerId: string): Promise<SolarOffer> {
    const response = await fetch(
        getApiUrl(`/api/solar-offers/${offerId}/cancel`),
        { method: "PATCH" }
    );

    if (!response.ok) {
        throw new Error("Failed to cancel solar offer");
    }

    const data = await response.json();
    return data.data.offer;
}

export interface OwnerSharingHistoryItem {
    id: string;
    recipientName: string;
    amountKWh: number;
    creditsEarnedUSD: number;
    co2SavedKg: number;
    date: string;
    time: string;
    type: "request_fulfillment" | "coop_pool_share" | "emergency_aid";
    status: "completed" | "active";
    notes?: string | null;
}

export interface OwnerOfferSummary {
    totalSharedKWh: number;
    totalCreditsEarned: number;
    uniqueHouseholdsSupported: number;
    activeOffersCount: number;
    pendingCount: number;
    approvedCount: number;
    completedCount: number;
    totalOffersCount: number;
    ratePerKwh: number;
}

/**
 * Fetch sharing history and summary metrics for an owner.
 */
export async function fetchSharingHistory(ownerId: string): Promise<{
    history: OwnerSharingHistoryItem[];
    summary: OwnerOfferSummary;
}> {
    const response = await fetch(
        `${getApiUrl("/api/solar-offers/history")}?ownerId=${ownerId}`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch sharing history");
    }

    const data = await response.json();
    return data.data;
}
