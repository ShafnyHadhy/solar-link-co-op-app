import { desc, eq } from "drizzle-orm";
import { db } from "../db/client";
import { solarOffers, users } from "../db/schema";
import { NotFoundError } from "../utils/errors";

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

/**
 * Retrieve a single solar offer by ID with solar owner details.
 * Throws NotFoundError (404) if not found.
 */
export async function getSolarOfferById(id: string) {
    const results = await db
        .select({
            id: solarOffers.id,
            ownerId: solarOffers.ownerId,
            ownerName: users.name,
            ownerEmail: users.email,
            ownerPhone: users.phone,
            ownerGrid: users.assignedGrid,
            ownerSolarCapacityKw: users.solarCapacityKw,
            energyAmountKwh: solarOffers.energyAmountKwh,
            minimumBatteryPercent: solarOffers.minimumBatteryPercent,
            status: solarOffers.status,
            offeredAt: solarOffers.offeredAt,
            expiresAt: solarOffers.expiresAt,
            createdAt: solarOffers.createdAt,
        })
        .from(solarOffers)
        .innerJoin(users, eq(solarOffers.ownerId, users.id))
        .where(eq(solarOffers.id, id))
        .limit(1);

    if (!results || results.length === 0) {
        throw new NotFoundError("Solar offer not found");
    }

    const row = results[0];

    return {
        id: row.id,
        ownerId: row.ownerId,
        ownerName: row.ownerName,
        ownerEmail: row.ownerEmail,
        ownerPhone: row.ownerPhone,
        ownerGrid: row.ownerGrid,
        ownerSolarCapacityKw: row.ownerSolarCapacityKw,
        energyAmountKwh: row.energyAmountKwh,
        minimumBatteryPercent: row.minimumBatteryPercent,
        status: row.status,
        offeredAt: row.offeredAt,
        expiresAt: row.expiresAt,
        createdAt: row.createdAt,
        owner: {
            id: row.ownerId,
            name: row.ownerName,
            email: row.ownerEmail,
            phone: row.ownerPhone,
            assignedGrid: row.ownerGrid,
            solarCapacityKw: row.ownerSolarCapacityKw,
        },
    };
}

export type ManagerSolarOffer = Awaited<ReturnType<typeof getSolarOffers>>[number];
export type ManagerSolarOfferDetail = Awaited<ReturnType<typeof getSolarOfferById>>;

