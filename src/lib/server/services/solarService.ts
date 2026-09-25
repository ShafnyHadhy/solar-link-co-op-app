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