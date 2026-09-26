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

export async function getOffersByOwner(ownerId: string) {
    return db
        .select()
        .from(solarOffers)
        .where(eq(solarOffers.ownerId, ownerId));
}
