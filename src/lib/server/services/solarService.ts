import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { solarAssets } from "../db/schema";
import type { NewSolarAsset } from "../db/schema";

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

    return result[0] ?? null;
}