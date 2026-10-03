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
    fallbackRole?: unknown
): UserRole | null {
    const candidate = metadataRole || fallbackRole || cachedUserRole;
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