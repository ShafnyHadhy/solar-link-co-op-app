import TabScreenBackground from '@/components/shared/TabScreenBackground';
import { useUser } from '@clerk/expo';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import SolarOwnerAlerts from '../alerts/SolarOwnerAlerts';
import SolarOwnerEnergy from '../energy/SolarOwnerEnergy';
import SolarOwnerMenu from '../menu/SolarOwnerMenu';
import SolarOwnerPrediction from '../prediction/SolarOwnerPrediction';
import SolarOwnerReports from '../reports/SolarOwnerReports';
import SolarOwnerShare from '../share/SolarOwnerShare';
import { SolarToast } from '../shared/SolarToast';
import { useSolarOwnerStore } from '../store/useSolarOwnerStore';
import { BatteryCard } from './BatteryCard';
import { ExcessEnergyCard } from './ExcessEnergyCard';
import { PowerFlowDiagram } from './PowerFlowDiagram';
import { QuickShareModal } from './QuickShareModal';

export const SolarOwnerDashboard = () => {
    const { user } = useUser();
    const {
        activeView,
        setActiveView,
        metrics,
        battery,
        alerts,
        weather,
    } = useSolarOwnerStore();

    const [quickShareOpen, setQuickShareOpen] = useState(false);

    // If a sub-view is selected within the persona, render that screen
    if (activeView === 'energy') {
        return <SolarOwnerEnergy />;
    }
    if (activeView === 'sharing') {
        return <SolarOwnerShare />;
    }
    if (activeView === 'alerts') {
        return <SolarOwnerAlerts />;
    }
    if (activeView === 'prediction') {
        return <SolarOwnerPrediction />;
    }
    if (activeView === 'reports') {
        return <SolarOwnerReports />;
    }
    if (activeView === 'menu') {
        return <SolarOwnerMenu />;
    }

    const unreadAlerts = alerts.filter((a) => !a.isRead);
    const mostRecentAlert = unreadAlerts[0] || alerts[0];

    return (
        <View className="flex-1 bg-background">
            <TabScreenBackground />
            <SolarToast />
            <QuickShareModal visible={quickShareOpen} onClose={() => setQuickShareOpen(false)} />

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
            >
                {/* 1. TOP HEADER & GREETING */}
                <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-1 mr-3">
                        <Text className="text-xs font-bold uppercase tracking-wider text-amber-500">
                            Solar Panel Owner
                        </Text>
                        <Text className="text-2xl font-black text-foreground tracking-tight">
                            Hi, {user?.firstName || 'Deshan'} 👋
                        </Text>
                    </View>

                    {/* Quick Notification Bell */}
                    <Pressable
                        onPress={() => setActiveView('alerts')}
                        className="h-11 w-11 items-center justify-center rounded-2xl bg-secondary/80 border border-border/70 relative active:opacity-70 shadow-sm"
                    >
                        <Feather name="bell" size={20} color="#F59E0B" />
                        {unreadAlerts.length > 0 && (
                            <View className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 rounded-full bg-destructive items-center justify-center border-2 border-background">
                                <Text className="text-[10px] font-black text-white">
                                    {unreadAlerts.length}
                                </Text>
                            </View>
                        )}
                    </Pressable>
                </View>

                {/* 2. RECENT IMPORTANT ALERT BANNER */}
                {mostRecentAlert && (
                    <Pressable
                        onPress={() => setActiveView('alerts')}
                        className="rounded-2xl bg-amber-500/15 border border-amber-500/40 p-3 flex-row items-center justify-between mb-4 active:opacity-80"
                    >
                        <View className="flex-row items-center flex-1 mr-2">
                            <View className="h-7 w-7 rounded-lg bg-amber-500/30 items-center justify-center mr-2.5">
                                <Feather name="alert-circle" size={16} color="#F59E0B" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-xs font-bold text-foreground" numberOfLines={1}>
                                    {mostRecentAlert.title}
                                </Text>
                                <Text className="text-[10px] text-muted-foreground" numberOfLines={1}>
                                    {mostRecentAlert.message}
                                </Text>
                            </View>
                        </View>
                        <Feather name="chevron-right" size={16} color="#F59E0B" />
                    </Pressable>
                )}

                {/* 3. HERO: AVAILABLE EXCESS ENERGY (Automatic Calculation) */}
                <ExcessEnergyCard onQuickSharePress={() => setQuickShareOpen(true)} />

                {/* 4. FOUR KEY KPI TILES (Generation, Consumption, Battery, Savings) */}
                <View className="flex-row flex-wrap justify-between gap-3 mb-5">
                    {/* Solar Generation Tile */}
                    <View className="w-[48%] rounded-[24px] border border-amber-500/30 bg-card/85 p-4 shadow-sm">
                        <View className="flex-row items-center justify-between mb-1.5">
                            <Text className="text-[11px] font-bold text-muted-foreground uppercase">
                                Solar Gen
                            </Text>
                            <Feather name="sun" size={16} color="#F59E0B" />
                        </View>
                        <Text className="text-2xl font-black text-foreground">
                            {metrics.generationKW.toFixed(1)} <Text className="text-xs font-bold text-amber-500">kW</Text>
                        </Text>
                        <Text className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                            {metrics.dailyGenerationKWh.toFixed(1)} kWh today
                        </Text>
                    </View>

                    {/* Household Consumption Tile */}
                    <View className="w-[48%] rounded-[24px] border border-sky-500/30 bg-card/85 p-4 shadow-sm">
                        <View className="flex-row items-center justify-between mb-1.5">
                            <Text className="text-[11px] font-bold text-muted-foreground uppercase">
                                Home Usage
                            </Text>
                            <Feather name="home" size={16} color="#0EA5E9" />
                        </View>
                        <Text className="text-2xl font-black text-foreground">
                            {metrics.consumptionKW.toFixed(1)} <Text className="text-xs font-bold text-sky-500">kW</Text>
                        </Text>
                        <Text className="text-[10px] text-muted-foreground font-semibold mt-0.5">
                            {metrics.dailyConsumptionKWh.toFixed(1)} kWh today
                        </Text>
                    </View>

                    {/* Battery Storage Tile */}
                    <View className="w-[48%] rounded-[24px] border border-emerald-500/30 bg-card/85 p-4 shadow-sm">
                        <View className="flex-row items-center justify-between mb-1.5">
                            <Text className="text-[11px] font-bold text-muted-foreground uppercase">
                                Battery
                            </Text>
                            <Feather name="battery-charging" size={16} color="#10B981" />
                        </View>
                        <Text className="text-2xl font-black text-foreground">
                            {battery.percentage}%
                        </Text>
                        <Text className="text-[10px] text-emerald-500 font-semibold mt-0.5">
                            +{metrics.batteryPowerKW.toFixed(1)} kW charging
                        </Text>
                    </View>

                    {/* Monthly Savings Tile */}
                    <View className="w-[48%] rounded-[24px] border border-border/80 bg-card/85 p-4 shadow-sm">
                        <View className="flex-row items-center justify-between mb-1.5">
                            <Text className="text-[11px] font-bold text-muted-foreground uppercase">
                                Savings
                            </Text>
                            <Feather name="dollar-sign" size={16} color="#10B981" />
                        </View>
                        <Text className="text-2xl font-black text-foreground">
                            ${metrics.monthlySavingsUSD.toFixed(0)}
                        </Text>
                        <Text className="text-[10px] text-emerald-500 font-semibold mt-0.5">
                            +${metrics.dailySavingsUSD.toFixed(2)} today
                        </Text>
                    </View>
                </View>

                {/* 5. TODAY'S ENERGY BALANCE OVERVIEW */}
                <View className="rounded-[28px] border border-border/70 bg-card/85 dark:bg-card/50 p-5 mb-5 shadow-sm">
                    <View className="flex-row items-center justify-between mb-3">
                        <View>
                            <Text className="text-base font-bold text-foreground">
                                Today's Energy Balance
                            </Text>
                            <Text className="text-xs text-muted-foreground">
                                100% self-powered from rooftop solar
                            </Text>
                        </View>
                        <View className="rounded-full bg-emerald-500/20 px-2.5 py-1 border border-emerald-500/40">
                            <Text className="text-[10px] font-black text-emerald-500 uppercase">
                                Zero Grid Draw
                            </Text>
                        </View>
                    </View>

                    {/* Balance Bar Visual */}
                    <View className="h-3.5 w-full rounded-full bg-secondary/80 flex-row overflow-hidden my-2">
                        {/* Consumption portion */}
                        <View
                            className="h-full bg-sky-500"
                            style={{
                                width: `${(metrics.dailyConsumptionKWh / metrics.dailyGenerationKWh) * 100}%`,
                            }}
                        />
                        {/* Shared portion */}
                        <View
                            className="h-full bg-purple-500"
                            style={{
                                width: `${(metrics.dailySharedKWh / metrics.dailyGenerationKWh) * 100}%`,
                            }}
                        />
                        {/* Available Surplus */}
                        <View className="h-full bg-amber-500 flex-1" />
                    </View>

                    <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-border/30">
                        <View className="flex-row items-center">
                            <View className="h-2 w-2 rounded-full bg-sky-500 mr-1.5" />
                            <Text className="text-[11px] text-muted-foreground font-medium">
                                Home: {metrics.dailyConsumptionKWh.toFixed(1)} kWh
                            </Text>
                        </View>
                        <View className="flex-row items-center">
                            <View className="h-2 w-2 rounded-full bg-purple-500 mr-1.5" />
                            <Text className="text-[11px] text-muted-foreground font-medium">
                                Shared: {metrics.dailySharedKWh.toFixed(1)} kWh
                            </Text>
                        </View>
                        <View className="flex-row items-center">
                            <View className="h-2 w-2 rounded-full bg-amber-500 mr-1.5" />
                            <Text className="text-[11px] text-muted-foreground font-medium">
                                Excess: {metrics.dailyExcessKWh.toFixed(1)} kWh
                            </Text>
                        </View>
                    </View>
                </View>

                {/* 6. LIVE POWER FLOW DIAGRAM */}
                <PowerFlowDiagram />

                {/* 7. BATTERY STATUS CARD */}
                <BatteryCard />

                {/* 8. WEATHER & SOLAR PREDICTION SUMMARY CARD */}
                <Pressable
                    onPress={() => setActiveView('prediction')}
                    className="rounded-[28px] border border-border/70 bg-card/85 dark:bg-card/50 p-5 mb-5 shadow-sm active:opacity-80"
                >
                    <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-row items-center">
                            <MaterialCommunityIcons name="weather-sunny" size={22} color="#F59E0B" style={{ marginRight: 8 }} />
                            <Text className="text-base font-bold text-foreground">
                                Solar Prediction & Weather
                            </Text>
                        </View>
                        <Feather name="chevron-right" size={18} color="#9CA3AF" />
                    </View>
                    <Text className="text-xs text-muted-foreground leading-relaxed">
                        ☀️ <Text className="font-bold text-foreground">{weather.expectedSolarLevel} Generation Expected Today</Text> ({weather.temperatureC}°C, UV {weather.uvIndex}). Peak solar window between 10:30 AM – 3:30 PM.
                    </Text>
                </Pressable>

                {/* 9. BOTTOM FEATURE NAVIGATION GRID */}
                <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-2 mb-2">
                    Quick Navigation
                </Text>
                <View className="flex-row flex-wrap justify-between gap-3 mb-6">
                    <Pressable
                        onPress={() => setActiveView('sharing')}
                        className="w-[48%] rounded-2xl bg-secondary/80 border border-border/70 p-3.5 flex-row items-center active:opacity-80"
                    >
                        <View className="h-8 w-8 rounded-xl bg-purple-500/15 items-center justify-center mr-2.5">
                            <Feather name="share-2" size={16} color="#A855F7" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-xs font-bold text-foreground">
                                Energy Sharing
                            </Text>
                            <Text className="text-[10px] text-muted-foreground">
                                Requests & Pool
                            </Text>
                        </View>
                    </Pressable>

                    <Pressable
                        onPress={() => setActiveView('energy')}
                        className="w-[48%] rounded-2xl bg-secondary/80 border border-border/70 p-3.5 flex-row items-center active:opacity-80"
                    >
                        <View className="h-8 w-8 rounded-xl bg-amber-500/15 items-center justify-center mr-2.5">
                            <Feather name="bar-chart-2" size={16} color="#F59E0B" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-xs font-bold text-foreground">
                                Energy Analytics
                            </Text>
                            <Text className="text-[10px] text-muted-foreground">
                                Detailed Curves
                            </Text>
                        </View>
                    </Pressable>

                    <Pressable
                        onPress={() => setActiveView('reports')}
                        className="w-[48%] rounded-2xl bg-secondary/80 border border-border/70 p-3.5 flex-row items-center active:opacity-80"
                    >
                        <View className="h-8 w-8 rounded-xl bg-emerald-500/15 items-center justify-center mr-2.5">
                            <Feather name="file-text" size={16} color="#10B981" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-xs font-bold text-foreground">
                                Savings Reports
                            </Text>
                            <Text className="text-[10px] text-muted-foreground">
                                ROI & Milestones
                            </Text>
                        </View>
                    </Pressable>

                    <Pressable
                        onPress={() => setActiveView('menu')}
                        className="w-[48%] rounded-2xl bg-secondary/80 border border-border/70 p-3.5 flex-row items-center active:opacity-80"
                    >
                        <View className="h-8 w-8 rounded-xl bg-sky-500/15 items-center justify-center mr-2.5">
                            <Feather name="settings" size={16} color="#0EA5E9" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-xs font-bold text-foreground">
                                Settings & Specs
                            </Text>
                            <Text className="text-[10px] text-muted-foreground">
                                Hardware & Tips
                            </Text>
                        </View>
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    );
};

export default SolarOwnerDashboard;
