export type OfferStatus = 'pending_approval' | 'approved' | 'allocated' | 'rejected';
export type DemandStatus = 'pending' | 'approved' | 'dispatched' | 'rejected';
export type RequestUrgency = 'normal' | 'urgent' | 'critical';

export interface SolarShareOffer {
    id: string;
    solarOwnerName: string;
    solarOwnerAddress: string;
    amountKWh: number;
    offeredRateUSDPerKWh: number;
    destinationPool: string;
    batteryLevelPercent: number;
    timestamp: string;
    status: OfferStatus;
    notes?: string;
}

export interface HouseholdDemandRequest {
    id: string;
    requesterName: string;
    requesterAddress: string;
    requesterType: 'household' | 'clinic' | 'small_business' | 'school';
    amountKWh: number;
    urgency: RequestUrgency;
    purpose: string;
    offeredRateUSDPerKWh: number;
    timestamp: string;
    status: DemandStatus;
    allocatedOfferId?: string;
}

export interface ManagerDispatchedRecord {
    id: string;
    sourceName: string;
    recipientName: string;
    amountKWh: number;
    rateUSDPerKWh: number;
    totalAmountUSD: number;
    poolType: string;
    timestamp: string;
    date: string;
    status: 'dispatched' | 'settled';
}

export interface ManagerGridMetrics {
    totalSolarInflowKWh: number;
    totalAllocatedKWh: number;
    communityReserveKWh: number;
    activeOffersCount: number;
    pendingRequestsCount: number;
    gridStabilityScore: number;
    co2OffsetTodayKg: number;
}
