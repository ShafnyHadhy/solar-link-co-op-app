import { desc, eq } from "drizzle-orm";
import { db } from "../db/client";
import { solarOffers, users } from "../db/schema";

/**
 * Retrieve all solar offers for the manager.
 * Joins solar_offers.ownerId -> users.id to include solar owner details.
 *
 * Returned fields:
 * - id (offer id)
 * - ownerId (owner id)
 * - ownerName (owner name)
 * - ownerEmail (owner email)
 * - energyAmountKwh (energy amount kWh)
 * - minimumBatteryPercent (minimum battery percentage)
 * - status (pending, approved, rejected, completed, cancelled)
 * - offeredAt (timestamp when offered)
 * - expiresAt (expiration timestamp)
 * - createdAt (record creation timestamp)
 */
export async function getSolarOffers() {
    return db
        .select({
            id: solarOffers.id,
            ownerId: solarOffers.ownerId,
            ownerName: users.name,
            ownerEmail: users.email,
            energyAmountKwh: solarOffers.energyAmountKwh,
            minimumBatteryPercent: solarOffers.minimumBatteryPercent,
            status: solarOffers.status,
            offeredAt: solarOffers.offeredAt,
            expiresAt: solarOffers.expiresAt,
            createdAt: solarOffers.createdAt,
        })
        .from(solarOffers)
        .innerJoin(users, eq(solarOffers.ownerId, users.id))
        .orderBy(desc(solarOffers.offeredAt));
}

export type ManagerSolarOffer = Awaited<ReturnType<typeof getSolarOffers>>[number];
