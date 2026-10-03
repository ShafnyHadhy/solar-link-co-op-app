import { db } from "@/lib/server/db/client";
import {
    dispatches,
    energyRequests,
    serviceTickets,
    solarAssets,
    solarOffers,
    users,
} from "@/lib/server/db/schema";
import { desc, eq, inArray } from "drizzle-orm";
import { NotFoundError } from "../utils/errors";

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

        if (input.role && input.role !== currentUser.role) {
            updatePayload.role = input.role;
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