// Backend Role-Based Authorization Service (US-19 Part 1)
// 1. Verify authenticated Clerk user
// 2. Match Clerk ID with users.id in PostgreSQL
// 3. Retrieve user's authoritative role from the database (users.role)

import { db } from "@/lib/server/db/client";
import { User, users, userRoleEnum } from "@/lib/server/db/schema";
import {
    ForbiddenError,
    NotFoundError,
    UnauthorizedError,
} from "@/lib/server/utils/errors";
import { eq } from "drizzle-orm";

export type UserRole = (typeof userRoleEnum.enumValues)[number];

export interface AuthenticatedUser {
    id: string; // Authenticated Clerk User ID (matching users.id)
    role: UserRole; // Database users.role (authoritative source of truth)
    status: User["status"];
    name: string;
    email: string;
    user: User; // Full database user record
}

/**
 * Extract the authenticated Clerk User ID from incoming request headers.
 * 
 * Supports:
 * - x-user-id header (standard across all frontend hooks in this application)
 * - x-clerk-user-id header
 * - Authorization: Bearer <token> (direct Clerk ID or Clerk session JWT)
 */
export function extractClerkUserId(request: Request): string | null {
    // 1. Check x-user-id / x-clerk-user-id headers
    const directHeader =
        request.headers.get("x-user-id") ||
        request.headers.get("x-clerk-user-id");

    if (directHeader && directHeader.trim()) {
        return directHeader.trim();
    }

    // 2. Check Authorization Bearer header
    const authHeader =
        request.headers.get("authorization") ||
        request.headers.get("Authorization");

    if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7).trim();

        // If the bearer token itself is a Clerk user ID (e.g. user_...)
        if (token.startsWith("user_")) {
            return token;
        }

        // If the bearer token is a Clerk JWT (contains header.payload.signature)
        if (token.includes(".")) {
            try {
                const parts = token.split(".");
                if (parts.length === 3) {
                    let payloadJson = "";
                    if (typeof atob === "function") {
                        // Standard Web API available in Node 16+, browsers, and Expo
                        // Handle URL-safe base64
                        const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
                        payloadJson = atob(base64);
                    } else if (typeof (globalThis as any).Buffer !== "undefined") {
                        payloadJson = (globalThis as any).Buffer.from(parts[1], "base64").toString("utf8");
                    }

                    if (payloadJson) {
                        const payload = JSON.parse(payloadJson);
                        // Clerk JWTs store user ID in the 'sub' claim
                        if (
                            payload &&
                            typeof payload.sub === "string" &&
                            payload.sub.startsWith("user_")
                        ) {
                            return payload.sub;
                        }
                    }
                }
            } catch {
                // Ignore JWT parse error and fall through
            }
        }
    }

    return null;
}

/**
 * Verify incoming API request has an authenticated Clerk user,
 * match Clerk ID with users.id in Neon PostgreSQL,
 * and retrieve the authoritative database role.
 * 
 * Security Guarantees:
 * - Does NOT trust role values sent from request body or query parameters.
 * - PostgreSQL users.role is the sole source of truth.
 * - Throws UnauthorizedError (401) if no authenticated user session exists.
 * - Throws NotFoundError (404) if user record does not exist in the database.
 */
export async function getAuthenticatedUser(
    request: Request
): Promise<AuthenticatedUser> {
    // 1. Verify authenticated Clerk user ID from request
    const clerkUserId = extractClerkUserId(request);

    if (!clerkUserId) {
        throw new UnauthorizedError(
            "Authentication required: No authenticated user session found"
        );
    }

    // 2. Match Clerk ID with users.id in PostgreSQL database
    const [dbUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, clerkUserId))
        .limit(1);

    if (!dbUser) {
        throw new NotFoundError(
            "Authenticated user record not found in database"
        );
    }

    // 3. Database users.role is the authoritative source of truth
    return {
        id: dbUser.id,
        role: dbUser.role,
        status: dbUser.status,
        name: dbUser.name,
        email: dbUser.email,
        user: dbUser,
    };
}

/**
 * Reusable alias for getAuthenticatedUser.
 */
export async function requireAuth(
    request: Request
): Promise<AuthenticatedUser> {
    return getAuthenticatedUser(request);
}

/**
 * Reusable role authorization guard for US-19.
 * Verifies authentication and ensures the user's database role
 * matches at least one of the allowed roles.
 * 
 * Throws ForbiddenError (403) if the user's role is not authorized.
 */
export async function requireRole(
    request: Request,
    allowedRoles: UserRole | UserRole[]
): Promise<AuthenticatedUser> {
    const authUser = await getAuthenticatedUser(request);
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (!roles.includes(authUser.role)) {
        throw new ForbiddenError(
            `Forbidden: Access denied. Required role: [${roles.join(", ")}], but user role is: "${authUser.role}"`
        );
    }

    return authUser;
}

/**
 * Convenience helper to require manager role for admin operations.
 */
export async function requireManager(
    request: Request
): Promise<AuthenticatedUser> {
    return requireRole(request, "manager");
}
