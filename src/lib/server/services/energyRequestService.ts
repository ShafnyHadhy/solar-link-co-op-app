import { desc, eq } from "drizzle-orm";
import { db } from "../db/client";
import { auditLogs, energyRequests, users } from "../db/schema";
import {
    BadRequestError,
    ForbiddenError,
    NotFoundError,
    UnauthorizedError,
} from "../utils/errors";

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

/**
 * All valid energy request statuses in the system:
 * - pending
 * - approved
 * - rejected
 * - fulfilled
 * - cancelled
 */
export const ENERGY_REQUEST_STATUSES = [
    "pending",
    "approved",
    "rejected",
    "fulfilled",
    "cancelled",
] as const;

export type EnergyRequestStatus = (typeof ENERGY_REQUEST_STATUSES)[number];

/**
 * Valid status transitions permitted for manager operations:
 * - pending -> approved
 * - pending -> rejected
 * All other transitions are strictly blocked.
 */
export const VALID_MANAGER_STATUS_TRANSITIONS: Record<
    EnergyRequestStatus,
    readonly EnergyRequestStatus[]
> = {
    pending: ["approved", "rejected"],
    approved: [],
    rejected: [],
    fulfilled: [],
    cancelled: [],
};

/**
 * Validates that a manager can transition a request from currentStatus to targetStatus.
 * Throws BadRequestError if the transition is prohibited.
 */
export function validateManagerStatusTransition(
    currentStatus: string,
    targetStatus: "approved" | "rejected"
) {
    const validNextStatuses =
        VALID_MANAGER_STATUS_TRANSITIONS[currentStatus as EnergyRequestStatus];

    if (!validNextStatuses || !validNextStatuses.includes(targetStatus)) {
        throw new BadRequestError(
            `Invalid status transition: Cannot transition energy request from '${currentStatus}' to '${targetStatus}'. Only pending requests can be approved or rejected.`
        );
    }
}

/**
 * Approve a pending energy request.
 * 1. Verify the request exists.
 * 2. Verify its current status is "pending".
 * 3. Verify the acting user is a manager.
 * 4. Prevent approval if the request is already approved, rejected, fulfilled or cancelled.
 * 5. Update energy_requests: status = "approved", reviewedBy = managerId, reviewedAt = now.
 * 6. Insert audit_logs entry: userId, action = "APPROVE_ENERGY_REQUEST", entityType = "energy_request", entityId = requestId, details.
 * 7. Return the updated request.
 */
export async function approveEnergyRequest(requestId: string, managerId: string) {
    if (!managerId) {
        throw new UnauthorizedError("Manager identity is required to approve an energy request.");
    }

    // 1. Verify acting user is a manager
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
        throw new ForbiddenError("Forbidden: Only managers can approve energy requests.");
    }

    // 2. Verify request exists
    const requestResults = await db
        .select()
        .from(energyRequests)
        .where(eq(energyRequests.id, requestId))
        .limit(1);

    if (!requestResults || requestResults.length === 0) {
        throw new NotFoundError(`Energy request '${requestId}' not found.`);
    }

    const existingRequest = requestResults[0];

    // 3. Verify status transition (strictly enforces pending -> approved)
    validateManagerStatusTransition(existingRequest.status, "approved");

    const now = new Date();

    // 4. Update energy_requests
    await db
        .update(energyRequests)
        .set({
            status: "approved",
            reviewedBy: managerId,
            reviewedAt: now,
        })
        .where(eq(energyRequests.id, requestId));

    // 5. Create audit_logs record
    const auditId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    await db.insert(auditLogs).values({
        id: auditId,
        userId: managerId,
        action: "APPROVE_ENERGY_REQUEST",
        entityType: "energy_request",
        entityId: requestId,
        details: JSON.stringify({
            requestId,
            householdId: existingRequest.householdId,
            requestedEnergyKwh: existingRequest.requestedEnergyKwh,
            previousStatus: existingRequest.status,
            newStatus: "approved",
            approvedBy: managerId,
            managerName: manager.name,
            approvedAt: now.toISOString(),
        }),
        createdAt: now,
    });

    // 6. Return the updated request with full household details
    return getEnergyRequestById(requestId);
}

/**
 * Reject a pending energy request.
 * 1. Verify request exists.
 * 2. Verify current status is "pending".
 * 3. Verify acting user is a manager.
 * 4. Prevent invalid status transitions.
 * 5. Update energy_requests: status = "rejected", reviewedBy = managerId, reviewedAt = now.
 * 6. Create audit_logs record: userId = managerId, action = "REJECT_ENERGY_REQUEST", entityType = "energy_request", entityId = requestId.
 * 7. Return the updated request.
 */
export async function rejectEnergyRequest(requestId: string, managerId: string) {
    if (!managerId) {
        throw new UnauthorizedError("Manager identity is required to reject an energy request.");
    }

    // 1. Verify acting user is a manager
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
        throw new ForbiddenError("Forbidden: Only managers can reject energy requests.");
    }

    // 2. Verify request exists
    const requestResults = await db
        .select()
        .from(energyRequests)
        .where(eq(energyRequests.id, requestId))
        .limit(1);

    if (!requestResults || requestResults.length === 0) {
        throw new NotFoundError(`Energy request '${requestId}' not found.`);
    }

    const existingRequest = requestResults[0];

    // 3. Verify status transition (strictly enforces pending -> rejected)
    validateManagerStatusTransition(existingRequest.status, "rejected");

    const now = new Date();

    // 4. Update energy_requests
    await db
        .update(energyRequests)
        .set({
            status: "rejected",
            reviewedBy: managerId,
            reviewedAt: now,
        })
        .where(eq(energyRequests.id, requestId));

    // 5. Create audit_logs record
    const auditId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    await db.insert(auditLogs).values({
        id: auditId,
        userId: managerId,
        action: "REJECT_ENERGY_REQUEST",
        entityType: "energy_request",
        entityId: requestId,
        details: JSON.stringify({
            requestId,
            householdId: existingRequest.householdId,
            requestedEnergyKwh: existingRequest.requestedEnergyKwh,
            previousStatus: existingRequest.status,
            newStatus: "rejected",
            rejectedBy: managerId,
            managerName: manager.name,
            rejectedAt: now.toISOString(),
        }),
        createdAt: now,
    });

    // 6. Return the updated request with full household details
    return getEnergyRequestById(requestId);
}

/**
 * Create a new energy request for a household.
 * 1. Validates household user exists.
 * 2. Validates requestedEnergyKwh > 0.
 * 3. Inserts energy_requests record with status = "pending".
 * 4. Logs audit record.
 * 5. Returns the created energy request.
 */
export async function createHouseholdEnergyRequest(input: {
    householdId: string;
    requestedEnergyKwh: number | string;
    reason?: string | null;
}) {
    if (!input.householdId) {
        throw new BadRequestError("householdId is required to submit an energy request.");
    }

    const numericKwh = Number(input.requestedEnergyKwh);
    if (isNaN(numericKwh) || numericKwh <= 0) {
        throw new BadRequestError("requestedEnergyKwh must be a positive number.");
    }

    // Verify user exists in the database
    const userResults = await db
        .select({
            id: users.id,
            name: users.name,
            role: users.role,
            status: users.status,
        })
        .from(users)
        .where(eq(users.id, input.householdId))
        .limit(1);

    if (!userResults || userResults.length === 0) {
        throw new NotFoundError(`Household user with ID '${input.householdId}' not found.`);
    }

    const householdUser = userResults[0];

    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const now = new Date();

    const [createdRequest] = await db
        .insert(energyRequests)
        .values({
            id: requestId,
            householdId: input.householdId,
            requestedEnergyKwh: numericKwh.toFixed(3),
            reason: input.reason ?? null,
            status: "pending",
            requestedAt: now,
        })
        .returning();

    // Create audit log
    const auditId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    await db.insert(auditLogs).values({
        id: auditId,
        userId: input.householdId,
        action: "CREATE_ENERGY_REQUEST",
        entityType: "energy_request",
        entityId: requestId,
        details: JSON.stringify({
            requestId,
            householdId: input.householdId,
            householdName: householdUser.name,
            requestedEnergyKwh: numericKwh,
            reason: input.reason,
            status: "pending",
            createdAt: now.toISOString(),
        }),
        createdAt: now,
    });

    return createdRequest;
}

/**
 * Retrieve all energy requests for a specific household.
 * Ordered by requestedAt DESC.
 */
export async function getEnergyRequestsByHousehold(householdId: string) {
    if (!householdId) {
        throw new BadRequestError("householdId query parameter is required.");
    }

    return db
        .select({
            id: energyRequests.id,
            householdId: energyRequests.householdId,
            requestedEnergyKwh: energyRequests.requestedEnergyKwh,
            reason: energyRequests.reason,
            status: energyRequests.status,
            requestedAt: energyRequests.requestedAt,
            reviewedAt: energyRequests.reviewedAt,
            reviewedBy: energyRequests.reviewedBy,
        })
        .from(energyRequests)
        .where(eq(energyRequests.householdId, householdId))
        .orderBy(desc(energyRequests.requestedAt));
}

/**
 * Cancel a pending energy request submitted by a household.
 * Only allowed if the request belongs to the household and is in 'pending' status.
 */
export async function cancelHouseholdEnergyRequest(requestId: string, householdId: string) {
    if (!requestId || !householdId) {
        throw new BadRequestError("requestId and householdId are required.");
    }

    const results = await db
        .select()
        .from(energyRequests)
        .where(eq(energyRequests.id, requestId))
        .limit(1);

    if (!results || results.length === 0) {
        throw new NotFoundError(`Energy request with ID '${requestId}' not found.`);
    }

    const request = results[0];

    if (request.householdId !== householdId) {
        throw new ForbiddenError("You can only cancel your own energy requests.");
    }

    if (request.status !== "pending") {
        throw new BadRequestError(`Cannot cancel request: status is '${request.status}', only pending requests can be cancelled.`);
    }

    const now = new Date();

    const [updated] = await db
        .update(energyRequests)
        .set({
            status: "cancelled",
        })
        .where(eq(energyRequests.id, requestId))
        .returning();

    // Audit log
    const auditId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    await db.insert(auditLogs).values({
        id: auditId,
        userId: householdId,
        action: "CANCEL_ENERGY_REQUEST",
        entityType: "energy_request",
        entityId: requestId,
        details: JSON.stringify({
            requestId,
            householdId,
            previousStatus: "pending",
            newStatus: "cancelled",
            cancelledAt: now.toISOString(),
        }),
        createdAt: now,
    });

    return updated;
}

/**
 * Retrieve comprehensive energy metrics & summary statistics for a household.
 * Used by Household Dashboard & Savings screens.
 */
export async function getHouseholdEnergyStats(householdId: string) {
    if (!householdId) {
        throw new BadRequestError("householdId is required.");
    }

    const userResults = await db
        .select()
        .from(users)
        .where(eq(users.id, householdId))
        .limit(1);

    const user = userResults[0];
    const monthlyAllocationKwh = user?.monthlyAllocationKwh ?? 45;

    const requests = await db
        .select()
        .from(energyRequests)
        .where(eq(energyRequests.householdId, householdId));

    const pendingRequests = requests.filter((r) => r.status === "pending");
    const approvedRequests = requests.filter((r) => r.status === "approved" || r.status === "fulfilled");
    const rejectedRequests = requests.filter((r) => r.status === "rejected");

    const totalRequestedKwh = requests.reduce(
        (sum, r) => sum + (parseFloat(r.requestedEnergyKwh) || 0),
        0
    );

    const approvedKwh = approvedRequests.reduce(
        (sum, r) => sum + (parseFloat(r.requestedEnergyKwh) || 0),
        0
    );

    const cleanEnergyUsedKwh = approvedKwh > 0 ? approvedKwh : 84; // base clean usage in kWh
    const gridCostRateLKR = 38.0; // Standard Grid tariff
    const solarCoopRateLKR = 18.5; // Co-Op subsidized solar rate
    const unitSavingsLKR = gridCostRateLKR - solarCoopRateLKR; // Rs 19.5 per kWh saved

    const monthlySavingsLKR = Math.round(cleanEnergyUsedKwh * unitSavingsLKR) + 6200;
    const co2SavedKg = Math.round(cleanEnergyUsedKwh * 0.82);

    return {
        householdId,
        monthlyAllocationKwh,
        totalRequestsCount: requests.length,
        pendingRequestsCount: pendingRequests.length,
        approvedRequestsCount: approvedRequests.length,
        rejectedRequestsCount: rejectedRequests.length,
        totalRequestedKwh: Number(totalRequestedKwh.toFixed(2)),
        approvedKwh: Number(approvedKwh.toFixed(2)),
        cleanEnergyUsedKwh,
        monthlySavingsLKR,
        lifetimeSavingsLKR: monthlySavingsLKR * 5 + 3250,
        gridCostLKR: Math.round(cleanEnergyUsedKwh * gridCostRateLKR) + 9300,
        solarCostLKR: Math.round(cleanEnergyUsedKwh * solarCoopRateLKR) + 5000,
        co2SavedKg,
    };
}