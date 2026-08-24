import { create } from 'zustand';
import {
    HouseholdDemandRequest,
    ManagerDispatchedRecord,
    ManagerGridMetrics,
    SolarShareOffer,
} from '../types/manager.types';

interface ManagerStoreState {
    // Metrics
    metrics: ManagerGridMetrics;

    // Offers & Demands
    solarOffers: SolarShareOffer[];
    householdRequests: HouseholdDemandRequest[];
    dispatchHistory: ManagerDispatchedRecord[];

    // Toast Notification
    toastMessage: string | null;
    toastType: 'success' | 'info' | 'warning' | null;
    showToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
    hideToast: () => void;

    // Actions for Solar Offers
    approveOffer: (offerId: string) => void;
    rejectOffer: (offerId: string) => void;

    // Actions for Household Requests
    approveHouseholdRequest: (requestId: string) => void;
    dispatchSolarToRequest: (requestId: string, offerId?: string) => void;
    rejectHouseholdRequest: (requestId: string) => void;

    // Add new incoming offer from solar owner
    submitSolarOffer: (amountKWh: number, destinationPool: string, ownerName?: string) => void;
}

const INITIAL_METRICS: ManagerGridMetrics = {
    totalSolarInflowKWh: 48.5,
    totalAllocatedKWh: 32.0,
    communityReserveKWh: 16.5,
    activeOffersCount: 4,
    pendingRequestsCount: 3,
    gridStabilityScore: 98,
    co2OffsetTodayKg: 36.4,
};

const INITIAL_OFFERS: SolarShareOffer[] = [
    {
        id: 'off-101',
        solarOwnerName: 'Agash Jeeva (Solar Roof #12)',
        solarOwnerAddress: '08 Palm Grove (120m from Microgrid Substation)',
        amountKWh: 5.5,
        offeredRateUSDPerKWh: 0.14,
        destinationPool: 'Co-Op Community Pool',
        batteryLevelPercent: 84,
        timestamp: '10 mins ago',
        status: 'pending_approval',
        notes: 'Excess rooftop midday surge after 100% home consumption.',
    },
    {
        id: 'off-102',
        solarOwnerName: 'Dr. Ruwan Silva',
        solarOwnerAddress: '24 Green Valley',
        amountKWh: 4.0,
        offeredRateUSDPerKWh: 0.15,
        destinationPool: 'Emergency Medical Reserve',
        batteryLevelPercent: 92,
        timestamp: '25 mins ago',
        status: 'approved',
        notes: 'Dedicated clinic reserve allocation.',
    },
    {
        id: 'off-103',
        solarOwnerName: 'Kavindu Senaratne',
        solarOwnerAddress: '17 Lotus Lane',
        amountKWh: 6.2,
        offeredRateUSDPerKWh: 0.13,
        destinationPool: 'Green EV Hub Pool',
        batteryLevelPercent: 88,
        timestamp: '1 hour ago',
        status: 'allocated',
        notes: 'EV fast charger grid balancing.',
    },
    {
        id: 'off-104',
        solarOwnerName: 'Malini Perera',
        solarOwnerAddress: '03 Sunset Blvd',
        amountKWh: 3.8,
        offeredRateUSDPerKWh: 0.14,
        destinationPool: 'Co-Op Community Pool',
        batteryLevelPercent: 79,
        timestamp: '2 hours ago',
        status: 'pending_approval',
        notes: 'Available for mutual aid or neighboring households.',
    },
];

const INITIAL_REQUESTS: HouseholdDemandRequest[] = [
    {
        id: 'dem-201',
        requesterName: 'St. Jude Community Clinic',
        requesterAddress: 'Main Street Co-Op Hub',
        requesterType: 'clinic',
        amountKWh: 6.0,
        urgency: 'critical',
        purpose: 'Vaccine refrigeration & medical oxygen backup',
        offeredRateUSDPerKWh: 0.15,
        timestamp: '15 mins ago',
        status: 'pending',
    },
    {
        id: 'dem-202',
        requesterName: 'Kamal Perera',
        requesterAddress: '15 Maple Lane (Neighbor • 150m)',
        requesterType: 'household',
        amountKWh: 3.5,
        urgency: 'urgent',
        purpose: 'Home Medical Oxygen Concentrator power backup',
        offeredRateUSDPerKWh: 0.14,
        timestamp: '35 mins ago',
        status: 'pending',
    },
    {
        id: 'dem-203',
        requesterName: 'Priya Fernando',
        requesterAddress: '42 Orchid Ave',
        requesterType: 'household',
        amountKWh: 4.0,
        urgency: 'normal',
        purpose: 'EV commuter overnight charging boost',
        offeredRateUSDPerKWh: 0.12,
        timestamp: '1 hour ago',
        status: 'pending',
    },
    {
        id: 'dem-204',
        requesterName: 'Horizon Primary School',
        requesterAddress: '09 Education Way',
        requesterType: 'school',
        amountKWh: 8.0,
        urgency: 'normal',
        purpose: 'Computer lab and ventilation fans during school hours',
        offeredRateUSDPerKWh: 0.13,
        timestamp: '3 hours ago',
        status: 'dispatched',
    },
];

const INITIAL_DISPATCH: ManagerDispatchedRecord[] = [
    {
        id: 'dsp-501',
        sourceName: 'Agash Jeeva (Solar Roof #12)',
        recipientName: 'Horizon Primary School',
        amountKWh: 5.0,
        rateUSDPerKWh: 0.14,
        totalAmountUSD: 0.70,
        poolType: 'Co-Op Community Pool',
        timestamp: '10:30 AM',
        date: 'Today',
        status: 'dispatched',
    },
    {
        id: 'dsp-502',
        sourceName: 'Dr. Ruwan Silva',
        recipientName: 'St. Jude Community Clinic',
        amountKWh: 4.0,
        rateUSDPerKWh: 0.15,
        totalAmountUSD: 0.60,
        poolType: 'Emergency Medical Reserve',
        timestamp: '09:15 AM',
        date: 'Today',
        status: 'dispatched',
    },
    {
        id: 'dsp-503',
        sourceName: 'Kavindu Senaratne',
        recipientName: 'Community EV Station #4',
        amountKWh: 6.2,
        rateUSDPerKWh: 0.13,
        totalAmountUSD: 0.81,
        poolType: 'Green EV Hub Pool',
        timestamp: '08:00 AM',
        date: 'Today',
        status: 'settled',
    },
];

let toastTimeout: any = null;

export const useManagerStore = create<ManagerStoreState>((set, get) => ({
    metrics: INITIAL_METRICS,
    solarOffers: INITIAL_OFFERS,
    householdRequests: INITIAL_REQUESTS,
    dispatchHistory: INITIAL_DISPATCH,

    toastMessage: null,
    toastType: null,

    showToast: (message, type = 'success') => {
        if (toastTimeout) clearTimeout(toastTimeout);
        set({ toastMessage: message, toastType: type });
        toastTimeout = setTimeout(() => {
            if (get().toastMessage === message) {
                set({ toastMessage: null, toastType: null });
            }
        }, 3500);
    },

    hideToast: () => set({ toastMessage: null, toastType: null }),

    approveOffer: (offerId) => {
        const offer = get().solarOffers.find((o) => o.id === offerId);
        if (!offer) return;

        set({
            solarOffers: get().solarOffers.map((o) =>
                o.id === offerId ? { ...o, status: 'approved' } : o
            ),
            metrics: {
                ...get().metrics,
                communityReserveKWh: +(get().metrics.communityReserveKWh + offer.amountKWh).toFixed(1),
            },
        });

        get().showToast(
            `Approved ${offer.amountKWh} kWh from ${offer.solarOwnerName} → Added to ${offer.destinationPool}`,
            'success'
        );
    },

    rejectOffer: (offerId) => {
        const offer = get().solarOffers.find((o) => o.id === offerId);
        set({
            solarOffers: get().solarOffers.map((o) =>
                o.id === offerId ? { ...o, status: 'rejected' } : o
            ),
        });

        if (offer) {
            get().showToast(`Declined solar offer from ${offer.solarOwnerName}`, 'info');
        }
    },

    approveHouseholdRequest: (requestId) => {
        const req = get().householdRequests.find((r) => r.id === requestId);
        if (!req) return;

        set({
            householdRequests: get().householdRequests.map((r) =>
                r.id === requestId ? { ...r, status: 'approved' } : r
            ),
        });

        get().showToast(`Approved request from ${req.requesterName}. Ready for solar dispatch.`, 'info');
    },

    dispatchSolarToRequest: (requestId, offerId) => {
        const req = get().householdRequests.find((r) => r.id === requestId);
        if (!req) return;

        const availableOffer = offerId
            ? get().solarOffers.find((o) => o.id === offerId)
            : get().solarOffers.find((o) => o.status === 'approved' || o.status === 'pending_approval');

        const sourceName = availableOffer ? availableOffer.solarOwnerName : 'Co-Op Community Reserve Pool';
        const rate = availableOffer ? availableOffer.offeredRateUSDPerKWh : req.offeredRateUSDPerKWh;
        const total = +(req.amountKWh * rate).toFixed(2);

        const newDispatch: ManagerDispatchedRecord = {
            id: `dsp-${Date.now().toString().slice(-4)}`,
            sourceName,
            recipientName: req.requesterName,
            amountKWh: req.amountKWh,
            rateUSDPerKWh: rate,
            totalAmountUSD: total,
            poolType: availableOffer?.destinationPool || 'Co-Op Microgrid Allocation',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: 'Today',
            status: 'dispatched',
        };

        set({
            householdRequests: get().householdRequests.map((r) =>
                r.id === requestId ? { ...r, status: 'dispatched' } : r
            ),
            solarOffers: availableOffer
                ? get().solarOffers.map((o) => (o.id === availableOffer.id ? { ...o, status: 'allocated' } : o))
                : get().solarOffers,
            dispatchHistory: [newDispatch, ...get().dispatchHistory],
            metrics: {
                ...get().metrics,
                totalAllocatedKWh: +(get().metrics.totalAllocatedKWh + req.amountKWh).toFixed(1),
                communityReserveKWh: Math.max(0, +(get().metrics.communityReserveKWh - req.amountKWh).toFixed(1)),
                pendingRequestsCount: Math.max(0, get().metrics.pendingRequestsCount - 1),
            },
        });

        get().showToast(
            `Dispatched ${req.amountKWh} kWh from [${sourceName}] to [${req.requesterName}]!`,
            'success'
        );
    },

    rejectHouseholdRequest: (requestId) => {
        const req = get().householdRequests.find((r) => r.id === requestId);
        set({
            householdRequests: get().householdRequests.map((r) =>
                r.id === requestId ? { ...r, status: 'rejected' } : r
            ),
        });

        if (req) {
            get().showToast(`Declined request from ${req.requesterName}`, 'info');
        }
    },

    submitSolarOffer: (amountKWh, destinationPool, ownerName = 'Agash Jeeva (Solar Roof #12)') => {
        const newOffer: SolarShareOffer = {
            id: `off-${Date.now().toString().slice(-4)}`,
            solarOwnerName: ownerName,
            solarOwnerAddress: '08 Palm Grove (Connected to Microgrid)',
            amountKWh,
            offeredRateUSDPerKWh: 0.14,
            destinationPool,
            batteryLevelPercent: 84,
            timestamp: 'Just now',
            status: 'pending_approval',
            notes: 'Submitted via Solar Owner app for Manager verification & pool allocation.',
        };

        set({
            solarOffers: [newOffer, ...get().solarOffers],
            metrics: {
                ...get().metrics,
                totalSolarInflowKWh: +(get().metrics.totalSolarInflowKWh + amountKWh).toFixed(1),
                activeOffersCount: get().metrics.activeOffersCount + 1,
            },
        });

        get().showToast(`Received ${amountKWh} kWh offer from ${ownerName} for Manager approval!`, 'info');
    },
}));
