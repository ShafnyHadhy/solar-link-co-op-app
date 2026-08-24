import { UserRole } from "./role";

export type MemberStatus = "active" | "pending" | "inactive";

export interface CommunityMember {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    status: MemberStatus;
    solarCapacityKw?: number;      // For solar owners
    monthlyAllocationKwh?: number;  // For households
    assignedGrid?: string;         // For technicians
    joinedAt: string;
    avatarUrl?: string;
    phone?: string;
}

export interface MemberAnalytics {
    totalMembers: number;
    activeMembers: number;
    pendingMembers: number;
    householdCount: number;
    solarOwnerCount: number;
    technicianCount: number;
    managerCount: number;
}
