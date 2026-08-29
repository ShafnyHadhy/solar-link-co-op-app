import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSolarOwnerStore } from '../store/useSolarOwnerStore';

export type SolarMetricDetailType = 'generation' | 'consumption' | 'battery' | 'savings';

interface SolarMetricDetailModalProps {
    visible: boolean;
    initialTab?: SolarMetricDetailType;
    onClose: () => void;
}

export const SolarMetricDetailModal: React.FC<SolarMetricDetailModalProps> = ({
    visible,
    initialTab = 'battery',
    onClose,
}) => {
    const router = useRouter();
    const { metrics, battery, hardware, monthlyReports, showToast } = useSolarOwnerStore();
    const [activeTab, setActiveTab] = useState<SolarMetricDetailType>(initialTab);

    useEffect(() => {
        if (visible && initialTab) {
            setActiveTab(initialTab);
        }
    }, [visible, initialTab]);

    const currentReport = monthlyReports[0] || {
        month: 'August 2026',
        totalGeneratedKWh: 780,
        totalConsumedKWh: 340,
        totalSharedKWh: 260,
        gridDrawKWh: 15,
        directSolarSavingsUSD: 195.0,
        communitySharingRevenueUSD: 53.5,
        gridAvoidanceSavingsUSD: 18.0,
        totalSavingsUSD: 266.5,
        co2EmissionsAvoidedKg: 382,
        treesPlantedEquivalent: 19,
        homesPoweredEquivalent: 3,
    };

    const tabs: { id: SolarMetricDetailType; label: string; icon: string; iconLib: 'feather' | 'mci'; color: string }[] = [
        { id: 'generation', label: 'Generation', icon: 'sun', iconLib: 'feather', color: '#F59E0B' },
        { id: 'consumption', label: 'Consumption', icon: 'home', iconLib: 'feather', color: '#0EA5E9' },
        { id: 'battery', label: 'Battery', icon: 'battery-charging', iconLib: 'feather', color: '#10B981' },
        { id: 'savings', label: 'Savings', icon: 'dollar-sign', iconLib: 'feather', color: '#10B981' },
    ];

    const handleNavigateToEnergyTab = () => {
        onClose();
        router.push('/(tabs)/energy');
    };

    const handleDownloadReport = () => {
        showToast('Monthly Energy Statement downloaded (PDF/CSV ready in files)', 'success');
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View className="flex-1 bg-black/60 justify-end">
                <View className="rounded-t-[36px] bg-card border-t border-border p-6 max-h-[90%] flex-col">
                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center">
                            <View
                                className="h-10 w-10 rounded-2xl items-center justify-center mr-3 border"
                                style={{
                                    backgroundColor:
                                        activeTab === 'generation'
                                            ? 'rgba(245, 158, 11, 0.15)'
                                            : activeTab === 'consumption'
                                            ? 'rgba(14, 165, 233, 0.15)'
                                            : activeTab === 'battery'
                                            ? 'rgba(16, 185, 129, 0.15)'
                                            : 'rgba(16, 185, 129, 0.15)',
                                    borderColor:
                                        activeTab === 'generation'
                                            ? 'rgba(245, 158, 11, 0.3)'
                                            : activeTab === 'consumption'
                                            ? 'rgba(14, 165, 233, 0.3)'
                                            : activeTab === 'battery'
                                            ? 'rgba(16, 185, 129, 0.3)'
                                            : 'rgba(16, 185, 129, 0.3)',
                                }}
                            >
                                {activeTab === 'generation' && <Feather name="sun" size={20} color="#F59E0B" />}
                                {activeTab === 'consumption' && <Feather name="home" size={20} color="#0EA5E9" />}
                                {activeTab === 'battery' && <Feather name="battery-charging" size={20} color="#10B981" />}
                                {activeTab === 'savings' && <Feather name="dollar-sign" size={20} color="#10B981" />}
                            </View>
                            <View>
                                <Text className="text-xl font-black text-foreground">
                                    {activeTab === 'generation' && 'Solar Generation'}
                                    {activeTab === 'consumption' && 'Household Usage'}
                                    {activeTab === 'battery' && 'Home Battery'}
                                    {activeTab === 'savings' && 'Savings & Impact'}
                                </Text>
                                <Text className="text-xs text-muted-foreground font-medium">
                                    Detailed telemetry & performance analytics
                                </Text>
                            </View>
                        </View>

                        <Pressable
                            onPress={onClose}
                            className="h-9 w-9 rounded-full bg-secondary items-center justify-center active:opacity-70"
                        >
                            <Feather name="x" size={18} color="#9CA3AF" />
                        </Pressable>
                    </View>

                    {/* Tab Selector Pills */}
                    <View className="flex-row bg-secondary/80 rounded-2xl p-1 mb-4 border border-border/60">
                        {tabs.map((tab) => {
                            const isActive = activeTab === tab.id;
                            return (
                                <Pressable
                                    key={tab.id}
                                    onPress={() => setActiveTab(tab.id)}
                                    className={`flex-1 py-2 items-center justify-center rounded-xl flex-row ${
                                        isActive ? 'bg-card shadow-sm border border-border/70' : ''
                                    }`}
                                >
                                    <Text
                                        className={`text-xs font-bold ${
                                            isActive ? 'text-foreground font-black' : 'text-muted-foreground'
                                        }`}
                                    >
                                        {tab.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>

                    {/* Scrollable Tab Content */}
                    <ScrollView showsVerticalScrollIndicator={false} className="flex-1" contentContainerStyle={{ paddingBottom: 20 }}>
                        {/* ======================= TAB: BATTERY ======================= */}
                        {activeTab === 'battery' && (
                            <View className="gap-4">
                                {/* Hero Card */}
                                <View className="rounded-[28px] border border-emerald-500/40 bg-emerald-500/10 p-5">
                                    <View className="flex-row items-center justify-between mb-2">
                                        <Text className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                                            Storage Status
                                        </Text>
                                        <View className="bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                                            <Text className="text-xs font-black text-emerald-500">
                                                {battery.percentage}% Charged
                                            </Text>
                                        </View>
                                    </View>

                                    <View className="flex-row items-baseline my-2">
                                        <Text className="text-4xl font-black text-foreground">
                                            {battery.percentage}%
                                        </Text>
                                        <Text className="text-sm font-bold text-emerald-500 ml-2">
                                            +{metrics.batteryPowerKW.toFixed(1)} kW Charging
                                        </Text>
                                    </View>

                                    {/* Visual Bar */}
                                    <View className="h-4 w-full rounded-full bg-secondary overflow-hidden my-2 border border-border/60">
                                        <View
                                            className="h-full rounded-full bg-emerald-500"
                                            style={{ width: `${battery.percentage}%` }}
                                        />
                                    </View>

                                    <View className="flex-row justify-between pt-2 border-t border-emerald-500/20 mt-1">
                                        <View>
                                            <Text className="text-[10px] uppercase font-bold text-muted-foreground">Stored Energy</Text>
                                            <Text className="text-sm font-black text-foreground">{battery.currentStoredKWh.toFixed(1)} / {battery.capacityKWh} kWh</Text>
                                        </View>
                                        <View className="items-end">
                                            <Text className="text-[10px] uppercase font-bold text-muted-foreground">Estimated Backup</Text>
                                            <Text className="text-sm font-black text-foreground">~{battery.backupTimeHours} Hours</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Technical Telemetry Grid */}
                                <View className="rounded-2xl border border-border/70 bg-card p-4">
                                    <Text className="text-xs font-bold text-foreground mb-3 uppercase tracking-wider">
                                        Battery Health & Hardware Specs
                                    </Text>
                                    <View className="divide-y divide-border/30">
                                        <View className="flex-row justify-between py-2">
                                            <Text className="text-xs text-muted-foreground">State of Health (SOH)</Text>
                                            <Text className="text-xs font-bold text-emerald-500">{battery.healthPercent}% (Optimal)</Text>
                                        </View>
                                        <View className="flex-row justify-between py-2">
                                            <Text className="text-xs text-muted-foreground">Battery Temperature</Text>
                                            <Text className="text-xs font-bold text-foreground">{battery.temperatureC}°C (Safe Range)</Text>
                                        </View>
                                        <View className="flex-row justify-between py-2">
                                            <Text className="text-xs text-muted-foreground">Cycle Count</Text>
                                            <Text className="text-xs font-bold text-foreground">{battery.cycleCount} Cycles</Text>
                                        </View>
                                        <View className="flex-row justify-between py-2">
                                            <Text className="text-xs text-muted-foreground">Battery Chemistry</Text>
                                            <Text className="text-xs font-bold text-foreground">Lithium Iron Phosphate (LiFePO4)</Text>
                                        </View>
                                        <View className="flex-row justify-between py-2">
                                            <Text className="text-xs text-muted-foreground">Minimum Home Reserve Threshold</Text>
                                            <Text className="text-xs font-bold text-amber-500">75% (Excess shared above this)</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* ======================= TAB: GENERATION ======================= */}
                        {activeTab === 'generation' && (
                            <View className="gap-4">
                                {/* Hero Card */}
                                <View className="rounded-[28px] border border-amber-500/40 bg-amber-500/10 p-5">
                                    <View className="flex-row items-center justify-between mb-2">
                                        <Text className="text-xs font-bold uppercase tracking-wider text-amber-500">
                                            Solar Production
                                        </Text>
                                        <View className="bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                                            <Text className="text-xs font-black text-amber-500">
                                                Active Generation
                                            </Text>
                                        </View>
                                    </View>

                                    <View className="flex-row items-baseline my-2">
                                        <Text className="text-4xl font-black text-foreground">
                                            {metrics.generationKW.toFixed(1)}
                                        </Text>
                                        <Text className="text-base font-bold text-amber-500 ml-1.5">
                                            kW
                                        </Text>
                                        <Text className="text-xs font-bold text-muted-foreground ml-3">
                                            (Peak capacity 6.0 kW)
                                        </Text>
                                    </View>

                                    <View className="flex-row justify-between pt-3 border-t border-amber-500/20 mt-1">
                                        <View>
                                            <Text className="text-[10px] uppercase font-bold text-muted-foreground">Today's Generation</Text>
                                            <Text className="text-sm font-black text-foreground">{metrics.dailyGenerationKWh.toFixed(1)} kWh</Text>
                                        </View>
                                        <View className="items-end">
                                            <Text className="text-[10px] uppercase font-bold text-muted-foreground">Peak Output Today</Text>
                                            <Text className="text-sm font-black text-amber-500">5.9 kW @ 12:30 PM</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Live Flow Breakdown */}
                                <View className="rounded-2xl border border-border/70 bg-card p-4">
                                    <Text className="text-xs font-bold text-foreground mb-3 uppercase tracking-wider">
                                        Solar Power Routing
                                    </Text>
                                    <View className="divide-y divide-border/30">
                                        <View className="flex-row justify-between py-2">
                                            <Text className="text-xs text-muted-foreground">Direct Household Usage</Text>
                                            <Text className="text-xs font-bold text-sky-500">{metrics.consumptionKW.toFixed(1)} kW</Text>
                                        </View>
                                        <View className="flex-row justify-between py-2">
                                            <Text className="text-xs text-muted-foreground">Battery Charging Storage</Text>
                                            <Text className="text-xs font-bold text-emerald-500">+{metrics.batteryPowerKW.toFixed(1)} kW</Text>
                                        </View>
                                        <View className="flex-row justify-between py-2">
                                            <Text className="text-xs text-muted-foreground">Available Excess for Sharing</Text>
                                            <Text className="text-xs font-bold text-purple-500">{metrics.excessKW.toFixed(1)} kW</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Hardware Details */}
                                <View className="rounded-2xl border border-border/70 bg-card p-4">
                                    <Text className="text-xs font-bold text-foreground mb-3 uppercase tracking-wider">
                                        Hardware & Array Details
                                    </Text>
                                    <View className="divide-y divide-border/30">
                                        <View className="flex-row justify-between py-2">
                                            <Text className="text-xs text-muted-foreground">Rooftop Panels</Text>
                                            <Text className="text-xs font-bold text-foreground">{hardware.totalPanels}x 500W Panels</Text>
                                        </View>
                                        <View className="flex-row justify-between py-2">
                                            <Text className="text-xs text-muted-foreground">Inverter Model</Text>
                                            <Text className="text-xs font-bold text-foreground">{hardware.inverterModel}</Text>
                                        </View>
                                        <View className="flex-row justify-between py-2">
                                            <Text className="text-xs text-muted-foreground">Inverter Efficiency</Text>
                                            <Text className="text-xs font-bold text-emerald-500">{hardware.inverterEfficiency}% (Optimal)</Text>
                                        </View>
                                        <View className="flex-row justify-between py-2">
                                            <Text className="text-xs text-muted-foreground">Next Service Due</Text>
                                            <Text className="text-xs font-bold text-foreground">{hardware.nextServiceDue}</Text>
                                        </View>
                                    </View>
                                </View>

                                <Pressable
                                    onPress={handleNavigateToEnergyTab}
                                    className="w-full rounded-2xl bg-secondary border border-border/70 py-3 items-center justify-center active:opacity-80"
                                >
                                    <Text className="text-xs font-bold text-foreground">
                                        Open Full Energy Analytics Tab →
                                    </Text>
                                </Pressable>
                            </View>
                        )}

                        {/* ======================= TAB: CONSUMPTION ======================= */}
                        {activeTab === 'consumption' && (
                            <View className="gap-4">
                                {/* Hero Card */}
                                <View className="rounded-[28px] border border-sky-500/40 bg-sky-500/10 p-5">
                                    <View className="flex-row items-center justify-between mb-2">
                                        <Text className="text-xs font-bold uppercase tracking-wider text-sky-500">
                                            Household Demand
                                        </Text>
                                        <View className="bg-sky-500/20 px-2.5 py-0.5 rounded-full border border-sky-500/40">
                                            <Text className="text-xs font-black text-sky-500">
                                                100% Solar Powered
                                            </Text>
                                        </View>
                                    </View>

                                    <View className="flex-row items-baseline my-2">
                                        <Text className="text-4xl font-black text-foreground">
                                            {metrics.consumptionKW.toFixed(1)}
                                        </Text>
                                        <Text className="text-base font-bold text-sky-500 ml-1.5">
                                            kW
                                        </Text>
                                        <Text className="text-xs font-bold text-muted-foreground ml-3">
                                            (Current load)
                                        </Text>
                                    </View>

                                    <View className="flex-row justify-between pt-3 border-t border-sky-500/20 mt-1">
                                        <View>
                                            <Text className="text-[10px] uppercase font-bold text-muted-foreground">Today's Consumption</Text>
                                            <Text className="text-sm font-black text-foreground">{metrics.dailyConsumptionKWh.toFixed(1)} kWh</Text>
                                        </View>
                                        <View className="items-end">
                                            <Text className="text-[10px] uppercase font-bold text-muted-foreground">Grid Draw</Text>
                                            <Text className="text-sm font-black text-emerald-500">0.0 kW (Zero grid cost)</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Appliance Distribution */}
                                <View className="rounded-2xl border border-border/70 bg-card p-4">
                                    <Text className="text-xs font-bold text-foreground mb-3 uppercase tracking-wider">
                                        Estimated Load Breakdown
                                    </Text>
                                    <View className="divide-y divide-border/30">
                                        <View className="flex-row justify-between py-2">
                                            <Text className="text-xs text-muted-foreground">❄️ Air Conditioning & Cooling</Text>
                                            <Text className="text-xs font-bold text-foreground">1.1 kW (50%)</Text>
                                        </View>
                                        <View className="flex-row justify-between py-2">
                                            <Text className="text-xs text-muted-foreground">🍳 Kitchen & Refrigeration</Text>
                                            <Text className="text-xs font-bold text-foreground">0.5 kW (23%)</Text>
                                        </View>
                                        <View className="flex-row justify-between py-2">
                                            <Text className="text-xs text-muted-foreground">💡 Lighting & Electronics</Text>
                                            <Text className="text-xs font-bold text-foreground">0.4 kW (18%)</Text>
                                        </View>
                                        <View className="flex-row justify-between py-2">
                                            <Text className="text-xs text-muted-foreground">🔌 Standby & Smart Devices</Text>
                                            <Text className="text-xs font-bold text-foreground">0.2 kW (9%)</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Efficiency Tip */}
                                <View className="rounded-2xl bg-amber-500/15 border border-amber-500/30 p-3.5">
                                    <View className="flex-row items-center mb-1">
                                        <Feather name="zap" size={14} color="#F59E0B" style={{ marginRight: 6 }} />
                                        <Text className="text-xs font-bold text-foreground">
                                            Smart Usage Tip
                                        </Text>
                                    </View>
                                    <Text className="text-[11px] text-muted-foreground leading-relaxed">
                                        Schedule heavy appliances like washing machines between 11:30 AM and 2:30 PM to run entirely on free solar surplus.
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* ======================= TAB: SAVINGS ======================= */}
                        {activeTab === 'savings' && (
                            <View className="gap-4">
                                {/* Hero Card */}
                                <View className="rounded-[28px] border border-emerald-500/40 bg-emerald-500/10 p-5">
                                    <View className="flex-row items-center justify-between mb-2">
                                        <Text className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                                            Financial Savings (August 2026)
                                        </Text>
                                        <View className="bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                                            <Text className="text-xs font-black text-emerald-500">
                                                Net Benefit
                                            </Text>
                                        </View>
                                    </View>

                                    <View className="flex-row items-baseline my-2">
                                        <Text className="text-4xl font-black text-foreground">
                                            ${currentReport.totalSavingsUSD.toFixed(2)}
                                        </Text>
                                        <Text className="text-sm font-bold text-emerald-500 ml-2">
                                            +${metrics.dailySavingsUSD.toFixed(2)} today
                                        </Text>
                                    </View>

                                    <View className="flex-row justify-between pt-3 border-t border-emerald-500/20 mt-1">
                                        <View>
                                            <Text className="text-[10px] uppercase font-bold text-muted-foreground">Lifetime Savings</Text>
                                            <Text className="text-sm font-black text-foreground">${metrics.lifetimeSavingsUSD.toFixed(2)}</Text>
                                        </View>
                                        <View className="items-end">
                                            <Text className="text-[10px] uppercase font-bold text-muted-foreground">Sharing Revenue</Text>
                                            <Text className="text-sm font-black text-emerald-500">+${currentReport.communitySharingRevenueUSD.toFixed(2)}</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Savings Breakdown */}
                                <View className="rounded-2xl border border-border/70 bg-card p-4">
                                    <Text className="text-xs font-bold text-foreground mb-3 uppercase tracking-wider">
                                        Monthly Revenue Breakdown
                                    </Text>
                                    <View className="divide-y divide-border/30">
                                        <View className="flex-row justify-between py-2">
                                            <Text className="text-xs text-muted-foreground">Direct Solar Self-Consumption</Text>
                                            <Text className="text-xs font-bold text-foreground">+${currentReport.directSolarSavingsUSD.toFixed(2)}</Text>
                                        </View>
                                        <View className="flex-row justify-between py-2">
                                            <Text className="text-xs text-muted-foreground">Co-Op Community Sharing</Text>
                                            <Text className="text-xs font-bold text-emerald-500">+${currentReport.communitySharingRevenueUSD.toFixed(2)}</Text>
                                        </View>
                                        <View className="flex-row justify-between py-2">
                                            <Text className="text-xs text-muted-foreground">Grid Peak Tariff Avoidance</Text>
                                            <Text className="text-xs font-bold text-foreground">+${currentReport.gridAvoidanceSavingsUSD.toFixed(2)}</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Ecological Impact */}
                                <View className="rounded-2xl border border-border/70 bg-card p-4">
                                    <Text className="text-xs font-bold text-foreground mb-3 uppercase tracking-wider">
                                        Ecological & Social Impact
                                    </Text>
                                    <View className="flex-row justify-between gap-2">
                                        <View className="flex-1 rounded-xl bg-emerald-500/10 p-2.5 items-center border border-emerald-500/20">
                                            <MaterialCommunityIcons name="molecule-co2" size={20} color="#10B981" />
                                            <Text className="text-xs font-black text-foreground mt-1">{currentReport.co2EmissionsAvoidedKg} kg</Text>
                                            <Text className="text-[9px] text-muted-foreground">CO2 Avoided</Text>
                                        </View>
                                        <View className="flex-1 rounded-xl bg-emerald-500/10 p-2.5 items-center border border-emerald-500/20">
                                            <MaterialCommunityIcons name="tree" size={20} color="#10B981" />
                                            <Text className="text-xs font-black text-foreground mt-1">{currentReport.treesPlantedEquivalent}</Text>
                                            <Text className="text-[9px] text-muted-foreground">Trees Planted</Text>
                                        </View>
                                        <View className="flex-1 rounded-xl bg-emerald-500/10 p-2.5 items-center border border-emerald-500/20">
                                            <MaterialCommunityIcons name="home-group" size={20} color="#10B981" />
                                            <Text className="text-xs font-black text-foreground mt-1">{currentReport.homesPoweredEquivalent}</Text>
                                            <Text className="text-[9px] text-muted-foreground">Homes Powered</Text>
                                        </View>
                                    </View>
                                </View>

                                <Pressable
                                    onPress={handleDownloadReport}
                                    className="w-full rounded-2xl bg-primary py-3 items-center justify-center active:opacity-80"
                                >
                                    <Text className="text-xs font-black text-primary-foreground">
                                        Download Full Monthly Report Statement
                                    </Text>
                                </Pressable>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};
