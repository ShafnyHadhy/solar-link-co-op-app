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

export async function getOfferById(offerId: string) {
    const result = await db
        .select()
        .from(solarOffers)
        .where(eq(solarOffers.id, offerId))
        .limit(1);

    return result[0] ?? null;
}

export async function cancelSolarOffer(offerId: string) {
    const result = await db
        .update(solarOffers)
        .set({ status: "cancelled" })
        .where(eq(solarOffers.id, offerId))
        .returning();

    return result[0] ?? null;
}
