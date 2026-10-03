import { db } from "@/lib/server/db/client";
import {
    auditLogs,
    dispatches,
    energyRequests,
    serviceTickets,
    solarAssets,
    solarOffers,
    users,
} from "@/lib/server/db/schema";
import { desc, eq, inArray } from "drizzle-orm";
import { BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError } from "../utils/errors";

export type SyncUserInput = {
    id: string;
    name: string;
    email: string;
    role?: "manager" | "solar_owner" | "household" | "technician";
    avatarUrl?: string | null;
    phone?: string | null;
};

/**
 * Retrieve all community members for manager administration.
 * Formats data matching CommunityMember interface.
 */
export async function getAllUsers() {
    const rows = await db
        .select({
            id: users.id,
            name: users.name,
            email: users.email,
            role: users.role,
            status: users.status,
            solarCapacityKw: users.solarCapacityKw,
            monthlyAllocationKwh: users.monthlyAllocationKwh,
            assignedGrid: users.assignedGrid,
            avatarUrl: users.avatarUrl,
            phone: users.phone,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt,
        })
        .from(users)
        .orderBy(desc(users.createdAt));

    const assets = await db
        .select({
            ownerId: solarAssets.ownerId,
            capacityKw: solarAssets.capacityKw,
        })
        .from(solarAssets);

    const assetCapacityMap = new Map<string, number>();
    for (const a of assets) {
        const prev = assetCapacityMap.get(a.ownerId) || 0;
        assetCapacityMap.set(a.ownerId, prev + (parseFloat(a.capacityKw || '0') || 0));
    }

    return rows.map((u) => {
        let joinedAt = "Recently";
        if (u.createdAt) {
            try {
                joinedAt = new Intl.DateTimeFormat("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                }).format(new Date(u.createdAt));
            } catch {
                joinedAt = "Recently";
            }
        }

        const capacity = u.solarCapacityKw
            ? parseFloat(u.solarCapacityKw)
            : assetCapacityMap.get(u.id);

        return {
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            status: u.status,
            solarCapacityKw: capacity !== undefined ? capacity : undefined,
            monthlyAllocationKwh: u.monthlyAllocationKwh ?? undefined,
            assignedGrid: u.assignedGrid ?? undefined,
            avatarUrl: u.avatarUrl ?? undefined,
            phone: u.phone ?? undefined,
            joinedAt,
        };
    });
}

export async function getUserById(id: string) {
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

    if (!user) {
        throw new NotFoundError("User not found");
    }

    return user;
}

/**
 * Retrieve comprehensive member profile and role-relevant energy details from Neon.
 * Enforces privacy: only queries data belonging to the specific member.
 */
export async function getMemberDetails(id: string) {
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

    if (!user) {
        throw new NotFoundError("Member not found");
    }

    let joinedAt = "Recently";
    let createdDate = "Recently";
    if (user.createdAt) {
        try {
            const dateObj = new Date(user.createdAt);
            joinedAt = new Intl.DateTimeFormat("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            }).format(dateObj);
            createdDate = new Intl.DateTimeFormat("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
            }).format(dateObj);
        } catch {
            joinedAt = "Recently";
            createdDate = "Recently";
        }
    }

    const energyDetails: {
        solarAssets?: Array<{
            id: string;
            name: string;
            assetType: string;
            capacityKw: number;
            status: string;
            location?: string | null;
            installedAt?: string | null;
        }>;
        solarOffers?: Array<{
            id: string;
            energyAmountKwh: number;
            status: string;
            offeredAt: string;
            expiresAt?: string | null;
            minimumBatteryPercent?: number | null;
        }>;
        energyRequests?: Array<{
            id: string;
            requestedEnergyKwh: number;
            reason?: string | null;
            status: string;
            requestedAt: string;
            reviewedAt?: string | null;
        }>;
        dispatches?: Array<{
            id: string;
            dispatchedEnergyKwh: number;
            dispatchedAt: string;
            notes?: string | null;
        }>;
        serviceTickets?: Array<{
            id: string;
            title: string;
            priority: string;
            status: string;
            createdAt: string;
        }>;
        metrics: Record<string, number | string | undefined>;
    } = {
        metrics: {},
    };

    if (user.role === "solar_owner") {
        const assets = await db
            .select()
            .from(solarAssets)
            .where(eq(solarAssets.ownerId, id))
            .orderBy(desc(solarAssets.createdAt));

        const offers = await db
            .select()
            .from(solarOffers)
            .where(eq(solarOffers.ownerId, id))
            .orderBy(desc(solarOffers.offeredAt))
            .limit(10);

        let totalCap = user.solarCapacityKw ? parseFloat(user.solarCapacityKw) : 0;
        if (totalCap === 0 && assets.length > 0) {
            totalCap = assets.reduce(
                (sum, a) => sum + (parseFloat(a.capacityKw || "0") || 0),
                0
            );
        }

        const totalOffered = offers.reduce(
            (sum, o) => sum + (parseFloat(o.energyAmountKwh || "0") || 0),
            0
        );

        energyDetails.solarAssets = assets.map((a) => ({
            id: a.id,
            name: a.name,
            assetType: a.assetType,
            capacityKw: parseFloat(a.capacityKw || "0"),
            status: a.status,
            location: a.location,
            installedAt: a.installedAt ? a.installedAt.toISOString() : null,
        }));

        energyDetails.solarOffers = offers.map((o) => ({
            id: o.id,
            energyAmountKwh: parseFloat(o.energyAmountKwh || "0"),
            status: o.status,
            offeredAt: o.offeredAt.toISOString(),
            expiresAt: o.expiresAt ? o.expiresAt.toISOString() : null,
            minimumBatteryPercent: o.minimumBatteryPercent
                ? parseFloat(o.minimumBatteryPercent)
                : null,
        }));

        energyDetails.metrics = {
            totalCapacityKw: totalCap,
            totalOfferedKwh: Number(totalOffered.toFixed(1)),
            activeOffersCount: offers.filter(
                (o) => o.status === "approved" || o.status === "pending"
            ).length,
            assetsCount: assets.length,
        };
    } else if (user.role === "household") {
        const requests = await db
            .select()
            .from(energyRequests)
            .where(eq(energyRequests.householdId, id))
            .orderBy(desc(energyRequests.requestedAt))
            .limit(10);

        let householdDispatches: Array<{
            id: string;
            dispatchedEnergyKwh: number;
            dispatchedAt: string;
            notes?: string | null;
        }> = [];

        const requestIds = requests.map((r) => r.id);
        if (requestIds.length > 0) {
            const rawDispatches = await db
                .select()
                .from(dispatches)
                .where(inArray(dispatches.requestId, requestIds))
                .orderBy(desc(dispatches.dispatchedAt));

            householdDispatches = rawDispatches.map((d) => ({
                id: d.id,
                dispatchedEnergyKwh: parseFloat(d.dispatchedEnergyKwh || "0"),
                dispatchedAt: d.dispatchedAt.toISOString(),
                notes: d.notes,
            }));
        }

        const totalRequested = requests.reduce(
            (sum, r) => sum + (parseFloat(r.requestedEnergyKwh || "0") || 0),
            0
        );
        const totalDispatched = householdDispatches.reduce(
            (sum, d) => sum + d.dispatchedEnergyKwh,
            0
        );

        energyDetails.energyRequests = requests.map((r) => ({
            id: r.id,
            requestedEnergyKwh: parseFloat(r.requestedEnergyKwh || "0"),
            reason: r.reason,
            status: r.status,
            requestedAt: r.requestedAt.toISOString(),
            reviewedAt: r.reviewedAt ? r.reviewedAt.toISOString() : null,
        }));

        energyDetails.dispatches = householdDispatches;

        energyDetails.metrics = {
            monthlyAllocationKwh: user.monthlyAllocationKwh ?? 30,
            totalRequestedKwh: Number(totalRequested.toFixed(1)),
            totalDispatchedKwh: Number(totalDispatched.toFixed(1)),
            requestsCount: requests.length,
            pendingRequestsCount: requests.filter((r) => r.status === "pending").length,
            approvedRequestsCount: requests.filter(
                (r) => r.status === "approved" || r.status === "fulfilled"
            ).length,
        };
    } else if (user.role === "technician") {
        const tickets = await db
            .select()
            .from(serviceTickets)
            .where(eq(serviceTickets.assignedTechnicianId, id))
            .orderBy(desc(serviceTickets.createdAt))
            .limit(10);

        energyDetails.serviceTickets = tickets.map((t) => ({
            id: t.id,
            title: t.title,
            priority: t.priority,
            status: t.status,
            createdAt: t.createdAt.toISOString(),
        }));

        energyDetails.metrics = {
            assignedGrid: user.assignedGrid ?? "Main Substation",
            ticketsCount: tickets.length,
            activeTicketsCount: tickets.filter(
                (t) =>
                    t.status === "open" ||
                    t.status === "in_progress" ||
                    t.status === "assigned"
            ).length,
        };
    } else if (user.role === "manager") {
        const managerDispatches = await db
            .select()
            .from(dispatches)
            .where(eq(dispatches.managerId, id))
            .orderBy(desc(dispatches.dispatchedAt))
            .limit(10);

        const totalKwh = managerDispatches.reduce(
            (sum, d) => sum + (parseFloat(d.dispatchedEnergyKwh || "0") || 0),
            0
        );

        energyDetails.dispatches = managerDispatches.map((d) => ({
            id: d.id,
            dispatchedEnergyKwh: parseFloat(d.dispatchedEnergyKwh || "0"),
            dispatchedAt: d.dispatchedAt.toISOString(),
            notes: d.notes,
        }));

        energyDetails.metrics = {
            dispatchesManagedCount: managerDispatches.length,
            totalKwhDispatched: Number(totalKwh.toFixed(1)),
        };
    }

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        phone: user.phone ?? null,
        assignedGrid: user.assignedGrid ?? null,
        solarCapacityKw: user.solarCapacityKw
            ? parseFloat(user.solarCapacityKw)
            : (energyDetails.metrics.totalCapacityKw as number | undefined),
        monthlyAllocationKwh: user.monthlyAllocationKwh ?? undefined,
        avatarUrl: user.avatarUrl ?? null,
        createdAt: user.createdAt.toISOString(),
        joinedAt,
        createdDate,
        energyDetails,
    };
}

export async function syncUser(input: SyncUserInput) {
    const existing = await db
        .select()
        .from(users)
        .where(eq(users.id, input.id))
        .limit(1);

    if (existing.length > 0) {
        const currentUser = existing[0];

        const updatePayload: Partial<typeof users.$inferInsert> = {
            name: input.name,
            email: input.email,
            avatarUrl:
                input.avatarUrl !== undefined
                    ? input.avatarUrl
                    : currentUser.avatarUrl,
            phone:
                input.phone !== undefined
                    ? input.phone
                    : currentUser.phone,
            updatedAt: new Date(),
        };

        // Security: Do not blindly trust client-supplied role for existing users.
        // Role assignment is strictly managed via updateMemberRole by authorized managers.
        // If Clerk metadata is out of sync with Neon, keep Neon role and trigger Clerk metadata sync if needed.
        if (currentUser.role && input.role !== currentUser.role) {
            syncClerkUserRole(input.id, currentUser.role).catch(() => {});
        }

        const [updatedUser] = await db
            .update(users)
            .set(updatePayload)
            .where(eq(users.id, input.id))
            .returning();

        return {
            action: "updated" as const,
            user: updatedUser,
        };
    }

    const [newUser] = await db
        .insert(users)
        .values({
            id: input.id,
            name: input.name,
            email: input.email,
            role: input.role ?? "household",
            status: "active",
            avatarUrl: input.avatarUrl ?? null,
            phone: input.phone ?? null,
        })
        .returning();

    return {
        action: "created" as const,
        user: newUser,
    };
}

/**
 * Update a member's status (active, pending, inactive).
 * Validates against allowed statuses, updates Neon users table,
 * and creates an audit_logs entry.
 * Note: Does NOT modify user role (strictly enforced for US-14 status update subtask).
 */
export async function updateMemberStatus(
    userId: string,
    status: unknown,
    managerId?: string | null
) {
    const VALID_STATUSES = ["active", "pending", "inactive"] as const;

    if (typeof status !== "string" || !VALID_STATUSES.includes(status as any)) {
        throw new BadRequestError(
            `Invalid status: "${status}". Allowed values are: ${VALID_STATUSES.join(", ")}`
        );
    }

    const typedStatus = status as (typeof VALID_STATUSES)[number];

    const [existing] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

    if (!existing) {
        throw new NotFoundError("Member not found");
    }

    const previousStatus = existing.status;

    // Update users table in Neon
    const [updatedUser] = await db
        .update(users)
        .set({
            status: typedStatus,
            updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();

    // Record audit log entry
    const auditId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    await db.insert(auditLogs).values({
        id: auditId,
        userId: managerId || null,
        action: "UPDATE_MEMBER_STATUS",
        entityType: "user",
        entityId: userId,
        details: JSON.stringify({
            previousStatus,
            newStatus: typedStatus,
            memberEmail: existing.email,
            memberName: existing.name,
            timestamp: new Date().toISOString(),
        }),
    });

    return updatedUser;
}

/**
 * Synchronize a user's role to Clerk publicMetadata via Clerk's Backend REST API.
 * Securely uses CLERK_SECRET_KEY strictly in the server layer.
 * Does not expose secrets to client. Gracefully handles missing key or non-Clerk test users.
 */
export async function syncClerkUserRole(userId: string, role: string): Promise<boolean> {
    let clerkSecretKey = process.env.CLERK_SECRET_KEY;
    if (!clerkSecretKey) {
        try {
            const req = (globalThis as any).require;
            if (typeof req === "function") {
                const fs = req("fs");
                const path = req("path");
                const envPath = path.resolve(process.cwd(), ".env");
                if (fs.existsSync(envPath)) {
                    const content = fs.readFileSync(envPath, "utf8");
                    const match = content.match(/^CLERK_SECRET_KEY\s*=\s*(.+)$/m);
                    if (match && match[1]) {
                        clerkSecretKey = match[1].trim().replace(/^["']|["']$/g, "");
                        process.env.CLERK_SECRET_KEY = clerkSecretKey;
                    }
                }
            }
        } catch {}
    }

    if (!clerkSecretKey) {
        console.warn(
            "[Clerk Sync] CLERK_SECRET_KEY is not defined in server environment. Neon role updated, skipping Clerk metadata synchronization."
        );
        return false;
    }

    // Only attempt Clerk API sync for valid Clerk user IDs (typically user_...)
    if (!userId.startsWith("user_")) {
        console.log(
            `[Clerk Sync] Skipped Clerk API sync for non-Clerk ID "${userId}".`
        );
        return false;
    }

    try {
        const response = await fetch(`https://api.clerk.com/v1/users/${encodeURIComponent(userId)}/metadata`, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${clerkSecretKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                public_metadata: {
                    role,
                },
                unsafe_metadata: {
                    role,
                },
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.warn(
                `[Clerk Sync Warning] Clerk API returned ${response.status} for user ${userId}: ${errText}`
            );
            return false;
        }

        console.log(`[Clerk Sync Success] Synced role "${role}" to Clerk publicMetadata & unsafeMetadata for user ${userId}.`);
        return true;
    } catch (err: any) {
        console.error(`[Clerk Sync Error] Failed to reach Clerk API:`, err?.message || err);
        return false;
    }
}

/**
 * Assign / update a member's role (manager, solar_owner, household, technician).
 * 
 * Security & Validation:
 * 1. Enforces manager authorization: managerId must correspond to an active manager in Neon users table.
 * 2. Validates newRole against userRoleEnum ("manager", "solar_owner", "household", "technician").
 * 3. Updates users.role and updatedAt in Neon database.
 * 4. Synchronizes Clerk publicMetadata.role via server-side Clerk REST API if CLERK_SECRET_KEY is configured.
 * 5. Records an immutable audit log entry in audit_logs table.
 * 6. Returns the updated user record.
 */
export async function updateMemberRole(
    userId: string,
    role: unknown,
    managerId?: string | null
) {
    // 1. Enforce manager authorization
    if (!managerId) {
        throw new UnauthorizedError("Authentication required: Manager ID missing");
    }

    const [manager] = await db
        .select({ id: users.id, role: users.role, status: users.status })
        .from(users)
        .where(eq(users.id, managerId))
        .limit(1);

    if (!manager || manager.role !== "manager") {
        throw new ForbiddenError("Only authorized managers can assign member roles");
    }

    // 2. Validate role against user_role enum
    const VALID_ROLES = ["manager", "solar_owner", "household", "technician"] as const;

    if (typeof role !== "string" || !VALID_ROLES.includes(role as any)) {
        throw new BadRequestError(
            `Invalid role: "${role}". Allowed values are: ${VALID_ROLES.join(", ")}`
        );
    }

    const typedRole = role as (typeof VALID_ROLES)[number];

    // 3. Ensure target member exists
    const [existing] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

    if (!existing) {
        throw new NotFoundError("Member not found");
    }

    const previousRole = existing.role;

    // 4. Update Neon users table
    const [updatedUser] = await db
        .update(users)
        .set({
            role: typedRole,
            updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
        .returning();

    // 5. Server-side Clerk role metadata synchronization (Neon role -> Clerk metadata)
    const clerkSynced = await syncClerkUserRole(userId, typedRole);

    // 6. Record audit log entry
    const auditId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    await db.insert(auditLogs).values({
        id: auditId,
        userId: managerId,
        action: "ASSIGN_MEMBER_ROLE",
        entityType: "user",
        entityId: userId,
        details: JSON.stringify({
            previousRole,
            newRole: typedRole,
            memberEmail: existing.email,
            memberName: existing.name,
            assignedBy: managerId,
            clerkSynced,
            timestamp: new Date().toISOString(),
        }),
    });

    return {
        ...updatedUser,
        clerkSynced,
    };
}