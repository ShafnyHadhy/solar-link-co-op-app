import { desc, eq } from "drizzle-orm";
import { db } from "../db/client";
import { auditLogs, dispatches, energyRequests, users } from "../db/schema";
import {
    BadRequestError,
    ForbiddenError,
    NotFoundError,
    UnauthorizedError,
} from "../utils/errors";

/**
 * Retrieve all energy requests for the manager.
 * Joins energy_requests.householdId -> users.id to include household details.
 * Computes dynamic totalDispatchedKwh and remainingEnergyKwh from the dispatches table.
 */
export async function getEnergyRequests() {
    const rows = await db
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

    const allDispatches = await db
        .select({
            requestId: dispatches.requestId,
            dispatchedEnergyKwh: dispatches.dispatchedEnergyKwh,
        })
        .from(dispatches);

    const dispatchedMap = new Map<string, number>();
    for (const d of allDispatches) {
        const prev = dispatchedMap.get(d.requestId) || 0;
        dispatchedMap.set(d.requestId, prev + parseFloat(d.dispatchedEnergyKwh));
    }

    return rows.map((row) => {
        const totalDispatchedKwh = parseFloat((dispatchedMap.get(row.id) || 0).toFixed(3));
        const totalRequestedKwh = parseFloat(row.requestedEnergyKwh) || 0;
        const remainingEnergyKwh = Math.max(0, parseFloat((totalRequestedKwh - totalDispatchedKwh).toFixed(3)));

        return {
            ...row,
            totalDispatchedKwh,
            remainingEnergyKwh,
        };
    });
}

/**
 * Retrieve a single energy request by ID with household details.
 * Computes dynamic totalDispatchedKwh and remainingEnergyKwh.
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

    const requestDispatches = await db
        .select({
            dispatchedEnergyKwh: dispatches.dispatchedEnergyKwh,
        })
        .from(dispatches)
        .where(eq(dispatches.requestId, id));

    const totalDispatchedKwh = parseFloat(
        requestDispatches
            .reduce((sum, d) => sum + parseFloat(d.dispatchedEnergyKwh), 0)
            .toFixed(3)
    );
    const totalRequestedKwh = parseFloat(row.requestedEnergyKwh) || 0;
    const remainingEnergyKwh = Math.max(0, parseFloat((totalRequestedKwh - totalDispatchedKwh).toFixed(3)));

    return {
        id: row.id,
        householdId: row.householdId,
        householdName: row.householdName,
        householdEmail: row.householdEmail,
        householdPhone: row.householdPhone,
        householdGrid: row.householdGrid,
        requestedEnergyKwh: row.requestedEnergyKwh,
        totalDispatchedKwh,
        remainingEnergyKwh,
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