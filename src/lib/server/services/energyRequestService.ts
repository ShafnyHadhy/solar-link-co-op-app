import { desc, eq } from "drizzle-orm";
import { db } from "../db/client";
import { energyRequests, users } from "../db/schema";
import { NotFoundError } from "../utils/errors";

/**
 * Retrieve all energy requests for the manager.
 * Joins energy_requests.householdId -> users.id to include household details.
 */
export async function getEnergyRequests() {
    return db
        .select({
            id: energyRequests.id,
            householdId: energyRequests.householdId,
            householdName: users.name,
            householdEmail: users.email,
            requestedEnergyKwh: energyRequests.requestedEnergyKwh,
            reason: energyRequests.reason,
            status: energyRequests.status,
            requestedAt: energyRequests.requestedAt,
            reviewedAt: energyRequests.reviewedAt,
            reviewedBy: energyRequests.reviewedBy,
        })
        .from(energyRequests)
        .innerJoin(users, eq(energyRequests.householdId, users.id))
        .orderBy(desc(energyRequests.requestedAt));
}

/**
 * Retrieve a single energy request by ID with household details.
 * Throws NotFoundError (404) if not found.
 */
export async function getEnergyRequestById(id: string) {
    const results = await db
        .select({
            id: energyRequests.id,
            householdId: energyRequests.householdId,
            householdName: users.name,
            householdEmail: users.email,
            householdPhone: users.phone,
            householdGrid: users.assignedGrid,
            requestedEnergyKwh: energyRequests.requestedEnergyKwh,
            reason: energyRequests.reason,
            status: energyRequests.status,
            requestedAt: energyRequests.requestedAt,
            reviewedAt: energyRequests.reviewedAt,
            reviewedBy: energyRequests.reviewedBy,
        })
        .from(energyRequests)
        .innerJoin(users, eq(energyRequests.householdId, users.id))
        .where(eq(energyRequests.id, id))
        .limit(1);

    if (!results || results.length === 0) {
        throw new NotFoundError("Energy request not found");
    }

    const row = results[0];

    return {
        id: row.id,
        householdId: row.householdId,
        householdName: row.householdName,
        householdEmail: row.householdEmail,
        householdPhone: row.householdPhone,
        householdGrid: row.householdGrid,
        requestedEnergyKwh: row.requestedEnergyKwh,
        reason: row.reason,
        status: row.status,
        requestedAt: row.requestedAt,
        reviewedAt: row.reviewedAt,
        reviewedBy: row.reviewedBy,
        household: {
            id: row.householdId,
            name: row.householdName,
            email: row.householdEmail,
            phone: row.householdPhone,
            assignedGrid: row.householdGrid,
        },
    };
}