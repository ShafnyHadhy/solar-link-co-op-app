import { db } from "@/lib/server/db/client";
import { users } from "@/lib/server/db/schema";
import { eq } from "drizzle-orm";
import { NotFoundError } from "../utils/errors";

export type SyncUserInput = {
    id: string;
    name: string;
    email: string;
    role?: "manager" | "solar_owner" | "household" | "technician";
    avatarUrl?: string | null;
    phone?: string | null;
};

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