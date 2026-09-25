import { getApiUrl } from "@/lib/api";
import type { SolarAsset, NewSolarAsset } from "@/lib/server/db/schema";

/**
 * Fetch all solar assets belonging to a specific owner.
 */
export async function fetchSolarAssets(ownerId: string): Promise<SolarAsset[]> {
    const response = await fetch(
        `${getApiUrl("/api/solar-assets")}?ownerId=${ownerId}`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch solar assets");
    }

    const data = await response.json();
    return data.data.assets;
}
