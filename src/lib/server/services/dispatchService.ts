import { and, desc, eq } from "drizzle-orm";
import { db } from "../db/client";
import {
    auditLogs,
    dispatches,
    energyRequests,
    solarOffers,
    users,
} from "../db/schema";
import {
    BadRequestError,
    ForbiddenError,
    NotFoundError,
    UnauthorizedError,
} from "../utils/errors";

// ============================================================================
// TypeScript Types
// ============================================================================

export interface CreateDispatchInput {
    id?: string;
    offerId: string;
    requestId: string;
    managerId: string;
    dispatchedEnergyKwh: number | string;
    dispatchedAt?: string | Date;
    notes?: string | null;
}

export interface DispatchDetails {
    id: string;
    offerId: string;
    requestId: string;
    managerId: string;
    dispatchedEnergyKwh: string;
    dispatchedAt: Date;
    notes: string | null;
    manager: {
        id: string;
        name: string | null;
        email: string | null;
        role: string;
    };
    request: {
        id: string;
        householdId: string;
        householdName: string | null;
        householdEmail: string | null;
        householdPhone: string | null;
        householdGrid: string | null;
        requestedEnergyKwh: string;
        remainingRequestedKwh?: number;
        reason: string | null;
        status: string;
        requestedAt: Date;
    };
    offer: {
        id: string;
        ownerId: string;
        ownerName: string | null;
        ownerEmail: string | null;
        ownerPhone: string | null;
        ownerGrid: string | null;
        energyAmountKwh: string;
        availableOfferKwh?: number;
        minimumBatteryPercent: string | null;
        status: string;
        offeredAt: Date;
        expiresAt: Date | null;
    };
}

// ============================================================================
// Service Methods
// ============================================================================

/**
 * Retrieve all dispatches with joined request, offer, household, solar owner, and manager details.
 */
export async function getDispatches(filter?: {
    requestId?: string;
    offerId?: string;
    managerId?: string;
    householdId?: string;
}) {
    const conditions = [];
    if (filter?.requestId) conditions.push(eq(dispatches.requestId, filter.requestId));
    if (filter?.offerId) conditions.push(eq(dispatches.offerId, filter.offerId));
    if (filter?.managerId) conditions.push(eq(dispatches.managerId, filter.managerId));
    if (filter?.householdId) conditions.push(eq(energyRequests.householdId, filter.householdId));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await db
        .select({
            id: dispatches.id,
            offerId: dispatches.offerId,
            requestId: dispatches.requestId,
            managerId: dispatches.managerId,
            dispatchedEnergyKwh: dispatches.dispatchedEnergyKwh,
            dispatchedAt: dispatches.dispatchedAt,
            notes: dispatches.notes,
            managerName: users.name,
            managerEmail: users.email,
            managerRole: users.role,
        })
        .from(dispatches)
        .innerJoin(users, eq(dispatches.managerId, users.id))
        .innerJoin(energyRequests, eq(dispatches.requestId, energyRequests.id))
        .where(whereClause)
        .orderBy(desc(dispatches.dispatchedAt));

    // Enhance each row with request and offer details
    const dispatchesWithDetails = await Promise.all(
        rows.map(async (row) => {
            return getDispatchById(row.id);
        })
    );

    return dispatchesWithDetails;
}

/**
 * Retrieve all energy dispatches (allocations) specifically for a given household user.
 * Guarantees that only dispatches matching the household's energy requests are returned.
 */
export async function getDispatchesByHousehold(householdId: string): Promise<DispatchDetails[]> {
    if (!householdId) {
        throw new BadRequestError("householdId parameter is required");
    }

    return getDispatches({ householdId });
}

/**
 * Retrieve a single dispatch record by ID with full joined relationships.
 */
export async function getDispatchById(dispatchId: string): Promise<DispatchDetails> {
    if (!dispatchId) {
        throw new BadRequestError("Dispatch ID is required");
    }

    const [dispatchRecord] = await db
        .select()
        .from(dispatches)
        .where(eq(dispatches.id, dispatchId))
        .limit(1);

    if (!dispatchRecord) {
        throw new NotFoundError(`Dispatch with ID '${dispatchId}' not found`);
    }

    // 1. Fetch manager details
    const [managerRecord] = await db
        .select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
        })
        .from(users)
        .where(eq(users.id, dispatchRecord.managerId))
        .limit(1);

    // 2. Fetch request details with household info
    const [requestRecord] = await db
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
        })
        .from(energyRequests)
        .innerJoin(users, eq(energyRequests.householdId, users.id))
        .where(eq(energyRequests.id, dispatchRecord.requestId))
        .limit(1);

    // 3. Fetch offer details with solar owner info
    const [offerRecord] = await db
        .select({
            id: solarOffers.id,
            ownerId: solarOffers.ownerId,
            ownerName: users.name,
            ownerEmail: users.email,
            ownerPhone: users.phone,
            ownerGrid: users.assignedGrid,
            energyAmountKwh: solarOffers.energyAmountKwh,
            minimumBatteryPercent: solarOffers.minimumBatteryPercent,
            status: solarOffers.status,
            offeredAt: solarOffers.offeredAt,
            expiresAt: solarOffers.expiresAt,
        })
        .from(solarOffers)
        .innerJoin(users, eq(solarOffers.ownerId, users.id))
        .where(eq(solarOffers.id, dispatchRecord.offerId))
        .limit(1);

    // 4. Calculate dynamic remaining capacities after dispatches
    const requestDispatches = await db
        .select({ dispatchedEnergyKwh: dispatches.dispatchedEnergyKwh })
        .from(dispatches)
        .where(eq(dispatches.requestId, dispatchRecord.requestId));
    const totalDispatchedForRequest = requestDispatches.reduce(
        (sum, d) => sum + parseFloat(d.dispatchedEnergyKwh),
        0
    );
    const requestedKwhNum = parseFloat(requestRecord?.requestedEnergyKwh || "0");
    const remainingRequestedKwh = Math.max(0, requestedKwhNum - totalDispatchedForRequest);

    const offerDispatches = await db
        .select({ dispatchedEnergyKwh: dispatches.dispatchedEnergyKwh })
        .from(dispatches)
        .where(eq(dispatches.offerId, dispatchRecord.offerId));
    const totalDispatchedFromOffer = offerDispatches.reduce(
        (sum, d) => sum + parseFloat(d.dispatchedEnergyKwh),
        0
    );
    const offeredKwhNum = parseFloat(offerRecord?.energyAmountKwh || "0");
    const availableOfferKwh = Math.max(0, offeredKwhNum - totalDispatchedFromOffer);

    return {
        id: dispatchRecord.id,
        offerId: dispatchRecord.offerId,
        requestId: dispatchRecord.requestId,
        managerId: dispatchRecord.managerId,
        dispatchedEnergyKwh: dispatchRecord.dispatchedEnergyKwh,
        dispatchedAt: dispatchRecord.dispatchedAt,
        notes: dispatchRecord.notes,
        manager: managerRecord ?? {
            id: dispatchRecord.managerId,
            name: null,
            email: null,
            role: "manager",
        },
        request: requestRecord
            ? {
                ...requestRecord,
                remainingRequestedKwh,
            }
            : {
                id: dispatchRecord.requestId,
                householdId: "",
                householdName: null,
                householdEmail: null,
                householdPhone: null,
                householdGrid: null,
                requestedEnergyKwh: "0",
                remainingRequestedKwh: 0,
                reason: null,
                status: "unknown",
                requestedAt: new Date(),
            },
        offer: offerRecord
            ? {
                ...offerRecord,
                availableOfferKwh,
            }
            : {
                id: dispatchRecord.offerId,
                ownerId: "",
                ownerName: null,
                ownerEmail: null,
                ownerPhone: null,
                ownerGrid: null,
                energyAmountKwh: "0",
                availableOfferKwh: 0,
                minimumBatteryPercent: null,
                status: "unknown",
                offeredAt: new Date(),
                expiresAt: null,
            },
    };
}

/**
 * Create a new energy dispatch record.
 * 
 * Validates:
 * 1. Manager identity and authorization (must be role === "manager")
 * 2. Energy request exists and is in "approved" state
 * 3. Solar offer exists and is in "approved" state (and not expired)
 * 4. Dispatched energy amount is strictly greater than 0
 * 5. Dispatched energy does not exceed the remaining requested amount
 * 6. Dispatched energy does not exceed the available remaining solar offer energy
 * 
 * Creates:
 * 1. dispatches record
 * 2. audit_logs record
 * 
 * Note: Status transitions on energy_requests and solar_offers will be handled
 * in subsequent dedicated subtasks per project specifications.
 */
export interface ValidateDispatchInput {
    offerId: string;
    requestId: string;
    dispatchedEnergyKwh: number | string;
}

export interface DispatchEnergyValidationResult {
    isValid: true;
    dispatchAmount: number;
    request: {
        id: string;
        householdId: string;
        householdName: string | null;
        requestedEnergyKwh: string;
        remainingRequestedKwh: number;
        status: string;
    };
    offer: {
        id: string;
        ownerId: string;
        ownerName: string | null;
        energyAmountKwh: string;
        availableOfferKwh: number;
        status: string;
        expiresAt: Date | null;
    };
}

/**
 * Validate that an energy request and solar offer are valid, dispatchable,
 * and have sufficient remaining energy capacity before creating a dispatch.
 * 
 * Fetches fresh records directly from Neon PostgreSQL, guaranteeing that
 * stale client UI state cannot produce an invalid dispatch.
 */
export async function validateDispatchEnergy(
    input: ValidateDispatchInput
): Promise<DispatchEnergyValidationResult> {
    if (!input) {
        throw new BadRequestError("Validation payload is required");
    }

    const { offerId, requestId } = input;

    if (!offerId || typeof offerId !== "string" || !offerId.trim()) {
        throw new BadRequestError("offerId is required and must be a non-empty string");
    }

    if (!requestId || typeof requestId !== "string" || !requestId.trim()) {
        throw new BadRequestError("requestId is required and must be a non-empty string");
    }

    const dispatchAmount = parseFloat(String(input.dispatchedEnergyKwh));
    if (isNaN(dispatchAmount) || dispatchAmount <= 0) {
        throw new BadRequestError(
            `Dispatched energy amount must be greater than zero. Received: '${input.dispatchedEnergyKwh}'`
        );
    }

    // 1. Fetch fresh energy request from DB with user details
    const [requestRecord] = await db
        .select({
            id: energyRequests.id,
            householdId: energyRequests.householdId,
            householdName: users.name,
            requestedEnergyKwh: energyRequests.requestedEnergyKwh,
            status: energyRequests.status,
            requestedAt: energyRequests.requestedAt,
        })
        .from(energyRequests)
        .leftJoin(users, eq(energyRequests.householdId, users.id))
        .where(eq(energyRequests.id, requestId.trim()))
        .limit(1);

    if (!requestRecord) {
        throw new NotFoundError(`Energy request with ID '${requestId}' not found.`);
    }

    if (requestRecord.status !== "approved") {
        throw new BadRequestError(
            `Cannot dispatch to energy request '${requestId}': Request status must be 'approved' for dispatching, but is currently '${requestRecord.status}'.`
        );
    }

    const requestedAmount = parseFloat(requestRecord.requestedEnergyKwh);
    if (isNaN(requestedAmount) || requestedAmount <= 0) {
        throw new BadRequestError(
            `Requested energy amount on request '${requestId}' is invalid: '${requestRecord.requestedEnergyKwh}'.`
        );
    }

    if (dispatchAmount > requestedAmount) {
        throw new BadRequestError(
            `Dispatched energy (${dispatchAmount} kWh) cannot exceed the total requested energy (${requestedAmount} kWh).`
        );
    }

    // Check cumulative dispatches already allocated to this energy request
    const existingRequestDispatches = await db
        .select({ dispatchedEnergyKwh: dispatches.dispatchedEnergyKwh })
        .from(dispatches)
        .where(eq(dispatches.requestId, requestId.trim()));

    const totalDispatchedForRequest = existingRequestDispatches.reduce(
        (sum, d) => sum + parseFloat(d.dispatchedEnergyKwh),
        0
    );
    const remainingRequestedKwh = Math.max(0, requestedAmount - totalDispatchedForRequest);

    if (dispatchAmount > remainingRequestedKwh + 0.0001) {
        throw new BadRequestError(
            `Dispatched energy (${dispatchAmount} kWh) exceeds the remaining unfulfilled requested energy (${remainingRequestedKwh.toFixed(3)} kWh). Already dispatched: ${totalDispatchedForRequest.toFixed(3)} kWh.`
        );
    }

    // 2. Fetch fresh solar offer from DB with owner details
    const [offerRecord] = await db
        .select({
            id: solarOffers.id,
            ownerId: solarOffers.ownerId,
            ownerName: users.name,
            energyAmountKwh: solarOffers.energyAmountKwh,
            status: solarOffers.status,
            expiresAt: solarOffers.expiresAt,
            createdAt: solarOffers.createdAt,
        })
        .from(solarOffers)
        .leftJoin(users, eq(solarOffers.ownerId, users.id))
        .where(eq(solarOffers.id, offerId.trim()))
        .limit(1);

    if (!offerRecord) {
        throw new NotFoundError(`Solar offer with ID '${offerId}' not found.`);
    }

    if (offerRecord.status !== "approved") {
        throw new BadRequestError(
            `Cannot dispatch from solar offer '${offerId}': Offer status must be 'approved' for dispatching, but is currently '${offerRecord.status}'.`
        );
    }

    if (offerRecord.expiresAt && new Date(offerRecord.expiresAt).getTime() < Date.now()) {
        throw new BadRequestError(
            `Solar offer '${offerId}' has expired on ${new Date(offerRecord.expiresAt).toISOString()} and is no longer available for dispatch.`
        );
    }

    const offeredAmount = parseFloat(offerRecord.energyAmountKwh);
    if (isNaN(offeredAmount) || offeredAmount <= 0) {
        throw new BadRequestError(
            `Offered energy amount on solar offer '${offerId}' is invalid: '${offerRecord.energyAmountKwh}'.`
        );
    }

    if (dispatchAmount > offeredAmount) {
        throw new BadRequestError(
            `Dispatched energy (${dispatchAmount} kWh) cannot exceed the total solar offer capacity (${offeredAmount} kWh).`
        );
    }

    const existingOfferDispatches = await db
        .select({ dispatchedEnergyKwh: dispatches.dispatchedEnergyKwh })
        .from(dispatches)
        .where(eq(dispatches.offerId, offerId.trim()));

    const totalDispatchedFromOffer = existingOfferDispatches.reduce(
        (sum, d) => sum + parseFloat(d.dispatchedEnergyKwh),
        0
    );
    const availableOfferKwh = Math.max(0, offeredAmount - totalDispatchedFromOffer);

    if (dispatchAmount > availableOfferKwh + 0.0001) {
        throw new BadRequestError(
            `Dispatched energy (${dispatchAmount} kWh) exceeds the remaining available offer energy (${availableOfferKwh.toFixed(3)} kWh). Already allocated: ${totalDispatchedFromOffer.toFixed(3)} kWh.`
        );
    }

    return {
        isValid: true,
        dispatchAmount,
        request: {
            id: requestRecord.id,
            householdId: requestRecord.householdId,
            householdName: requestRecord.householdName,
            requestedEnergyKwh: requestRecord.requestedEnergyKwh,
            remainingRequestedKwh,
            status: requestRecord.status,
        },
        offer: {
            id: offerRecord.id,
            ownerId: offerRecord.ownerId,
            ownerName: offerRecord.ownerName,
            energyAmountKwh: offerRecord.energyAmountKwh,
            availableOfferKwh,
            status: offerRecord.status,
            expiresAt: offerRecord.expiresAt,
        },
    };
}

/**
 * Create a new energy dispatch record.
 * 
 * Validates:
 * 1. Manager identity and authorization (must be role === "manager")
 * 2. Energy request exists and is in "approved" state
 * 3. Solar offer exists and is in "approved" state (and not expired)
 * 4. Dispatched energy amount is strictly greater than 0
 * 5. Dispatched energy does not exceed the remaining requested amount
 * 6. Dispatched energy does not exceed the available remaining solar offer energy
 * 
 * Creates:
 * 1. dispatches record
 * 2. audit_logs record
 * 
 * Note: Status transitions on energy_requests and solar_offers will be handled
 * in subsequent dedicated subtasks per project specifications.
 */
export async function createDispatch(input: CreateDispatchInput): Promise<DispatchDetails> {
    // -------------------------------------------------------------------------
    // 1. Basic Input Validation
    // -------------------------------------------------------------------------
    if (!input) {
        throw new BadRequestError("Dispatch payload is required");
    }

    const { offerId, requestId, managerId } = input;

    if (!managerId || typeof managerId !== "string" || !managerId.trim()) {
        throw new UnauthorizedError("managerId is required to create a dispatch");
    }

    // -------------------------------------------------------------------------
    // 2. Validate Manager Authorization
    // -------------------------------------------------------------------------
    const [manager] = await db
        .select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
        })
        .from(users)
        .where(eq(users.id, managerId.trim()))
        .limit(1);

    if (!manager) {
        throw new NotFoundError(`Manager with ID '${managerId}' was not found in the database.`);
    }

    if (manager.role !== "manager") {
        throw new ForbiddenError(
            `Forbidden: User '${managerId}' is a '${manager.role}', but only managers can create energy dispatches.`
        );
    }

    // -------------------------------------------------------------------------
    // 3. Validate Available Energy and Request/Offer Validity
    // -------------------------------------------------------------------------
    const validated = await validateDispatchEnergy({
        offerId,
        requestId,
        dispatchedEnergyKwh: input.dispatchedEnergyKwh,
    });

    const dispatchAmount = validated.dispatchAmount;
    const request = validated.request;
    const offer = validated.offer;
    const remainingRequestedKwh = validated.request.remainingRequestedKwh;
    const availableOfferKwh = validated.offer.availableOfferKwh;

    // -------------------------------------------------------------------------
    // 4. Calculate Updated Remaining Energies & Determine Target Statuses
    // -------------------------------------------------------------------------
    const newRemainingRequest = Math.max(0, remainingRequestedKwh - dispatchAmount);
    const newRemainingOffer = Math.max(0, availableOfferKwh - dispatchAmount);

    // Request becomes 'fulfilled' when its required amount has been completely allocated,
    // otherwise retains its active 'approved' state.
    const newRequestStatus: "approved" | "fulfilled" =
        newRemainingRequest <= 0.0001 ? "fulfilled" : "approved";

    // Offer becomes 'completed' when all available offered energy has been dispatched,
    // otherwise retains its active 'approved' state.
    const newOfferStatus: "approved" | "completed" =
        newRemainingOffer <= 0.0001 ? "completed" : "approved";

    // -------------------------------------------------------------------------
    // 5. Transactional Execution with Rollback Protection
    // -------------------------------------------------------------------------
    const dispatchId =
        input.id && input.id.trim()
            ? input.id.trim()
            : `dsp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const dispatchedAtDate = input.dispatchedAt ? new Date(input.dispatchedAt) : new Date();
    const notesContent = input.notes?.trim() || null;

    let dispatchInserted = false;
    let requestUpdated = false;
    let offerUpdated = false;

    try {
        // a. Insert dispatches record
        await db.insert(dispatches).values({
            id: dispatchId,
            offerId: offerId.trim(),
            requestId: requestId.trim(),
            managerId: managerId.trim(),
            dispatchedEnergyKwh: dispatchAmount.toFixed(3),
            dispatchedAt: dispatchedAtDate,
            notes: notesContent,
        });
        dispatchInserted = true;

        // b. Update energy_requests status if transitioned to fulfilled
        if (newRequestStatus !== request.status) {
            await db
                .update(energyRequests)
                .set({ status: newRequestStatus })
                .where(eq(energyRequests.id, requestId.trim()));
            requestUpdated = true;
        }

        // c. Update solar_offers status if transitioned to completed
        if (newOfferStatus !== offer.status) {
            await db
                .update(solarOffers)
                .set({ status: newOfferStatus })
                .where(eq(solarOffers.id, offerId.trim()));
            offerUpdated = true;
        }

        // d. Insert Audit Trail Log
        const auditId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        await db.insert(auditLogs).values({
            id: auditId,
            userId: managerId.trim(),
            action: "CREATE_DISPATCH",
            entityType: "dispatch",
            entityId: dispatchId,
            details: JSON.stringify({
                dispatchId,
                offerId: offerId.trim(),
                requestId: requestId.trim(),
                managerId: managerId.trim(),
                managerName: manager.name,
                dispatchedEnergyKwh: dispatchAmount.toFixed(3),
                requestedEnergyKwh: request.requestedEnergyKwh,
                previousRequestStatus: request.status,
                newRequestStatus,
                remainingRequestedKwh: newRemainingRequest.toFixed(3),
                offerEnergyKwh: offer.energyAmountKwh,
                previousOfferStatus: offer.status,
                newOfferStatus,
                remainingOfferKwh: newRemainingOffer.toFixed(3),
                notes: notesContent,
                dispatchedAt: dispatchedAtDate.toISOString(),
            }),
            createdAt: new Date(),
        });
    } catch (error) {
        // Rollback any executed writes to maintain database integrity
        if (offerUpdated) {
            await db
                .update(solarOffers)
                .set({ status: offer.status as any })
                .where(eq(solarOffers.id, offerId.trim()))
                .catch(() => {});
        }
        if (requestUpdated) {
            await db
                .update(energyRequests)
                .set({ status: request.status as any })
                .where(eq(energyRequests.id, requestId.trim()))
                .catch(() => {});
        }
        if (dispatchInserted) {
            await db
                .delete(dispatches)
                .where(eq(dispatches.id, dispatchId))
                .catch(() => {});
        }
        throw error;
    }

    // -------------------------------------------------------------------------
    // 6. Return Full Details
    // -------------------------------------------------------------------------
    return getDispatchById(dispatchId);
}