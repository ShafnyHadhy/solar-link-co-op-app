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

/**
 * Fetch a single solar asset by its ID.
 */
export async function fetchSolarAssetById(assetId: string): Promise<SolarAsset> {
    const response = await fetch(
        getApiUrl(`/api/solar-assets/${assetId}`)
    );

    if (!response.ok) {
        throw new Error("Failed to fetch solar asset");
    }

    const data = await response.json();
    return data.data.asset;
}

/**
 * Create a new solar asset.
 */
export async function createSolarAsset(
    asset: NewSolarAsset
): Promise<SolarAsset> {
    const response = await fetch(getApiUrl("/api/solar-assets"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(asset),
    });

    if (!response.ok) {
        throw new Error("Failed to create solar asset");
    }

    const data = await response.json();
    return data.data.asset;
}
