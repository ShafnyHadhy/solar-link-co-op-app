import type { UserRole } from "@/types/role";

let cachedUserRole: UserRole | null = null;

export function setCachedUserRole(role: UserRole | null) {
    cachedUserRole = role;
}

export function getCachedUserRole(): UserRole | null {
    return cachedUserRole;
}

export function getUserRole(
    metadataRole?: unknown,
    dbRole?: unknown
): UserRole | null {
    // PostgreSQL (dbRole / cachedUserRole) is the authoritative source of truth.
    // metadataRole from Clerk acts as initial fast fallback before sync completes.
    const candidate = dbRole || cachedUserRole || metadataRole;
    if (
        candidate === "manager" ||
        candidate === "solar_owner" ||
        candidate === "household" ||
        candidate === "technician"
    ) {
        return candidate;
    }

    return null;
}