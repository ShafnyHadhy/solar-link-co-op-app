import { eq } from "drizzle-orm";
import { db } from "../db/client";
import { solarOffers } from "../db/schema";
import type { NewSolarOffer } from "../db/schema";

export async function createSolarOffer(offer: NewSolarOffer) {
    const result = await db
        .insert(solarOffers)
        .values(offer)
        .returning();

    return result[0];
}
