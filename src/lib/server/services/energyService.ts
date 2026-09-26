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

export async function getAvailableSurplus(assetId: string) {
    const reading = await getLatestReading(assetId);

    if (!reading) {
        return {
            generationKwh: 0,
            consumptionKwh: 0,
            surplusKwh: 0,
        };
    }

    const generation = Number(reading.generationKwh ?? 0);
    const consumption = Number(reading.consumptionKwh ?? 0);
    const surplus = Math.max(generation - consumption, 0);

    return {
        generationKwh: generation,
        consumptionKwh: consumption,
        surplusKwh: surplus,
    };
}
