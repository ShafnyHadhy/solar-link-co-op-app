import { desc, eq } from "drizzle-orm";
import { db } from "../db/client";
import { energyReadings } from "../db/schema";

export async function getLatestReading(assetId: string) {
    const result = await db
        .select()
        .from(energyReadings)
        .where(eq(energyReadings.assetId, assetId))
        .orderBy(desc(energyReadings.readingTime))
        .limit(1);

    return result[0] ?? null;
}
