import { db } from "@/lib/server/db/client";
import { solarAssets, users } from "@/lib/server/db/schema";
import { desc, eq } from "drizzle-orm";
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