import { desc, eq } from "drizzle-orm";
import { db } from "../db/client";
import { auditLogs, solarOffers, users } from "../db/schema";
import type { NewSolarOffer } from "../db/schema";
import {
    BadRequestError,
    ForbiddenError,
    NotFoundError,
    UnauthorizedError,
} from "../utils/errors";

// ==========================================
// SOLAR OWNER SERVICES (US-04B)
// ==========================================

export async function createSolarOffer(offer: NewSolarOffer) {
    const result = await db.insert(solarOffers).values(offer).returning();
    return result[0];
}

export async function getOffersByOwner(ownerId: string) {
    return db.select().from(solarOffers).where(eq(solarOffers.ownerId, ownerId));
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

// ==========================================
// MANAGER SOLAR OFFER SERVICES
// ==========================================

/**
 * Retrieve all solar offers for the manager.
 * Joins solar_offers.ownerId -> users.id to include solar owner details.
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

/**
 * All valid solar offer statuses in the system:
 * - pending
 * - approved
 * - rejected
 * - completed
 * - cancelled
 */
export const SOLAR_OFFER_STATUSES = [
    "pending",
    "approved",
    "rejected",
    "completed",
    "cancelled",
] as const;

export type SolarOfferStatus = (typeof SOLAR_OFFER_STATUSES)[number];

/**
 * Valid status transitions permitted for manager operations:
 * - pending -> approved
 * - pending -> rejected
 * All other transitions are strictly blocked.
 */
export const VALID_MANAGER_OFFER_STATUS_TRANSITIONS: Record<
    SolarOfferStatus,
    readonly SolarOfferStatus[]
> = {
    pending: ["approved", "rejected"],
    approved: [],
    rejected: [],
    completed: [],
    cancelled: [],
};

/**
 * Validates that a manager can transition a solar offer from currentStatus to targetStatus.
 * Throws BadRequestError if the transition is prohibited.
 */
export function validateManagerOfferStatusTransition(
    currentStatus: string,
    targetStatus: "approved" | "rejected"
) {
    const validNextStatuses =
        VALID_MANAGER_OFFER_STATUS_TRANSITIONS[currentStatus as SolarOfferStatus];

    if (!validNextStatuses || !validNextStatuses.includes(targetStatus)) {
        throw new BadRequestError(
            `Invalid status transition: Cannot transition solar offer from '${currentStatus}' to '${targetStatus}'. Only pending offers can be approved or rejected.`
        );
    }
}

/**
 * Approve a pending solar offer.
 */
export async function approveSolarOffer(offerId: string, managerId: string) {
    if (!managerId) {
        throw new UnauthorizedError("Manager identity is required to approve a solar offer.");
    }

    const managerResults = await db
        .select({
            id: users.id,
            name: users.name,
            role: users.role,
        })
        .from(users)
        .where(eq(users.id, managerId))
        .limit(1);

    if (!managerResults || managerResults.length === 0) {
        throw new NotFoundError(`Manager with ID '${managerId}' was not found.`);
    }

    const manager = managerResults[0];
    if (manager.role !== "manager") {
        throw new ForbiddenError("Forbidden: Only managers can approve solar offers.");
    }

    const offerResults = await db
        .select()
        .from(solarOffers)
        .where(eq(solarOffers.id, offerId))
        .limit(1);

    if (!offerResults || offerResults.length === 0) {
        throw new NotFoundError(`Solar offer '${offerId}' not found.`);
    }

    const existingOffer = offerResults[0];

    validateManagerOfferStatusTransition(existingOffer.status, "approved");

    const now = new Date();

    await db
        .update(solarOffers)
        .set({
            status: "approved",
        })
        .where(eq(solarOffers.id, offerId));

    const auditId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    await db.insert(auditLogs).values({
        id: auditId,
        userId: managerId,
        action: "APPROVE_SOLAR_OFFER",
        entityType: "solar_offer",
        entityId: offerId,
        details: JSON.stringify({
            offerId,
            ownerId: existingOffer.ownerId,
            energyAmountKwh: existingOffer.energyAmountKwh,
            minimumBatteryPercent: existingOffer.minimumBatteryPercent,
            previousStatus: existingOffer.status,
            newStatus: "approved",
            approvedBy: managerId,
            managerName: manager.name,
            approvedAt: now.toISOString(),
        }),
        createdAt: now,
    });

    return getSolarOfferById(offerId);
}

/**
 * Reject a pending solar offer.
 */
export async function rejectSolarOffer(offerId: string, managerId: string) {
    if (!managerId) {
        throw new UnauthorizedError("Manager identity is required to reject a solar offer.");
    }

    const managerResults = await db
        .select({
            id: users.id,
            name: users.name,
            role: users.role,
        })
        .from(users)
        .where(eq(users.id, managerId))
        .limit(1);

    if (!managerResults || managerResults.length === 0) {
        throw new NotFoundError(`Manager with ID '${managerId}' was not found.`);
    }

    const manager = managerResults[0];
    if (manager.role !== "manager") {
        throw new ForbiddenError("Forbidden: Only managers can reject solar offers.");
    }

    const offerResults = await db
        .select()
        .from(solarOffers)
        .where(eq(solarOffers.id, offerId))
        .limit(1);

    if (!offerResults || offerResults.length === 0) {
        throw new NotFoundError(`Solar offer '${offerId}' not found.`);
    }

    const existingOffer = offerResults[0];

    validateManagerOfferStatusTransition(existingOffer.status, "rejected");

    const now = new Date();

    await db
        .update(solarOffers)
        .set({
            status: "rejected",
        })
        .where(eq(solarOffers.id, offerId));

    const auditId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    await db.insert(auditLogs).values({
        id: auditId,
        userId: managerId,
        action: "REJECT_SOLAR_OFFER",
        entityType: "solar_offer",
        entityId: offerId,
        details: JSON.stringify({
            offerId,
            ownerId: existingOffer.ownerId,
            energyAmountKwh: existingOffer.energyAmountKwh,
            minimumBatteryPercent: existingOffer.minimumBatteryPercent,
            previousStatus: existingOffer.status,
            newStatus: "rejected",
            rejectedBy: managerId,
            managerName: manager.name,
            rejectedAt: now.toISOString(),
        }),
        createdAt: now,
    });

    return getSolarOfferById(offerId);
}

export type ManagerSolarOffer = Awaited<ReturnType<typeof getSolarOffers>>[number];
export type ManagerSolarOfferDetail = Awaited<ReturnType<typeof getSolarOfferById>>;
