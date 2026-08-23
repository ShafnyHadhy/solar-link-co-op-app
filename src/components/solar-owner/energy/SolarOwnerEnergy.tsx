import TabScreenBackground from '@/components/shared/TabScreenBackground';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SolarToast } from '../shared/SolarToast';
import { ViewHeader } from '../shared/ViewHeader';
import { useSolarOwnerStore } from '../store/useSolarOwnerStore';

export const SolarOwnerEnergy = () => {
    const { metrics, battery, setActiveView, weather } = useSolarOwnerStore();
    const [selectedTab, setSelectedTab] = useState<'today' | 'month'>('today');

    // Chart Data for Hourly Generation vs Consumption (Today)
    const hourlyData = [
        { time: '06:00', gen: 0.3, con: 0.8 },
        { time: '08:00', gen: 2.0, con: 1.5 },
        { time: '10:00', gen: 4.6, con: 1.8 },
        { time: '12:00', gen: 5.8, con: 2.2 },
        { time: '14:00', gen: 5.4, con: 2.5 },
        { time: '16:00', gen: 3.2, con: 2.1 },
        { time: '18:00', gen: 0.8, con: 2.8 },
    ];

    const maxVal = 6.0;

    return (
        <View className="flex-1 bg-background">
            <TabScreenBackground />
            <SolarToast />

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
            >
                {/* Header */}
                <ViewHeader
                    title="Energy Analytics"
                    subtitle="Live generation, consumption & battery telemetry"
                    showBack={false}
                    rightAction={{
                        icon: 'sun',
                        onPress: () => setActiveView('prediction'),
                    }}
                />

                {/* Real-time 4-Metric Grid */}
                <View className="flex-row flex-wrap justify-between gap-3 mb-5">
                    {/* Generation */}
                    <View className="w-[48%] rounded-2xl border border-amber-500/30 bg-card/85 p-3.5 shadow-sm">
                        <View className="flex-row items-center justify-between mb-1">
                            <Text className="text-[11px] font-bold text-muted-foreground uppercase">
                                Generation
                            </Text>
                            <Feather name="sun" size={14} color="#F59E0B" />
                        </View>
                        <Text className="text-2xl font-black text-foreground">
                            {metrics.generationKW.toFixed(1)} <Text className="text-xs text-amber-500">kW</Text>
                        </Text>
                        <Text className="text-[10px] text-muted-foreground mt-0.5">
                            {metrics.dailyGenerationKWh.toFixed(1)} kWh today
                        </Text>
                    </View>

                    {/* Consumption */}
                    <View className="w-[48%] rounded-2xl border border-sky-500/30 bg-card/85 p-3.5 shadow-sm">
                        <View className="flex-row items-center justify-between mb-1">
                            <Text className="text-[11px] font-bold text-muted-foreground uppercase">
                                Consumption
                            </Text>
                            <Feather name="home" size={14} color="#0EA5E9" />
                        </View>
                        <Text className="text-2xl font-black text-foreground">
                            {metrics.consumptionKW.toFixed(1)} <Text className="text-xs text-sky-500">kW</Text>
                        </Text>
                        <Text className="text-[10px] text-muted-foreground mt-0.5">
                            {metrics.dailyConsumptionKWh.toFixed(1)} kWh today
                        </Text>
                    </View>

                    {/* Available Excess */}
                    <View className="w-[48%] rounded-2xl border border-purple-500/30 bg-card/85 p-3.5 shadow-sm">
                        <View className="flex-row items-center justify-between mb-1">
                            <Text className="text-[11px] font-bold text-muted-foreground uppercase">
                                Excess Energy
                            </Text>
                            <MaterialCommunityIcons name="lightning-bolt" size={14} color="#A855F7" />
                        </View>
                        <Text className="text-2xl font-black text-foreground">
                            {metrics.excessKW.toFixed(1)} <Text className="text-xs text-purple-500">kW</Text>
                        </Text>
                        <Text className="text-[10px] text-muted-foreground mt-0.5">
                            {metrics.dailyExcessKWh.toFixed(1)} kWh to share
                        </Text>
                    </View>

                    {/* Battery */}
                    <View className="w-[48%] rounded-2xl border border-emerald-500/30 bg-card/85 p-3.5 shadow-sm">
                        <View className="flex-row items-center justify-between mb-1">
                            <Text className="text-[11px] font-bold text-muted-foreground uppercase">
                                Battery
                            </Text>
                            <Feather name="battery-charging" size={14} color="#10B981" />
                        </View>
                        <Text className="text-2xl font-black text-foreground">
                            {battery.percentage}%
                        </Text>
                        <Text className="text-[10px] text-muted-foreground mt-0.5">
                            +{metrics.batteryPowerKW.toFixed(1)} kW charging
                        </Text>
                    </View>
                </View>

                {/* Generation vs Consumption Graph Section */}
                <View className="rounded-[28px] border border-border/70 bg-card/85 dark:bg-card/50 p-5 mb-5 shadow-sm">
                    <View className="flex-row items-center justify-between mb-4">
                        <View>
                            <Text className="text-base font-bold text-foreground">
                                Generation vs Consumption
                            </Text>
                            <Text className="text-xs text-muted-foreground font-medium">
                                Simple comparison curve (kW)
                            </Text>
                        </View>

                        {/* Toggle Pill */}
                        <View className="flex-row bg-secondary rounded-xl p-1 border border-border/60">
                            <Pressable
                                onPress={() => setSelectedTab('today')}
                                className={`px-2.5 py-1 rounded-lg ${selectedTab === 'today' ? 'bg-primary' : ''}`}
                            >
                                <Text className={`text-[10px] font-bold ${selectedTab === 'today' ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                                    Today
                                </Text>
                            </Pressable>
                            <Pressable
                                onPress={() => setSelectedTab('month')}
                                className={`px-2.5 py-1 rounded-lg ${selectedTab === 'month' ? 'bg-primary' : ''}`}
                            >
                                <Text className={`text-[10px] font-bold ${selectedTab === 'month' ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                                    Monthly
                                </Text>
                            </Pressable>
                        </View>
                    </View>

                    {/* Simple Bar Chart Comparison */}
                    <View className="h-44 flex-row items-end justify-between pt-4 pb-2 border-b border-border/40">
                        {hourlyData.map((item, index) => (
                            <View key={index} className="items-center flex-1">
                                <View className="flex-row items-end gap-1 mb-1">
                                    {/* Solar Bar (Amber) */}
                                    <View
                                        className="w-2.5 rounded-t-sm bg-amber-500"
                                        style={{ height: (item.gen / maxVal) * 110 }}
                                    />
                                    {/* Consumption Bar (Sky) */}
                                    <View
                                        className="w-2.5 rounded-t-sm bg-sky-500"
                                        style={{ height: (item.con / maxVal) * 110 }}
                                    />
                                </View>
                                <Text className="text-[9px] font-semibold text-muted-foreground">
                                    {item.time}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Legend */}
                    <View className="flex-row items-center justify-center gap-5 mt-3">
                        <View className="flex-row items-center">
                            <View className="h-3 w-3 rounded-sm bg-amber-500 mr-1.5" />
                            <Text className="text-xs font-semibold text-foreground">
                                Solar Generation (kW)
                            </Text>
                        </View>
                        <View className="flex-row items-center">
                            <View className="h-3 w-3 rounded-sm bg-sky-500 mr-1.5" />
                            <Text className="text-xs font-semibold text-foreground">
                                Home Usage (kW)
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Daily & Monthly Statistics Summary */}
                <View className="rounded-[28px] border border-border/70 bg-card/85 dark:bg-card/50 p-5 mb-5 shadow-sm">
                    <Text className="text-base font-bold text-foreground mb-3">
                        Energy Balance Summary
                    </Text>
                    <View className="divide-y divide-border/40">
                        <View className="flex-row justify-between py-2.5">
                            <Text className="text-xs font-medium text-muted-foreground">
                                Total Solar Produced Today
                            </Text>
                            <Text className="text-xs font-bold text-foreground">
                                {metrics.dailyGenerationKWh.toFixed(1)} kWh
                            </Text>
                        </View>
                        <View className="flex-row justify-between py-2.5">
                            <Text className="text-xs font-medium text-muted-foreground">
                                Household Consumption
                            </Text>
                            <Text className="text-xs font-bold text-foreground">
                                {metrics.dailyConsumptionKWh.toFixed(1)} kWh
                            </Text>
                        </View>
                        <View className="flex-row justify-between py-2.5">
                            <Text className="text-xs font-medium text-muted-foreground">
                                Shared with Community Co-Op
                            </Text>
                            <Text className="text-xs font-bold text-emerald-500">
                                {metrics.dailySharedKWh.toFixed(1)} kWh
                            </Text>
                        </View>
                        <View className="flex-row justify-between py-2.5">
                            <Text className="text-xs font-medium text-muted-foreground">
                                Self-Sufficiency Index
                            </Text>
                            <Text className="text-xs font-bold text-amber-500">
                                {metrics.dailySelfSufficiencyPercent}% (100% Off-Grid today)
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Quick Access Banner to Reports & Predictions */}
                <View className="flex-row gap-3 mb-6">
                    <Pressable
                        onPress={() => setActiveView('reports')}
                        className="flex-1 rounded-2xl bg-secondary/80 border border-border/70 p-4 items-center active:opacity-80"
                    >
                        <Feather name="file-text" size={20} color="#10B981" />
                        <Text className="text-xs font-bold text-foreground mt-2">
                            View Savings & Reports
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={() => setActiveView('prediction')}
                        className="flex-1 rounded-2xl bg-secondary/80 border border-border/70 p-4 items-center active:opacity-80"
                    >
                        <Feather name="cloud-rain" size={20} color="#F59E0B" />
                        <Text className="text-xs font-bold text-foreground mt-2">
                            Weather & Forecasts
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    );
};

export default SolarOwnerEnergy;
