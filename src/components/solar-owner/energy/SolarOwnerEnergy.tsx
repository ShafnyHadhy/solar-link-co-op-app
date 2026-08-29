import TabScreenBackground from '@/components/shared/TabScreenBackground';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SolarToast } from '../shared/SolarToast';
import { ViewHeader } from '../shared/ViewHeader';
import { useSolarOwnerStore } from '../store/useSolarOwnerStore';

export const SolarOwnerEnergy = () => {
    const insets = useSafeAreaInsets();
    const { metrics, battery, weather, suggestions, monthlyReports, showToast } = useSolarOwnerStore();
    const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month'>('today');

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

    const weeklyData = [
        { time: 'Mon', gen: 28.5, con: 12.0 },
        { time: 'Tue', gen: 31.2, con: 13.5 },
        { time: 'Wed', gen: 24.0, con: 14.2 },
        { time: 'Thu', gen: 33.0, con: 12.8 },
        { time: 'Fri', gen: 29.4, con: 11.9 },
        { time: 'Sat', gen: 34.5, con: 15.0 },
        { time: 'Sun', gen: 28.4, con: 12.6 },
    ];

    const monthlyData = [
        { time: 'W1', gen: 175.0, con: 78.0 },
        { time: 'W2', gen: 192.0, con: 84.5 },
        { time: 'W3', gen: 168.0, con: 74.0 },
        { time: 'W4', gen: 185.0, con: 81.5 },
        { time: 'W5', gen: 60.0, con: 22.0 },
    ];

    const chartData =
        timeframe === 'today'
            ? hourlyData
            : timeframe === 'week'
                ? weeklyData
                : monthlyData;

    const maxVal =
        timeframe === 'today'
            ? 6.0
            : timeframe === 'week'
                ? 38.0
                : 210.0;

    const currentReport = monthlyReports[0];

    const handleDownloadReport = () => {
        showToast('Monthly Energy Statement downloaded (PDF/CSV ready in files)', 'success');
    };

    return (
        <View className="flex-1 bg-background">
            <TabScreenBackground />
            <SolarToast />

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingTop: insets.top > 0 ? insets.top + 10 : 24,
                    paddingBottom: 40,
                }}
            >
                {/* Header */}
                <ViewHeader
                    title="Energy Analytics"
                    subtitle="Real-time monitoring, trends & predictive forecasts"
                    showBack={false}
                    rightAction={{
                        icon: 'download',
                        onPress: handleDownloadReport,
                    }}
                />

                {/* 1. REAL-TIME MONITORING 4-STAT GRID */}
                <View className="flex-row flex-wrap justify-between gap-2.5 mb-5">
                    {/* Real-Time Generation */}
                    <View className="w-[48%] rounded-2xl border border-amber-500/30 bg-card/85 p-3.5 shadow-sm">
                        <View className="flex-row items-center justify-between mb-1">
                            <Text className="text-[11px] font-bold text-muted-foreground uppercase" numberOfLines={1}>
                                Current Gen
                            </Text>
                            <Feather name="sun" size={14} color="#F59E0B" />
                        </View>
                        <Text className="text-2xl font-black text-foreground" numberOfLines={1}>
                            {metrics.generationKW.toFixed(1)} <Text className="text-xs font-bold text-amber-500">kW</Text>
                        </Text>
                        <Text className="text-[10px] text-muted-foreground mt-0.5" numberOfLines={1}>
                            {metrics.dailyGenerationKWh.toFixed(1)} kWh today
                        </Text>
                    </View>

                    {/* Real-Time Consumption */}
                    <View className="w-[48%] rounded-2xl border border-sky-500/30 bg-card/85 p-3.5 shadow-sm">
                        <View className="flex-row items-center justify-between mb-1">
                            <Text className="text-[11px] font-bold text-muted-foreground uppercase" numberOfLines={1}>
                                Current Usage
                            </Text>
                            <Feather name="home" size={14} color="#0EA5E9" />
                        </View>
                        <Text className="text-2xl font-black text-foreground" numberOfLines={1}>
                            {metrics.consumptionKW.toFixed(1)} <Text className="text-xs font-bold text-sky-500">kW</Text>
                        </Text>
                        <Text className="text-[10px] text-muted-foreground mt-0.5" numberOfLines={1}>
                            {metrics.dailyConsumptionKWh.toFixed(1)} kWh today
                        </Text>
                    </View>

                    {/* Current Excess Energy */}
                    <View className="w-[48%] rounded-2xl border border-purple-500/30 bg-card/85 p-3.5 shadow-sm">
                        <View className="flex-row items-center justify-between mb-1">
                            <Text className="text-[11px] font-bold text-muted-foreground uppercase" numberOfLines={1}>
                                Excess Energy
                            </Text>
                            <MaterialCommunityIcons name="lightning-bolt" size={14} color="#A855F7" />
                        </View>
                        <Text className="text-2xl font-black text-foreground" numberOfLines={1}>
                            {metrics.excessKW.toFixed(1)} <Text className="text-xs font-bold text-purple-500">kW</Text>
                        </Text>
                        <Text className="text-[10px] text-muted-foreground mt-0.5" numberOfLines={1}>
                            {metrics.dailyExcessKWh.toFixed(1)} kWh surplus
                        </Text>
                    </View>

                    {/* Battery Status */}
                    <View className="w-[48%] rounded-2xl border border-emerald-500/30 bg-card/85 p-3.5 shadow-sm">
                        <View className="flex-row items-center justify-between mb-1">
                            <Text className="text-[11px] font-bold text-muted-foreground uppercase" numberOfLines={1}>
                                Battery
                            </Text>
                            <Feather name="battery-charging" size={14} color="#10B981" />
                        </View>
                        <Text className="text-2xl font-black text-foreground" numberOfLines={1}>
                            {battery.percentage}%
                        </Text>
                        <Text className="text-[10px] text-emerald-500 mt-0.5" numberOfLines={1}>
                            +{metrics.batteryPowerKW.toFixed(1)} kW chg
                        </Text>
                    </View>
                </View>

                {/* 2. ANALYTICS: GENERATION VS CONSUMPTION GRAPH */}
                <View className="rounded-[28px] border border-border/70 bg-card/85 dark:bg-card/50 p-5 mb-5 shadow-sm">
                    <View className="flex-row items-center justify-between mb-4 gap-2">
                        <View className="flex-1 mr-2 min-w-0">
                            <Text className="text-base font-bold text-foreground" numberOfLines={1}>
                                Generation vs Consumption
                            </Text>
                            <Text className="text-xs text-muted-foreground font-medium" numberOfLines={1}>
                                {timeframe === 'today'
                                    ? 'Hourly performance curve (kW)'
                                    : timeframe === 'week'
                                    ? 'Daily 7-day energy overview (kWh)'
                                    : 'Monthly breakdown by week (kWh)'}
                            </Text>
                        </View>

                        {/* Timeframe Toggle */}
                        <View className="flex-row bg-secondary rounded-xl p-1 border border-border/60 flex-shrink-0">
                            {(['today', 'week', 'month'] as const).map((tab) => (
                                <Pressable
                                    key={tab}
                                    onPress={() => setTimeframe(tab)}
                                    className={`px-2.5 py-1 rounded-lg ${timeframe === tab ? 'bg-primary' : ''}`}
                                >
                                    <Text
                                        className={`text-[10px] font-bold capitalize ${
                                            timeframe === tab ? 'text-primary-foreground' : 'text-muted-foreground'
                                        }`}
                                    >
                                        {tab}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    {/* Simple Bar Chart */}
                    <View className="h-44 flex-row items-end justify-between pt-4 pb-2 border-b border-border/40">
                        {chartData.map((item, index) => {
                            return (
                                <View key={index} className="items-center flex-1">
                                    <View className="flex-row items-end gap-1 mb-1">
                                        <View
                                            className="w-2.5 rounded-t-sm bg-amber-500"
                                            style={{ height: Math.min(110, (item.gen / maxVal) * 110) }}
                                        />
                                        <View
                                            className="w-2.5 rounded-t-sm bg-sky-500"
                                            style={{ height: Math.min(110, (item.con / maxVal) * 110) }}
                                        />
                                    </View>
                                    <Text className="text-[9px] font-semibold text-muted-foreground">
                                        {item.time}
                                    </Text>
                                </View>
                            );
                        })}
                    </View>

                    {/* Chart Legend */}
                    <View className="flex-row items-center justify-center gap-5 mt-3">
                        <View className="flex-row items-center">
                            <View className="h-3 w-3 rounded-sm bg-amber-500 mr-1.5" />
                            <Text className="text-xs font-semibold text-foreground">
                                Solar Generation ({timeframe === 'today' ? 'kW' : 'kWh'})
                            </Text>
                        </View>
                        <View className="flex-row items-center">
                            <View className="h-3 w-3 rounded-sm bg-sky-500 mr-1.5" />
                            <Text className="text-xs font-semibold text-foreground">
                                Consumption ({timeframe === 'today' ? 'kW' : 'kWh'})
                            </Text>
                        </View>
                    </View>
                </View>

                {/* 3. DAILY & HISTORICAL ENERGY STATISTICS */}
                <View className="rounded-[28px] border border-border/70 bg-card/85 dark:bg-card/50 p-5 mb-5 shadow-sm">
                    <Text className="text-base font-bold text-foreground mb-3">
                        Performance Statistics
                    </Text>
                    <View className="divide-y divide-border/40">
                        <View className="flex-row justify-between py-2.5">
                            <Text className="text-xs font-medium text-muted-foreground">
                                Peak Solar Generation
                            </Text>
                            <Text className="text-xs font-bold text-foreground">
                                5.9 kW @ 12:30 PM
                            </Text>
                        </View>
                        <View className="flex-row justify-between py-2.5">
                            <Text className="text-xs font-medium text-muted-foreground">
                                Self-Consumption Ratio
                            </Text>
                            <Text className="text-xs font-bold text-sky-500">
                                44.3% (Used at Home)
                            </Text>
                        </View>
                        <View className="flex-row justify-between py-2.5">
                            <Text className="text-xs font-medium text-muted-foreground">
                                Community Sharing & Export
                            </Text>
                            <Text className="text-xs font-bold text-emerald-500">
                                55.7% (Shared to Microgrid)
                            </Text>
                        </View>
                        <View className="flex-row justify-between py-2.5">
                            <Text className="text-xs font-medium text-muted-foreground">
                                Grid Self-Sufficiency Index
                            </Text>
                            <Text className="text-xs font-bold text-amber-500">
                                100% (Zero Grid Dependency)
                            </Text>
                        </View>
                    </View>
                </View>

                {/* 4. SAVINGS & MONTHLY TOTALS BREAKDOWN */}
                <View className="rounded-[28px] border border-border/70 bg-card/85 dark:bg-card/50 p-5 mb-5 shadow-sm">
                    <View className="flex-row items-center justify-between mb-3">
                        <View>
                            <Text className="text-base font-bold text-foreground">
                                Monthly Savings Breakdown
                            </Text>
                            <Text className="text-xs text-muted-foreground font-medium">
                                August 2026 Summary
                            </Text>
                        </View>
                        <Text className="text-lg font-black text-emerald-500">
                            ${currentReport.totalSavingsUSD.toFixed(2)}
                        </Text>
                    </View>

                    <View className="grid grid-cols-2 gap-2 mt-2">
                        <View className="flex-row justify-between py-1.5 border-b border-border/30">
                            <Text className="text-xs text-muted-foreground">Total Solar Generated</Text>
                            <Text className="text-xs font-bold text-foreground">{currentReport.totalGeneratedKWh} kWh</Text>
                        </View>
                        <View className="flex-row justify-between py-1.5 border-b border-border/30">
                            <Text className="text-xs text-muted-foreground">Household Consumed</Text>
                            <Text className="text-xs font-bold text-foreground">{currentReport.totalConsumedKWh} kWh</Text>
                        </View>
                        <View className="flex-row justify-between py-1.5 border-b border-border/30">
                            <Text className="text-xs text-muted-foreground">Energy Shared with Co-Op</Text>
                            <Text className="text-xs font-bold text-emerald-500">{currentReport.totalSharedKWh} kWh</Text>
                        </View>
                        <View className="flex-row justify-between py-1.5 border-b border-border/30">
                            <Text className="text-xs text-muted-foreground">Sharing Revenue Earned</Text>
                            <Text className="text-xs font-bold text-emerald-500">+${currentReport.communitySharingRevenueUSD.toFixed(2)}</Text>
                        </View>
                    </View>
                </View>

                {/* 5. WEATHER & PREDICTED SOLAR GENERATION SECTION */}
                <View className="rounded-[28px] border border-border/70 bg-card/85 dark:bg-card/50 p-5 mb-5 shadow-sm">
                    <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center">
                            <MaterialCommunityIcons name="weather-sunny" size={20} color="#F59E0B" style={{ marginRight: 8 }} />
                            <Text className="text-base font-bold text-foreground">
                                Weather & Solar Prediction
                            </Text>
                        </View>
                        <View className="bg-emerald-500/20 px-2 py-0.5 rounded-full">
                            <Text className="text-[10px] font-black text-emerald-500 uppercase">
                                {weather.expectedSolarLevel} Solar
                            </Text>
                        </View>
                    </View>

                    {/* Hourly Predicted Yield Curve Bars */}
                    <Text className="text-[11px] font-bold uppercase text-muted-foreground mb-2">
                        Today's Predicted Generation Curve (kW)
                    </Text>
                    <View className="h-32 flex-row items-end justify-between pt-2 pb-2 border-b border-border/40">
                        {weather.hourlyPredictions.map((h, i) => (
                            <View key={i} className="items-center flex-1">
                                <View
                                    className="w-3 rounded-t-sm bg-amber-500/80 mb-1"
                                    style={{ height: (h.predictedKW / 6.0) * 80 }}
                                />
                                <Text className="text-[8px] font-bold text-muted-foreground">
                                    {h.hour}
                                </Text>
                            </View>
                        ))}
                    </View>
                    <Text className="text-xs text-muted-foreground mt-2.5">
                        ☀️ Clear skies and low cloud cover ({weather.cloudCoverPercent}%) will deliver high irradiance between 10:30 AM and 3:30 PM.
                    </Text>
                </View>

                {/* 6. ENERGY EFFICIENCY SUGGESTIONS */}
                <View className="rounded-[28px] border border-border/70 bg-card/85 dark:bg-card/50 p-5 mb-5 shadow-sm">
                    <Text className="text-base font-bold text-foreground mb-1">
                        Energy Efficiency Suggestions
                    </Text>
                    <Text className="text-xs text-muted-foreground mb-3">
                        Actionable tips to optimize solar self-consumption
                    </Text>

                    <View className="gap-2.5">
                        {suggestions.slice(0, 2).map((sug) => (
                            <View key={sug.id} className="rounded-2xl border border-border/60 bg-secondary/30 p-3">
                                <View className="flex-row items-center justify-between mb-1">
                                    <Text className="text-xs font-bold text-foreground">
                                        {sug.title}
                                    </Text>
                                    <Text className="text-[10px] font-bold text-emerald-500">
                                        {sug.potentialSavingsUSD}
                                    </Text>
                                </View>
                                <Text className="text-[11px] text-muted-foreground leading-relaxed">
                                    {sug.description}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* 7. DOWNLOAD REPORT ACTION BUTTON */}
                <Pressable
                    onPress={handleDownloadReport}
                    className="w-full rounded-2xl bg-secondary/80 border border-border/70 py-3.5 items-center justify-center active:opacity-80 mb-6"
                >
                    <View className="flex-row items-center">
                        <Feather name="file-text" size={16} color="#10B981" style={{ marginRight: 8 }} />
                        <Text className="text-sm font-bold text-foreground">
                            Download Full Monthly Energy Report (PDF)
                        </Text>
                    </View>
                </Pressable>
            </ScrollView>
        </View>
    );
};

export default SolarOwnerEnergy;
