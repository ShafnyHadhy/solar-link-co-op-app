import { getApiUrl } from "@/lib/api";

export interface SurplusResult {
    generationKwh: number;
    consumptionKwh: number;
    surplusKwh: number;
}

/**
 * Fetch available surplus energy for a solar asset.
 */
export async function fetchSurplus(assetId: string): Promise<SurplusResult> {
    const response = await fetch(
        `${getApiUrl("/api/energy-surplus")}?assetId=${assetId}`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch energy surplus");
    }

    const data = await response.json();
    return data.data.surplus;
}
