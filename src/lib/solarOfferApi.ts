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
