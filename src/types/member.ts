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

export interface MemberDetailedProfile extends CommunityMember {
    createdDate?: string;
    energyDetails?: {
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
        metrics?: {
            totalCapacityKw?: number;
            totalOfferedKwh?: number;
            activeOffersCount?: number;
            assetsCount?: number;
            monthlyAllocationKwh?: number;
            totalRequestedKwh?: number;
            totalDispatchedKwh?: number;
            requestsCount?: number;
            pendingRequestsCount?: number;
            approvedRequestsCount?: number;
            assignedGrid?: string;
            ticketsCount?: number;
            activeTicketsCount?: number;
            dispatchesManagedCount?: number;
            totalKwhDispatched?: number;
            [key: string]: any;
        };
    };
}

