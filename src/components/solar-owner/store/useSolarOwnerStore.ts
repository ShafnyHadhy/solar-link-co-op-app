import { create } from 'zustand';
import {
    BatteryState,
    CommunityEnergyRequest,
    EnergyEfficiencySuggestion,
    HardwareInfo,
    MonthlySavingsReport,
    SharingHistoryRecord,
    SolarAlertItem,
    SolarMetrics,
    WeatherForecastData,
} from '../types/solarOwner.types';

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

    // Sharing State
    communityRequests: CommunityEnergyRequest[];
    sharingHistory: SharingHistoryRecord[];
    autoShareEnabled: boolean;
    minBatteryReservePercent: number;
    toggleAutoShare: () => void;
    setMinBatteryReserve: (percent: number) => void;
    acceptRequest: (requestId: string) => void;
    rejectRequest: (requestId: string) => void;
    shareEnergyWithCommunity: (amountKWh: number, poolType?: string) => boolean;

    // Alerts State
    alerts: SolarAlertItem[];
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
    generationKW: 5.8,
    consumptionKW: 2.2,
    excessKW: 3.6,
    batteryPowerKW: 1.4, // charging
    gridExportKW: 2.2,

    dailyGenerationKWh: 28.4,
    dailyConsumptionKWh: 12.6,
    dailyExcessKWh: 15.8,
    dailySharedKWh: 8.5,
    dailyGridFeedKWh: 7.3,
    dailySelfSufficiencyPercent: 100,

    dailySavingsUSD: 14.20,
    monthlySavingsUSD: 248.50,
    lifetimeSavingsUSD: 3420.00,
    earningsFromSharingUSD: 53.50,
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

    acceptRequest: (requestId) => {
        const request = get().communityRequests.find((r) => r.id === requestId);
        if (!request) return;

        const currentMetrics = get().metrics;
        const newExcessKWh = Math.max(0, currentMetrics.dailyExcessKWh - request.amountKWh);
        const newSharedKWh = currentMetrics.dailySharedKWh + request.amountKWh;
        const earned = +(request.amountKWh * request.offeredRateUSDPerKWh).toFixed(2);

        const newTx: SharingHistoryRecord = {
            id: `tx-${Date.now().toString().slice(-4)}`,
            recipientName: `${request.requesterName} (${request.requesterType})`,
            amountKWh: request.amountKWh,
            creditsEarnedUSD: earned,
            co2SavedKg: +(request.amountKWh * 0.75).toFixed(1),
            date: 'Today',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: request.urgency === 'urgent' ? 'emergency_aid' : 'request_fulfillment',
            status: 'completed',
        };

        set({
            communityRequests: get().communityRequests.map((r) =>
                r.id === requestId ? { ...r, status: 'accepted' } : r
            ),
            sharingHistory: [newTx, ...get().sharingHistory],
            metrics: {
                ...currentMetrics,
                dailyExcessKWh: newExcessKWh,
                dailySharedKWh: newSharedKWh,
                earningsFromSharingUSD: +(currentMetrics.earningsFromSharingUSD + earned).toFixed(2),
            },
            alerts: get().alerts.map((a) =>
                a.relatedRequestId === requestId ? { ...a, isRead: true } : a
            ),
        });

        get().showToast(
            `Accepted! Transferred ${request.amountKWh} kWh to ${request.requesterName} (+$${earned.toFixed(2)})`,
            'success'
        );
    },

    rejectRequest: (requestId) => {
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

    shareEnergyWithCommunity: (amountKWh, poolType = 'Co-Op Community Pool') => {
        const currentMetrics = get().metrics;
        if (amountKWh <= 0 || amountKWh > currentMetrics.dailyExcessKWh) {
            get().showToast('Please enter an amount within your available excess energy', 'warning');
            return false;
        }

        const earned = +(amountKWh * 0.14).toFixed(2);
        const newTx: SharingHistoryRecord = {
            id: `tx-${Date.now().toString().slice(-4)}`,
            recipientName: poolType,
            amountKWh: amountKWh,
            creditsEarnedUSD: earned,
            co2SavedKg: +(amountKWh * 0.75).toFixed(1),
            date: 'Today',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'coop_pool_share',
            status: 'completed',
        };

        set({
            metrics: {
                ...currentMetrics,
                dailyExcessKWh: +(currentMetrics.dailyExcessKWh - amountKWh).toFixed(1),
                dailySharedKWh: +(currentMetrics.dailySharedKWh + amountKWh).toFixed(1),
                earningsFromSharingUSD: +(currentMetrics.earningsFromSharingUSD + earned).toFixed(2),
            },
            sharingHistory: [newTx, ...get().sharingHistory],
        });

        get().showToast(
            `Shared ${amountKWh} kWh with ${poolType}! (+$${earned.toFixed(2)})`,
            'success'
        );
        return true;
    },

    alerts: INITIAL_ALERTS,

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
