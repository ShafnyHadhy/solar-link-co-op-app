export type WeatherCondition = 'sunny' | 'partly_cloudy' | 'cloudy' | 'rainy';

export type AlertSeverity = 'critical' | 'warning' | 'info' | 'success';

export type AlertCategory = 'all' | 'requests' | 'battery' | 'maintenance' | 'system';

export type RequestStatus = 'pending' | 'accepted' | 'rejected' | 'completed';

export type TimeRange = 'day' | 'week' | 'month' | 'year';

export interface SolarMetrics {
    // Real-time instantaneous values in kW
    generationKW: number;
    consumptionKW: number;
    excessKW: number;
    batteryPowerKW: number; // positive = charging, negative = discharging
    gridExportKW: number;

    // Daily totals in kWh
    dailyGenerationKWh: number;
    dailyConsumptionKWh: number;
    dailyExcessKWh: number;
    dailySharedKWh: number;
    dailyGridFeedKWh: number;
    dailySelfSufficiencyPercent: number;

    // Financials
    dailySavingsUSD: number;
    monthlySavingsUSD: number;
    lifetimeSavingsUSD: number;
    earningsFromSharingUSD: number;
}

export interface BatteryState {
    percentage: number; // 0 - 100
    status: 'charging' | 'discharging' | 'full' | 'idle';
    capacityKWh: number; // e.g. 10.0 kWh
    currentStoredKWh: number; // e.g. 8.4 kWh
    healthPercent: number; // e.g. 99%
    temperatureC: number; // e.g. 26.5 °C
    backupTimeHours: number; // e.g. 14.5 hours remaining at current load
    cycleCount: number;
}

export interface CommunityEnergyRequest {
    id: string;
    requesterName: string;
    requesterAddress: string;
    requesterType: 'neighbor' | 'clinic' | 'small_business' | 'school';
    amountKWh: number;
    urgency: 'normal' | 'urgent';
    purpose: string;
    offeredRateUSDPerKWh: number;
    timestamp: string;
    status: RequestStatus;
    avatarBg: string;
}

export interface SharingHistoryRecord {
    id: string;
    recipientName: string;
    amountKWh: number;
    creditsEarnedUSD: number;
    co2SavedKg: number;
    date: string;
    time: string;
    type: 'request_fulfillment' | 'coop_pool_share' | 'emergency_aid';
    status: 'completed' | 'active';
}

export interface WeatherForecastData {
    condition: WeatherCondition;
    conditionText: string;
    temperatureC: number;
    uvIndex: number;
    cloudCoverPercent: number;
    peakSunHours: number;
    humidityPercent: number;
    expectedSolarLevel: 'High' | 'Moderate' | 'Low';
    aiSummary: string;
    hourlyPredictions: Array<{
        hour: string;
        predictedKW: number;
        actualKW?: number;
        irradiance: number; // W/m2
        weather: WeatherCondition;
    }>;
    dailyForecast: Array<{
        day: string;
        condition: WeatherCondition;
        tempMax: number;
        tempMin: number;
        estimatedKWh: number;
        solarLevel: 'High' | 'Moderate' | 'Low';
    }>;
}

export interface SolarAlertItem {
    id: string;
    category: 'requests' | 'battery' | 'maintenance' | 'system';
    severity: AlertSeverity;
    title: string;
    message: string;
    timestamp: string;
    isRead: boolean;
    actionType?: 'view_request' | 'view_battery' | 'check_inverter' | 'dismiss';
    actionLabel?: string;
    relatedRequestId?: string;
}

export interface EnergyEfficiencySuggestion {
    id: string;
    title: string;
    description: string;
    potentialSavingsUSD: string;
    category: 'timing' | 'appliance' | 'battery' | 'maintenance';
    actionableTime?: string;
    icon: string;
}

export interface HardwareInfo {
    panelModel: string;
    totalPanels: number;
    peakCapacityKW: number;
    inverterModel: string;
    inverterEfficiency: number;
    inverterStatus: 'optimal' | 'warning' | 'offline';
    lastServiceDate: string;
    nextServiceDue: string;
    installationDate: string;
}

export interface MonthlySavingsReport {
    month: string;
    totalGeneratedKWh: number;
    totalConsumedKWh: number;
    totalSharedKWh: number;
    gridDrawKWh: number;
    directSolarSavingsUSD: number;
    communitySharingRevenueUSD: number;
    gridAvoidanceSavingsUSD: number;
    totalSavingsUSD: number;
    co2EmissionsAvoidedKg: number;
    treesPlantedEquivalent: number;
    homesPoweredEquivalent: number;
}
