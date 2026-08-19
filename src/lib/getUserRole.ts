import type { UserRole } from "@/types/role";

export function getUserRole(
    metadataRole: unknown
): UserRole | null {
    if (
        metadataRole === "manager" ||
        metadataRole === "solar_owner" ||
        metadataRole === "household" ||
        metadataRole === "technician"
    ) {
        return metadataRole;
    }

    return null;
}