import { desc, eq } from "drizzle-orm";
import { db } from "../db/client";
import { energyRequests, users } from "../db/schema";

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