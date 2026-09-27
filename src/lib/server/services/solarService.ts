import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { solarAssets } from "../db/schema";
import type { NewSolarAsset } from "../db/schema";
import { NotFoundError } from "../utils/errors";

export async function getAssetsByOwner(ownerId: string) {
    return db
        .select()
        .from(solarAssets)
        .where(eq(solarAssets.ownerId, ownerId));
}

export async function getAssetById(assetId: string) {
    const result = await db
        .select()
        .from(solarAssets)
        .where(eq(solarAssets.id, assetId))
        .limit(1);

    if (!result[0]) {
        throw new NotFoundError("Solar asset not found");
    }

    return result[0];
}

export async function createAsset(asset: NewSolarAsset) {
    const result = await db
        .insert(solarAssets)
        .values(asset)
        .returning();

    return result[0];
}

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