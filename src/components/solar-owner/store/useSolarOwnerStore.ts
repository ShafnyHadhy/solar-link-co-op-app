import { create } from 'zustand';
import { getApiUrl } from '@/lib/api';
import { appStorage } from '@/lib/storage';
import { addServiceRequest } from '@/data/technicianData';
import {
    BatteryState,
    CommunityEnergyRequest,
    EnergyEfficiencySuggestion,
    HardwareInfo,
    MonthlySavingsReport,
    RequestStatus,
    SharingHistoryRecord,
    SolarAlertItem,
    SolarMetrics,
    WeatherForecastData,
} from '../types/solarOwner.types';

/** Shape of a solar asset returned by the API */
export interface SolarAssetData {
    id: string;
    ownerId: string;
    assetType: string;
    name: string;
    capacityKw: string | null;
    status: string;
    location: string | null;
    installedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

/** Shape of a solar offer returned by the API */
export interface SolarOfferData {
    id: string;
    ownerId: string;
    energyAmountKwh: string;
    minimumBatteryPercent: string | null;
    status: string;
    offeredAt: string;
    expiresAt: string | null;
    createdAt: string;
}

/** Shape of a maintenance service ticket */
export interface ServiceTicketData {
    id: string;
    reportedBy: string;
    assetId?: string;
    systemName?: string;
    title: string;
    description?: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    status: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
    location?: string;
    technicianName?: string;
    createdAt?: string;
}


export type SolarOwnerActiveView = 
    | 'dashboard'
    | 'energy'
    | 'sharing'
    | 'alerts'
    | 'prediction'
    | 'reports'
    | 'menu';

interface SolarOwnerState {
    activeView: SolarOwnerActiveView;
    setActiveView: (view: SolarOwnerActiveView) => void;

    // Toast Feedback
    toastMessage: string | null;
    toastType: 'success' | 'info' | 'warning' | null;
    showToast: (message: string, type?: 'success' | 'info' | 'warning') => void;
    hideToast: () => void;

    // Metrics
    metrics: SolarMetrics;
    battery: BatteryState;
    hardware: HardwareInfo;

    // ── API-Connected State ──
    solarAssets: SolarAssetData[];
    solarOffers: SolarOfferData[];
    isLoading: boolean;
    lastFetchedAt: number | null;

    // API Actions
    fetchSolarData: (ownerId: string) => Promise<void>;
    fetchSolarOffers: (ownerId: string) => Promise<void>;
    createSolarOffer: (ownerId: string, assetId: string, energyAmountKwh: number, minimumBatteryPercent?: number) => Promise<boolean>;
    cancelSolarOfferAction: (offerId: string, ownerId: string) => Promise<boolean>;
    createSolarAssetAction: (ownerId: string, asset: { name: string; assetType: string; capacityKw: number; location?: string }) => Promise<boolean>;
    updateSolarAssetAction: (assetId: string, ownerId: string, updates: { name?: string; assetType?: string; capacityKw?: number; status?: string; location?: string }) => Promise<boolean>;

    // ── Maintenance & Service Tickets ──
    serviceTickets: ServiceTicketData[];
    fetchServiceTickets: (ownerId: string) => Promise<void>;
    submitMaintenanceTicketAction: (ticket: {
        reportedBy: string;
        title: string;
        description: string;
        priority: 'critical' | 'high' | 'medium' | 'low';
        assetId?: string;
        systemName?: string;
        location?: string;
    }) => Promise<boolean>;


    // Sharing State
    communityRequests: CommunityEnergyRequest[];
    sharingHistory: SharingHistoryRecord[];
    autoShareEnabled: boolean;
    minBatteryReservePercent: number;
    toggleAutoShare: () => void;
    setMinBatteryReserve: (percent: number) => void;
    fetchCommunityRequests: () => Promise<void>;
    acceptRequest: (requestId: string, ownerId?: string) => Promise<void> | void;
    rejectRequest: (requestId: string) => void;
    shareEnergyWithCommunity: (amountKWh: number, poolType?: string, ownerId?: string) => Promise<boolean>;

    // Alerts State
    alerts: SolarAlertItem[];
    addAlert: (alert: Omit<SolarAlertItem, 'id'>) => void;
    markAlertAsRead: (alertId: string) => void;
    markAllAlertsAsRead: () => void;
    dismissAlert: (alertId: string) => void;

    // Weather & Prediction
    weather: WeatherForecastData;

    // Suggestions & Reports
    suggestions: EnergyEfficiencySuggestion[];
    monthlyReports: MonthlySavingsReport[];

    // Notification Toggles
    notificationsEnabled: {
        energyRequests: boolean;
        lowBattery: boolean;
        maintenanceReminders: boolean;
        weatherAlerts: boolean;
    };
    toggleNotificationSetting: (key: keyof SolarOwnerState['notificationsEnabled']) => void;
}

const INITIAL_METRICS: SolarMetrics = {
    generationKW: 12.5,
    consumptionKW: 3.2,
    excessKW: 9.3,
    batteryPowerKW: 2.4, // charging
    gridExportKW: 6.9,

    dailyGenerationKWh: 85050.0,
    dailyConsumptionKWh: 50.0,
    dailyExcessKWh: 85000.0,
    dailySharedKWh: 18.5,
    dailyGridFeedKWh: 12.3,
    dailySelfSufficiencyPercent: 100,

    dailySavingsUSD: 42.50,
    monthlySavingsUSD: 680.00,
    lifetimeSavingsUSD: 5420.00,
    earningsFromSharingUSD: 145.50,
};

const INITIAL_BATTERY: BatteryState = {
    percentage: 84,
    status: 'charging',
    capacityKWh: 10.0,
    currentStoredKWh: 8.4,
    healthPercent: 99,
    temperatureC: 26.8,
    backupTimeHours: 14.5,
    cycleCount: 142,
};

const INITIAL_HARDWARE: HardwareInfo = {
    panelModel: 'SunPower Maxeon 500W Monocrystalline',
    totalPanels: 12,
    peakCapacityKW: 6.0,
    inverterModel: 'SolarEdge Home Hybrid Inverter 6.0kW',
    inverterEfficiency: 98.4,
    inverterStatus: 'optimal',
    lastServiceDate: 'Jan 15, 2026',
    nextServiceDue: 'Jul 15, 2026',
    installationDate: 'Aug 10, 2024',
};

const INITIAL_SERVICE_TICKETS: ServiceTicketData[] = [
    {
        id: 'SR-004',
        reportedBy: 'user_3IIi0KG9N6hVutyWCIjaK2dNYey',
        systemName: 'Home Rooftop Solar Array',
        title: 'Quarterly Inverter Diagnostic Check',
        description: 'Routine inverter efficiency calibration and DC fuse inspection.',
        priority: 'low',
        status: 'resolved',
        location: 'Main Roof',
        technicianName: 'Azmil Ahamed',
        createdAt: '14 days ago',
    },
];


const INITIAL_REQUESTS: CommunityEnergyRequest[] = [
    {
        id: 'req-1',
        requesterName: 'Kamal Perera',
        requesterAddress: '15 Maple Lane (Neighbor • 150m)',
        requesterType: 'neighbor',
        amountKWh: 3.5,
        urgency: 'urgent',
        purpose: 'Home Medical Oxygen Concentrator power backup',
        offeredRateUSDPerKWh: 0.14,
        timestamp: '15 mins ago',
        status: 'pending',
        avatarBg: '#F59E0B',
    },
    {
        id: 'req-2',
        requesterName: 'Priya Fernando',
        requesterAddress: '42 Orchid Ave (280m)',
        requesterType: 'neighbor',
        amountKWh: 4.0,
        urgency: 'normal',
        purpose: 'EV Commute Charging for morning shift',
        offeredRateUSDPerKWh: 0.12,
        timestamp: '45 mins ago',
        status: 'pending',
        avatarBg: '#3B82F6',
    },
    {
        id: 'req-3',
        requesterName: 'St. Jude Community Clinic',
        requesterAddress: 'Main Street Co-Op Hub (500m)',
        requesterType: 'clinic',
        amountKWh: 6.0,
        urgency: 'urgent',
        purpose: 'Vaccine storage refrigeration reserve',
        offeredRateUSDPerKWh: 0.15,
        timestamp: '2 hours ago',
        status: 'pending',
        avatarBg: '#10B981',
    },
];

const INITIAL_SHARING_HISTORY: SharingHistoryRecord[] = [
    {
        id: 'tx-101',
        recipientName: 'Deshan Senanayake (Co-Op Microgrid Pool)',
        amountKWh: 5.0,
        creditsEarnedUSD: 0.70,
        co2SavedKg: 3.8,
        date: 'Today',
        time: '11:45 AM',
        type: 'coop_pool_share',
        status: 'completed',
    },
    {
        id: 'tx-102',
        recipientName: 'Sunil Wickrama (Neighbor)',
        amountKWh: 3.5,
        creditsEarnedUSD: 0.49,
        co2SavedKg: 2.6,
        date: 'Today',
        time: '09:15 AM',
        type: 'request_fulfillment',
        status: 'completed',
    },
    {
        id: 'tx-103',
        recipientName: 'Community Emergency Medical Reserve',
        amountKWh: 4.0,
        creditsEarnedUSD: 0.56,
        co2SavedKg: 3.1,
        date: 'Yesterday',
        time: '02:30 PM',
        type: 'emergency_aid',
        status: 'completed',
    },
    {
        id: 'tx-104',
        recipientName: 'Nimal Jayasuriya',
        amountKWh: 2.8,
        creditsEarnedUSD: 0.39,
        co2SavedKg: 2.1,
        date: 'Yesterday',
        time: '10:10 AM',
        type: 'request_fulfillment',
        status: 'completed',
    },
    {
        id: 'tx-105',
        recipientName: 'Co-Op Neighborhood Microgrid Pool',
        amountKWh: 8.2,
        creditsEarnedUSD: 1.15,
        co2SavedKg: 6.2,
        date: 'Aug 21, 2026',
        time: '01:00 PM',
        type: 'coop_pool_share',
        status: 'completed',
    },
];

const INITIAL_ALERTS: SolarAlertItem[] = [
    {
        id: 'alt-1',
        category: 'requests',
        severity: 'critical',
        title: 'Urgent Energy Request from Kamal',
        message: 'Medical oxygen device requires 3.5 kWh power backup. You have 15.8 kWh available excess.',
        timestamp: '15m ago',
        isRead: false,
        actionType: 'view_request',
        actionLabel: 'Respond to Request',
        relatedRequestId: 'req-1',
    },
    {
        id: 'alt-2',
        category: 'battery',
        severity: 'warning',
        title: 'Battery Reserve Target Met (84%)',
        message: 'Your home battery reached safe reserve. Excess power is now ready for auto-sharing.',
        timestamp: '1h ago',
        isRead: false,
        actionType: 'view_battery',
        actionLabel: 'View Battery',
    },
    {
        id: 'alt-3',
        category: 'maintenance',
        severity: 'info',
        title: 'Panel Dust Cleaning Reminder',
        message: 'Minor dust accumulation detected on East string. A quick water rinse can boost yield by 4.5%.',
        timestamp: '3h ago',
        isRead: false,
        actionType: 'check_inverter',
        actionLabel: 'View Maintenance',
    },
    {
        id: 'alt-4',
        category: 'system',
        severity: 'success',
        title: 'Grid Micro-Sync Optimal',
        message: 'Inverter operating at 98.4% efficiency. Zero voltage fluctuation detected today.',
        timestamp: '6h ago',
        isRead: true,
        actionType: 'dismiss',
        actionLabel: 'Dismiss',
    },
];

const INITIAL_WEATHER: WeatherForecastData = {
    condition: 'sunny',
    conditionText: 'Clear & High Irradiance',
    temperatureC: 30.5,
    uvIndex: 8.8,
    cloudCoverPercent: 8,
    peakSunHours: 6.2,
    humidityPercent: 54,
    expectedSolarLevel: 'High',
    aiSummary: 'Optimal solar generation conditions. High irradiance window between 10:30 AM and 3:30 PM with minimal cloud interference.',
    hourlyPredictions: [
        { hour: '06:00', predictedKW: 0.3, actualKW: 0.2, irradiance: 80, weather: 'sunny' },
        { hour: '08:00', predictedKW: 2.1, actualKW: 2.0, irradiance: 350, weather: 'sunny' },
        { hour: '10:00', predictedKW: 4.5, actualKW: 4.6, irradiance: 710, weather: 'sunny' },
        { hour: '12:00', predictedKW: 5.9, actualKW: 5.8, irradiance: 920, weather: 'sunny' },
        { hour: '14:00', predictedKW: 5.4, actualKW: undefined, irradiance: 840, weather: 'sunny' },
        { hour: '16:00', predictedKW: 3.2, actualKW: undefined, irradiance: 480, weather: 'partly_cloudy' },
        { hour: '18:00', predictedKW: 0.8, actualKW: undefined, irradiance: 120, weather: 'sunny' },
    ],
    dailyForecast: [
        { day: 'Today (Sun)', condition: 'sunny', tempMax: 32, tempMin: 24, estimatedKWh: 32.5, solarLevel: 'High' },
        { day: 'Mon', condition: 'sunny', tempMax: 31, tempMin: 23, estimatedKWh: 31.0, solarLevel: 'High' },
        { day: 'Tue', condition: 'partly_cloudy', tempMax: 29, tempMin: 22, estimatedKWh: 24.5, solarLevel: 'Moderate' },
        { day: 'Wed', condition: 'rainy', tempMax: 27, tempMin: 22, estimatedKWh: 14.0, solarLevel: 'Low' },
        { day: 'Thu', condition: 'partly_cloudy', tempMax: 29, tempMin: 23, estimatedKWh: 26.0, solarLevel: 'Moderate' },
        { day: 'Fri', condition: 'sunny', tempMax: 32, tempMin: 24, estimatedKWh: 33.2, solarLevel: 'High' },
        { day: 'Sat', condition: 'sunny', tempMax: 33, tempMin: 25, estimatedKWh: 34.0, solarLevel: 'High' },
    ],
};

const INITIAL_SUGGESTIONS: EnergyEfficiencySuggestion[] = [
    {
        id: 'sug-1',
        title: 'Run Heavy Appliances at Peak Solar',
        description: 'Schedule dishwasher and laundry between 11:30 AM and 2:30 PM to run on 100% free rooftop solar power.',
        potentialSavingsUSD: '$18.50 / month',
        category: 'timing',
        actionableTime: '11:30 AM - 2:30 PM',
        icon: 'clock',
    },
    {
        id: 'sug-2',
        title: 'Pre-Cool Home During Solar Peak',
        description: 'Lower AC thermostat by 2°C between 1:00 PM and 3:00 PM to store thermal energy without grid cost.',
        potentialSavingsUSD: '$12.00 / month',
        category: 'appliance',
        actionableTime: '1:00 PM - 3:00 PM',
        icon: 'thermometer',
    },
    {
        id: 'sug-3',
        title: 'Community Surplus Sharing',
        description: 'Auto-sharing excess energy above 80% battery capacity yields green credits and supports neighborhood resilience.',
        potentialSavingsUSD: '$24.00 / month',
        category: 'battery',
        icon: 'share-2',
    },
    {
        id: 'sug-4',
        title: 'Panel Surface Maintenance',
        description: 'Wiping morning pollen and dust once a month preserves ~5% solar generation efficiency.',
        potentialSavingsUSD: '$8.50 / month',
        category: 'maintenance',
        icon: 'sun',
    },
];

const INITIAL_MONTHLY_REPORTS: MonthlySavingsReport[] = [
    {
        month: 'August 2026',
        totalGeneratedKWh: 780,
        totalConsumedKWh: 340,
        totalSharedKWh: 260,
        gridDrawKWh: 15,
        directSolarSavingsUSD: 195.00,
        communitySharingRevenueUSD: 53.50,
        gridAvoidanceSavingsUSD: 18.00,
        totalSavingsUSD: 266.50,
        co2EmissionsAvoidedKg: 382,
        treesPlantedEquivalent: 19,
        homesPoweredEquivalent: 3,
    },
    {
        month: 'July 2026',
        totalGeneratedKWh: 820,
        totalConsumedKWh: 360,
        totalSharedKWh: 290,
        gridDrawKWh: 10,
        directSolarSavingsUSD: 205.00,
        communitySharingRevenueUSD: 60.20,
        gridAvoidanceSavingsUSD: 20.00,
        totalSavingsUSD: 285.20,
        co2EmissionsAvoidedKg: 405,
        treesPlantedEquivalent: 20,
        homesPoweredEquivalent: 4,
    },
    {
        month: 'June 2026',
        totalGeneratedKWh: 740,
        totalConsumedKWh: 320,
        totalSharedKWh: 230,
        gridDrawKWh: 20,
        directSolarSavingsUSD: 180.00,
        communitySharingRevenueUSD: 46.00,
        gridAvoidanceSavingsUSD: 16.00,
        totalSavingsUSD: 242.00,
        co2EmissionsAvoidedKg: 360,
        treesPlantedEquivalent: 18,
        homesPoweredEquivalent: 3,
    },
    {
        month: 'May 2026',
        totalGeneratedKWh: 790,
        totalConsumedKWh: 350,
        totalSharedKWh: 270,
        gridDrawKWh: 12,
        directSolarSavingsUSD: 198.00,
        communitySharingRevenueUSD: 55.40,
        gridAvoidanceSavingsUSD: 19.00,
        totalSavingsUSD: 272.40,
        co2EmissionsAvoidedKg: 390,
        treesPlantedEquivalent: 19,
        homesPoweredEquivalent: 3,
    },
];

export const useSolarOwnerStore = create<SolarOwnerState>((set, get) => ({
    activeView: 'dashboard',
    setActiveView: (view) => set({ activeView: view }),

    toastMessage: null,
    toastType: null,
    showToast: (message, type = 'success') => {
        set({ toastMessage: message, toastType: type });
        setTimeout(() => {
            if (get().toastMessage === message) {
                set({ toastMessage: null, toastType: null });
            }
        }, 3500);
    },
    hideToast: () => set({ toastMessage: null, toastType: null }),

    metrics: INITIAL_METRICS,
    battery: INITIAL_BATTERY,
    hardware: INITIAL_HARDWARE,

    // ── API-Connected State ──
    solarAssets: [],
    solarOffers: [],
    isLoading: false,
    lastFetchedAt: null,

    fetchSolarData: async (ownerId: string) => {
        if (get().isLoading) return;
        set({ isLoading: true });

        try {
            // 1. Fetch solar assets
            const assetsRes = await fetch(
                `${getApiUrl('/api/solar-assets')}?ownerId=${ownerId}`
            );
            const assetsData = await assetsRes.json();

            if (assetsData.success && assetsData.assets?.length > 0) {
                set({ solarAssets: assetsData.assets });

                // 2. Fetch energy surplus for the first asset
                const firstAssetId = assetsData.assets[0].id;
                const surplusRes = await fetch(
                    `${getApiUrl('/api/energy-surplus')}?assetId=${firstAssetId}`
                );
                const surplusData = await surplusRes.json();

                if (surplusData.success && surplusData.data?.surplus) {
                    const s = surplusData.data.surplus;
                    const currentMetrics = get().metrics;

                    // Update metrics with real data from API
                    set({
                        metrics: {
                            ...currentMetrics,
                            dailyGenerationKWh: s.generationKwh,
                            dailyConsumptionKWh: s.consumptionKwh,
                            dailyExcessKWh: s.surplusKwh,
                            // Keep computed values proportional
                            generationKW: +(s.generationKwh / 4.9).toFixed(1),
                            consumptionKW: +(s.consumptionKwh / 5.7).toFixed(1),
                            excessKW: +(s.surplusKwh / 4.4).toFixed(1),
                        },
                    });
                }
            }

            // 3. Fetch solar offers
            const offersRes = await fetch(
                `${getApiUrl('/api/solar-offers')}?ownerId=${ownerId}`
            );
            const offersData = await offersRes.json();

            if (offersData.success && offersData.data?.offers) {
                set({ solarOffers: offersData.data.offers });
            }

            // 4. Fetch service tickets
            await get().fetchServiceTickets(ownerId);

            set({ lastFetchedAt: Date.now() });

        } catch (error) {
            console.error('Failed to fetch solar data:', error);
            get().showToast('Could not load live data — showing cached values', 'warning');
        } finally {
            set({ isLoading: false });
        }
    },

    fetchSolarOffers: async (ownerId: string) => {
        try {
            const res = await fetch(
                `${getApiUrl('/api/solar-offers')}?ownerId=${ownerId}`
            );
            const data = await res.json();
            if (data.success && data.data?.offers) {
                const offers: SolarOfferData[] = data.data.offers;
                set({ solarOffers: offers });

                // Calculate committed surplus from all active offers in DB
                const committed = offers
                    .filter((o) => o.status === 'pending' || o.status === 'approved' || o.status === 'completed')
                    .reduce((sum, o) => sum + Number(o.energyAmountKwh || 0), 0);

                const currentMetrics = get().metrics;
                const newExcess = Math.max(0, +(85000.0 - committed).toFixed(1));
                set({
                    metrics: {
                        ...currentMetrics,
                        dailyGenerationKWh: 85050.0,
                        dailyConsumptionKWh: 50.0,
                        dailyExcessKWh: newExcess,
                        generationKW: 12.5,
                        consumptionKW: 3.2,
                        excessKW: +(newExcess / 32).toFixed(1) || 9.3,
                    },
                });
            }

            // Also fetch real sharing history & credits summary from DB dispatches
            try {
                const historyRes = await fetch(
                    `${getApiUrl('/api/solar-offers/history')}?ownerId=${ownerId}`
                );
                const historyData = await historyRes.json();
                if (historyData.success && historyData.data?.history) {
                    if (historyData.data.history.length > 0) {
                        set({ sharingHistory: historyData.data.history });
                    }
                }
            } catch (historyErr) {
                console.warn('Could not fetch sharing history:', historyErr);
            }
        } catch (error) {
            console.error('Failed to fetch offers:', error);
        }
    },

    createSolarOffer: async (ownerId, assetId, energyAmountKwh, minimumBatteryPercent) => {
        try {
            const offerId = `offer_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
            const res = await fetch(getApiUrl('/api/solar-offers'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: offerId,
                    ownerId,
                    assetId,
                    energyAmountKwh,
                    minimumBatteryPercent: minimumBatteryPercent ?? get().minBatteryReservePercent,
                }),
            });

            const data = await res.json();

            if (data.success !== false) {
                get().showToast(
                    `Offer submitted: ${energyAmountKwh} kWh → Pending manager approval`,
                    'success'
                );
                // Refresh offers list and surplus from DB
                await get().fetchSolarOffers(ownerId);
                get().addAlert({
                    category: 'system',
                    severity: 'success',
                    title: 'Solar Offer Submitted',
                    message: `Offered ${energyAmountKwh} kWh to Co-Op. Manager review pending.`,
                    timestamp: 'Just now',
                    isRead: false,
                    actionLabel: 'Viewed',
                });
                return true;
            } else {
                get().showToast(data.error || 'Failed to create offer', 'warning');
                return false;
            }
        } catch (error) {
            console.error('Failed to create offer:', error);
            get().showToast('Network error — could not submit offer', 'warning');
            return false;
        }
    },

    cancelSolarOfferAction: async (offerId: string, ownerId: string) => {
        try {
            const res = await fetch(getApiUrl(`/api/solar-offers/${offerId}/cancel`), {
                method: 'PATCH',
            });
            const data = await res.json();
            if (data.success !== false) {
                get().showToast('Offer cancelled successfully', 'info');
                // Refetch offers so cancelled energy is returned to available surplus!
                await get().fetchSolarOffers(ownerId);
                return true;
            } else {
                get().showToast(data.error || 'Failed to cancel offer', 'warning');
                return false;
            }
        } catch (error) {
            console.error('Failed to cancel offer:', error);
            get().showToast('Network error — could not cancel offer', 'warning');
            return false;
        }
    },

    createSolarAssetAction: async (ownerId: string, asset: { name: string; assetType: string; capacityKw: number; location?: string }) => {
        try {
            const assetId = `asset_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
            const res = await fetch(getApiUrl('/api/solar-assets'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: assetId,
                    ownerId,
                    name: asset.name,
                    assetType: asset.assetType,
                    capacityKw: asset.capacityKw.toString(),
                    location: asset.location || 'Main Roof',
                    status: 'active',
                }),
            });
            const data = await res.json();
            if (data.success) {
                get().showToast('Solar asset registered successfully!', 'success');
                await get().fetchSolarData(ownerId);
                return true;
            } else {
                get().showToast(data.error || 'Failed to register asset', 'warning');
                return false;
            }
        } catch (error) {
            console.error('Failed to create asset:', error);
            get().showToast('Network error — could not register asset', 'warning');
            return false;
        }
    },

    updateSolarAssetAction: async (assetId: string, ownerId: string, updates: { name?: string; assetType?: string; capacityKw?: number; status?: string; location?: string }) => {
        try {
            const res = await fetch(getApiUrl(`/api/solar-assets/${assetId}`), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...updates,
                    capacityKw: updates.capacityKw !== undefined ? updates.capacityKw.toString() : undefined,
                }),
            });
            const data = await res.json();
            if (data.success) {
                get().showToast('Solar asset updated successfully!', 'success');
                await get().fetchSolarData(ownerId);
                return true;
            } else {
                get().showToast(data.error || 'Failed to update asset', 'warning');
                return false;
            }
        } catch (error) {
            console.error('Failed to update asset:', error);
            get().showToast('Network error — could not update asset', 'warning');
            return false;
        }
    },

    // ── Maintenance Service Tickets ──
    serviceTickets: INITIAL_SERVICE_TICKETS,

    fetchServiceTickets: async (ownerId: string) => {
        try {
            const res = await fetch(`${getApiUrl('/api/service-tickets')}?reportedBy=${ownerId}`);
            const data = await res.json();
            if (data.success && data.data?.tickets?.length > 0) {
                set({ serviceTickets: data.data.tickets });
            }
        } catch (error) {
            console.error('Failed to fetch service tickets:', error);
        }
    },

    submitMaintenanceTicketAction: async (ticketInput) => {
        try {
            const ticketId = `SR-${Math.floor(100 + Math.random() * 900)}`;
            const newTicket: ServiceTicketData = {
                id: ticketId,
                reportedBy: ticketInput.reportedBy,
                assetId: ticketInput.assetId,
                systemName: ticketInput.systemName || 'Home Rooftop Solar Array',
                title: ticketInput.title,
                description: ticketInput.description,
                priority: ticketInput.priority,
                status: 'open',
                location: ticketInput.location || 'Main Roof',
                technicianName: 'Azmil Ahamed',
                createdAt: 'Just now',
            };

            const severityMap: Record<string, 'High' | 'Medium' | 'Low'> = {
                critical: 'High',
                high: 'High',
                medium: 'Medium',
                low: 'Low',
            };
            const statusMap: Record<string, 'Critical' | 'Warning' | 'Maintenance' | 'Normal'> = {
                critical: 'Critical',
                high: 'Warning',
                medium: 'Warning',
                low: 'Maintenance',
            };

            addServiceRequest({
                id: ticketId,
                systemName: ticketInput.systemName || 'Home Rooftop Solar Array',
                location: ticketInput.location || 'Main Roof',
                issue: ticketInput.title,
                severity: severityMap[ticketInput.priority] || 'Medium',
                status: statusMap[ticketInput.priority] || 'Maintenance',
                equipment: 'Solar Panel Array / Inverter',
            });

            set((state) => ({
                serviceTickets: [newTicket, ...state.serviceTickets],
            }));

            try {
                await fetch(getApiUrl('/api/service-tickets'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: ticketId,
                        reportedBy: ticketInput.reportedBy,
                        title: ticketInput.title,
                        description: ticketInput.description,
                        priority: ticketInput.priority,
                        assetId: ticketInput.assetId,
                        location: ticketInput.location,
                        assignedTechnicianId: 'user_3IHfICokymVrhEPN8Duj05YgYYO',
                    }),
                });
            } catch (apiErr) {
                console.warn('API sync warning for service ticket:', apiErr);
            }

            get().showToast(`Ticket ${ticketId} dispatched to Azmil Ahamed!`, 'success');
            return true;
        } catch (error) {
            console.error('Failed to submit maintenance ticket:', error);
            get().showToast('Could not submit ticket. Please try again.', 'warning');
            return false;
        }
    },


    communityRequests: INITIAL_REQUESTS,
    sharingHistory: INITIAL_SHARING_HISTORY,
    autoShareEnabled: true,
    minBatteryReservePercent: 75,

    toggleAutoShare: () => {
        const next = !get().autoShareEnabled;
        set({ autoShareEnabled: next });
        get().showToast(
            next ? 'Auto-Sharing Enabled (Threshold > 75%)' : 'Auto-Sharing Paused',
            next ? 'success' : 'info'
        );
    },

    setMinBatteryReserve: (percent) => set({ minBatteryReservePercent: percent }),

    fetchCommunityRequests: async () => {
        try {
            // 1. Restore persistent sharing history from storage if available
            const savedHistory = await appStorage.getItem('solar_sharing_history');
            if (savedHistory) {
                try {
                    const parsed = JSON.parse(savedHistory);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        set({ sharingHistory: parsed });
                    }
                } catch {
                    // Ignore parse errors
                }
            }

            // 2. Restore persistent accepted request IDs
            const savedAccepted = await appStorage.getItem('solar_accepted_requests');
            const acceptedIds: string[] = savedAccepted ? JSON.parse(savedAccepted) : [];

            // 3. Query real requests from backend database
            const res = await fetch(getApiUrl('/api/manager/energy-requests'));
            const data = await res.json();

            if (data.success && Array.isArray(data.requests) && data.requests.length > 0) {
                const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899'];
                const mapped: CommunityEnergyRequest[] = data.requests.map((r: any, idx: number) => {
                    const isUrgent =
                        r.reason?.toLowerCase().includes('medical') ||
                        r.reason?.toLowerCase().includes('emergency') ||
                        r.reason?.toLowerCase().includes('urgent');

                    const isLocallyAccepted = acceptedIds.includes(r.id);
                    const status: RequestStatus = isLocallyAccepted
                        ? 'accepted'
                        : r.status === 'approved'
                        ? 'accepted'
                        : r.status === 'rejected'
                        ? 'rejected'
                        : 'pending';

                    const dateStr = r.requestedAt
                        ? new Date(r.requestedAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                          })
                        : 'Today';

                    return {
                        id: r.id,
                        requesterName: r.householdName || 'Household Member',
                        requesterAddress: r.householdEmail || 'Neighborhood Microgrid',
                        requesterType: 'neighbor',
                        amountKWh: Number(r.requestedEnergyKwh) || 5.0,
                        urgency: isUrgent ? 'urgent' : 'normal',
                        purpose: r.reason || 'Household Energy Demand',
                        offeredRateUSDPerKWh: 0.16,
                        timestamp: dateStr,
                        status: status,
                        avatarBg: colors[idx % colors.length],
                    };
                });

                set({ communityRequests: mapped });
            }
        } catch (error) {
            console.error('Failed to fetch community requests:', error);
        }
    },

    acceptRequest: async (requestId: string, ownerId?: string) => {
        const request = get().communityRequests.find((r) => r.id === requestId);
        if (!request) return;

        const currentMetrics = get().metrics;
        const newExcessKWh = Math.max(0, +(currentMetrics.dailyExcessKWh - request.amountKWh).toFixed(1));
        const newSharedKWh = +(currentMetrics.dailySharedKWh + request.amountKWh).toFixed(1);
        const earned = +(request.amountKWh * (request.offeredRateUSDPerKWh || 0.16)).toFixed(2);

        const newTx: SharingHistoryRecord = {
            id: `tx-${Date.now().toString().slice(-4)}`,
            recipientName: `${request.requesterName} (Household)`,
            amountKWh: request.amountKWh,
            creditsEarnedUSD: earned,
            co2SavedKg: +(request.amountKWh * 0.75).toFixed(1),
            date: 'Today',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: request.urgency === 'urgent' ? 'emergency_aid' : 'request_fulfillment',
            status: 'completed',
        };

        const updatedHistory = [newTx, ...get().sharingHistory];
        const updatedRequests = get().communityRequests.map((r) =>
            r.id === requestId ? { ...r, status: 'accepted' as RequestStatus } : r
        );

        set({
            communityRequests: updatedRequests,
            sharingHistory: updatedHistory,
            metrics: {
                ...currentMetrics,
                dailyExcessKWh: newExcessKWh,
                dailySharedKWh: newSharedKWh,
                earningsFromSharingUSD: +(currentMetrics.earningsFromSharingUSD + earned).toFixed(2),
            },
        });

        // Persist accepted status and sharing history to storage
        try {
            const rawAccepted = await appStorage.getItem('solar_accepted_requests');
            const acceptedList: string[] = rawAccepted ? JSON.parse(rawAccepted) : [];
            if (!acceptedList.includes(requestId)) {
                acceptedList.push(requestId);
                await appStorage.setItem('solar_accepted_requests', JSON.stringify(acceptedList));
            }
            await appStorage.setItem('solar_sharing_history', JSON.stringify(updatedHistory));
        } catch (e) {
            console.error('Failed to persist accepted request:', e);
        }

        // Create an offer in backend to reflect the committed energy
        const targetOwnerId = ownerId || (get().solarAssets.length > 0 ? get().solarAssets[0].ownerId : undefined);
        if (targetOwnerId) {
            const offerId = `offer_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
            const assetId = get().solarAssets.length > 0 ? get().solarAssets[0].id : 'asset_agash_001';
            fetch(getApiUrl('/api/solar-offers'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: offerId,
                    ownerId: targetOwnerId,
                    assetId: assetId,
                    energyAmountKwh: request.amountKWh,
                    minimumBatteryPercent: get().minBatteryReservePercent,
                }),
            })
                .then(async () => {
                    await get().fetchSolarOffers(targetOwnerId);
                })
                .catch(() => {});
        }

        get().addAlert({
            category: 'requests',
            severity: 'success',
            title: 'Energy Request Fulfilled',
            message: `Transferred ${request.amountKWh} kWh to ${request.requesterName}. Earned +$${earned.toFixed(2)}.`,
            timestamp: 'Just now',
            isRead: false,
            actionLabel: 'Viewed',
        });

        get().showToast(
            `Accepted! Transferred ${request.amountKWh} kWh to ${request.requesterName} (+$${earned.toFixed(2)})`,
            'success'
        );
    },

    rejectRequest: (requestId: string) => {
        const request = get().communityRequests.find((r) => r.id === requestId);
        set({
            communityRequests: get().communityRequests.map((r) =>
                r.id === requestId ? { ...r, status: 'rejected' } : r
            ),
            alerts: get().alerts.map((a) =>
                a.relatedRequestId === requestId ? { ...a, isRead: true } : a
            ),
        });

        if (request) {
            get().showToast(`Declined request from ${request.requesterName}`, 'info');
        }
    },

    shareEnergyWithCommunity: async (amountKWh: number, poolType = 'Co-Op Community Pool', ownerId?: string) => {
        const currentMetrics = get().metrics;
        if (amountKWh <= 0 || amountKWh > currentMetrics.dailyExcessKWh) {
            get().showToast('Please enter an amount within your available excess energy', 'warning');
            return false;
        }

        const earned = +(amountKWh * 0.14).toFixed(2);
        const newTx: SharingHistoryRecord = {
            id: `tx-${Date.now().toString().slice(-4)}`,
            recipientName: `${poolType} (via Co-Op Manager)`,
            amountKWh: amountKWh,
            creditsEarnedUSD: earned,
            co2SavedKg: +(amountKWh * 0.75).toFixed(1),
            date: 'Today',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'coop_pool_share',
            status: 'completed',
        };

        const updatedHistory = [newTx, ...get().sharingHistory];
        set({
            sharingHistory: updatedHistory,
            metrics: {
                ...currentMetrics,
                dailyExcessKWh: +(currentMetrics.dailyExcessKWh - amountKWh).toFixed(1),
                dailySharedKWh: +(currentMetrics.dailySharedKWh + amountKWh).toFixed(1),
                earningsFromSharingUSD: +(currentMetrics.earningsFromSharingUSD + earned).toFixed(2),
            },
        });

        // Persist history
        await appStorage.setItem('solar_sharing_history', JSON.stringify(updatedHistory));

        // Create real offer in backend Neon DB
        const assets = get().solarAssets;
        const targetOwnerId = ownerId || (assets.length > 0 ? assets[0].ownerId : undefined);
        const assetId = assets.length > 0 ? assets[0].id : 'asset_agash_001';

        if (targetOwnerId) {
            const offerId = `offer_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
            try {
                const res = await fetch(getApiUrl('/api/solar-offers'), {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: offerId,
                        ownerId: targetOwnerId,
                        assetId: assetId,
                        energyAmountKwh: amountKWh,
                        minimumBatteryPercent: get().minBatteryReservePercent,
                    }),
                });
                const resData = await res.json();
                if (resData.success !== false) {
                    await get().fetchSolarOffers(targetOwnerId);
                    get().addAlert({
                        category: 'system',
                        severity: 'success',
                        title: 'Solar Offer Submitted',
                        message: `Successfully offered ${amountKWh} kWh to ${poolType}. Pending Manager review.`,
                        timestamp: 'Just now',
                        isRead: false,
                        actionLabel: 'Viewed',
                    });
                }
            } catch (err) {
                console.error('Failed to submit offer to API:', err);
            }
        }

        get().showToast(
            `Submitted ${amountKWh} kWh to Co-Op Manager for ${poolType} allocation! (+$${earned.toFixed(2)})`,
            'success'
        );
        return true;
    },

    alerts: INITIAL_ALERTS,

    addAlert: (alert: Omit<SolarAlertItem, 'id'>) => {
        const newAlert: SolarAlertItem = {
            id: `alt-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
            ...alert,
        };
        set({ alerts: [newAlert, ...get().alerts] });
    },

    markAlertAsRead: (alertId) => {
        set({
            alerts: get().alerts.map((a) => (a.id === alertId ? { ...a, isRead: true } : a)),
        });
    },

    markAllAlertsAsRead: () => {
        set({
            alerts: get().alerts.map((a) => ({ ...a, isRead: true })),
        });
        get().showToast('All alerts marked as read', 'info');
    },

    dismissAlert: (alertId) => {
        set({
            alerts: get().alerts.filter((a) => a.id !== alertId),
        });
        get().showToast('Alert dismissed', 'info');
    },

    weather: INITIAL_WEATHER,
    suggestions: INITIAL_SUGGESTIONS,
    monthlyReports: INITIAL_MONTHLY_REPORTS,

    notificationsEnabled: {
        energyRequests: true,
        lowBattery: true,
        maintenanceReminders: true,
        weatherAlerts: true,
    },

    toggleNotificationSetting: (key) => {
        const current = get().notificationsEnabled;
        const updated = { ...current, [key]: !current[key] };
        set({ notificationsEnabled: updated });
        get().showToast('Notification preferences updated', 'info');
    },
}));
