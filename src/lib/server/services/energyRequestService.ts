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

    // 3. Verify status is "pending" and prevent approval if already approved, rejected, fulfilled, or cancelled
    if (existingRequest.status !== "pending") {
        throw new BadRequestError(
            `Cannot approve energy request with status '${existingRequest.status}'. Only pending requests can be approved.`
        );
    }

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

    // 3. Verify status is "pending" and prevent invalid status transitions
    if (existingRequest.status !== "pending") {
        throw new BadRequestError(
            `Cannot reject energy request with status '${existingRequest.status}'. Only pending requests can be rejected.`
        );
    }

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