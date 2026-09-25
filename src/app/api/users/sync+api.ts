import { db } from "@/lib/server/db/client";
import { users } from "@/lib/server/db/schema";
import { eq } from "drizzle-orm";

interface SyncUserRequest {
    id: string;
    name: string;
    email: string;
    role?: "manager" | "solar_owner" | "household" | "technician";
    avatarUrl?: string | null;
    phone?: string | null;
}

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as SyncUserRequest;

        if (!body.id || !body.email || !body.name) {
            return Response.json(
                { error: "Missing required fields: id, email, and name are required." },
                { status: 400 }
            );
        }

        // Check if user already exists in Neon database
        const existingUsers = await db
            .select()
            .from(users)
            .where(eq(users.id, body.id))
            .limit(1);

        if (existingUsers.length > 0) {
            const existing = existingUsers[0];

            // Update user details while preserving assigned role & status unless specified
            const updatePayload: Partial<typeof users.$inferInsert> = {
                name: body.name,
                email: body.email,
                avatarUrl: body.avatarUrl !== undefined ? body.avatarUrl : existing.avatarUrl,
                phone: body.phone !== undefined ? body.phone : existing.phone,
                updatedAt: new Date(),
            };

            // If a valid role was passed from Clerk metadata and is different, update it
            if (body.role && body.role !== existing.role) {
                updatePayload.role = body.role;
            }

            const [updatedUser] = await db
                .update(users)
                .set(updatePayload)
                .where(eq(users.id, body.id))
                .returning();

            return Response.json({
                success: true,
                action: "updated",
                user: updatedUser,
            });
        }

        // Create new user record
        const [newUser] = await db
            .insert(users)
            .values({
                id: body.id,
                name: body.name,
                email: body.email,
                role: body.role ?? "household",
                status: "active",
                avatarUrl: body.avatarUrl ?? null,
                phone: body.phone ?? null,
            })
            .returning();

        return Response.json(
            {
                success: true,
                action: "created",
                user: newUser,
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("[API /api/users/sync Error]", error);
        return Response.json(
            { error: error?.message || "Failed to synchronize user" },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return Response.json(
                { error: "Query parameter 'userId' is required." },
                { status: 400 }
            );
        }

        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        if (!user) {
            return Response.json({ error: "User not found" }, { status: 404 });
        }

        return Response.json({ success: true, user });
    } catch (error: any) {
        console.error("[API /api/users/sync GET Error]", error);
        return Response.json(
            { error: error?.message || "Internal server error" },
            { status: 500 }
        );
    }
}
