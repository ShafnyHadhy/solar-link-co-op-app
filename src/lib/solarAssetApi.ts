import { getApiUrl } from "@/lib/api";
import type { SolarAsset } from "@/lib/server/db/schema";

/**
 * Fetch all solar assets owned by a user.
 */
export async function getSolarAssets(ownerId: string): Promise<SolarAsset[]> {
    const response = await fetch(
        `${getApiUrl("/api/solar-assets")}?ownerId=${ownerId}`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch solar assets");
    }

    const data = await response.json();
    return data.assets;
}

/**
 * Fetch a single solar asset by ID.
 */
export async function getSolarAssetById(assetId: string): Promise<SolarAsset> {
    const response = await fetch(
        getApiUrl(`/api/solar-assets/${assetId}`)
    );

    if (!response.ok) {
        throw new Error("Failed to fetch solar asset");
    }

    const data = await response.json();
    return data.asset;
}

/**
 * Create a new solar asset.
 */
export async function createSolarAsset(asset: {
    id: string;
    ownerId: string;
    assetType: string;
    name: string;
    capacityKw?: string;
    location?: string;
    installedAt?: string;
}): Promise<SolarAsset> {
    const response = await fetch(getApiUrl("/api/solar-assets"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(asset),
    });

    if (!response.ok) {
        throw new Error("Failed to create solar asset");
    }

    const data = await response.json();
    return data.asset;
}

/**
 * Update an existing solar asset.
 */
export async function updateSolarAsset(
    assetId: string,
    updates: {
        name?: string;
        assetType?: string;
        capacityKw?: string;
        status?: string;
        location?: string;
        installedAt?: string;
    }
): Promise<SolarAsset> {
    const response = await fetch(
        getApiUrl(`/api/solar-assets/${assetId}`),
        {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
        }
    );

    if (!response.ok) {
        throw new Error("Failed to update solar asset");
    }

    const data = await response.json();
    return data.asset;
}
