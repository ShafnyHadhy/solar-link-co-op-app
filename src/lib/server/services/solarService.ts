import { eq } from "drizzle-orm";
import { db } from "../db/client";
import {
    solarAssets,
    type NewSolarAsset,
} from "../db/schema";

/**
 * Get all solar assets owned by a specific user.
 */
export async function getAssetsByOwner(ownerId: string) {
    return db
        .select()
        .from(solarAssets)
        .where(eq(solarAssets.ownerId, ownerId));
}

/**
 * Get a single solar asset by its ID.
 */
export async function getAssetById(assetId: string) {
    const result = await db
        .select()
        .from(solarAssets)
        .where(eq(solarAssets.id, assetId))
        .limit(1);

    return result[0] ?? null;
}

/**
 * Create a new solar asset (panel, inverter, battery, etc.)
 */
export async function createAsset(asset: NewSolarAsset) {
    const result = await db
        .insert(solarAssets)
        .values(asset)
        .returning();

    return result[0];
}

/**
 * Update a solar asset's fields.
 * Returns null if asset not found.
 */
export async function updateAsset(
    assetId: string,
    data: Partial<NewSolarAsset>
) {
    const result = await db
        .update(solarAssets)
        .set({
            ...data,
            updatedAt: new Date(),
        })
        .where(eq(solarAssets.id, assetId))
        .returning();

    return result[0] ?? null;
}
