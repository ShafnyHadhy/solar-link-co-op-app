import TabScreenBackground from '@/components/shared/TabScreenBackground';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SolarToast } from '../shared/SolarToast';
import { ViewHeader } from '../shared/ViewHeader';
import { useSolarOwnerStore } from '../store/useSolarOwnerStore';

export const SolarOwnerPrediction = () => {
    const { weather, suggestions, setActiveView } = useSolarOwnerStore();

    const maxKW = 6.5;

    return (
        <View className="flex-1 bg-background">
            <TabScreenBackground />
            <SolarToast />

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
            >
                {/* Header with Back */}
                <ViewHeader
                    title="Weather & Solar Forecast"
                    subtitle="AI solar irradiance & generation predictions"
                    showBack={true}
                />

                {/* 1. WEATHER & EXPECTED GENERATION HERO */}
                <View className="rounded-[28px] border-2 border-amber-500/40 bg-card/90 dark:bg-card/60 p-5 mb-5 shadow-lg relative overflow-hidden">
                    <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center">
                            <View className="h-10 w-10 rounded-2xl bg-amber-500/20 items-center justify-center mr-3 border border-amber-500/30">
                                <MaterialCommunityIcons name="weather-sunny" size={24} color="#F59E0B" />
                            </View>
                            <View>
                                <Text className="text-base font-bold text-foreground">
                                    Today's Solar Outlook
                                </Text>
                                <Text className="text-xs text-muted-foreground font-medium">
                                    {weather.conditionText}
                                </Text>
                            </View>
                        </View>

                        {/* Expected Generation Level Badge */}
                        <View className="bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 rounded-full">
                            <Text className="text-xs font-black text-emerald-500 uppercase tracking-wide">
                                {weather.expectedSolarLevel} Generation
                            </Text>
                        </View>
                    </View>

                    {/* Big Stats Row */}
                    <View className="flex-row items-center justify-between my-2 py-3 border-y border-border/40">
                        <View className="items-center flex-1">
                            <Text className="text-[10px] uppercase font-bold text-muted-foreground">
                                Temperature
                            </Text>
                            <Text className="text-lg font-black text-foreground mt-0.5">
                                {weather.temperatureC}°C
                            </Text>
                        </View>

                        <View className="items-center flex-1 border-x border-border/40">
                            <Text className="text-[10px] uppercase font-bold text-muted-foreground">
                                UV Index
                            </Text>
                            <Text className="text-lg font-black text-amber-500 mt-0.5">
                                {weather.uvIndex} (Very High)
                            </Text>
                        </View>

                        <View className="items-center flex-1">
                            <Text className="text-[10px] uppercase font-bold text-muted-foreground">
                                Cloud Cover
                            </Text>
                            <Text className="text-lg font-black text-foreground mt-0.5">
                                {weather.cloudCoverPercent}%
                            </Text>
                        </View>
                    </View>

                    {/* Explanation of Weather Impact on Solar */}
                    <View className="mt-2 pt-1 flex-row items-start">
                        <Feather name="info" size={16} color="#F59E0B" style={{ marginTop: 2, marginRight: 8 }} />
                        <Text className="text-xs text-muted-foreground flex-1 leading-relaxed">
                            <Text className="font-bold text-foreground">Why this matters: </Text>
                            {weather.aiSummary}
                        </Text>
                    </View>
                </View>

                {/* 2. HOURLY PREDICTED SOLAR GENERATION CURVE */}
                <View className="rounded-[28px] border border-border/70 bg-card/85 dark:bg-card/50 p-5 mb-5 shadow-sm">
                    <View className="flex-row items-center justify-between mb-3">
                        <View>
                            <Text className="text-base font-bold text-foreground">
                                Predicted Solar Output (kW)
                            </Text>
                            <Text className="text-xs text-muted-foreground font-medium">
                                Hourly AI generation yield forecast
                            </Text>
                        </View>
                        <View className="bg-secondary px-2.5 py-1 rounded-xl">
                            <Text className="text-[10px] font-bold text-foreground">
                                Peak: ~5.9 kW @ 12:30 PM
                            </Text>
                        </View>
                    </View>

                    {/* Chart Bars */}
                    <View className="h-44 flex-row items-end justify-between pt-4 pb-2 border-b border-border/40">
                        {weather.hourlyPredictions.map((hourData, idx) => (
                            <View key={idx} className="items-center flex-1">
                                <View className="items-center mb-1">
                                    <Text className="text-[9px] font-bold text-amber-500 mb-0.5">
                                        {hourData.predictedKW.toFixed(1)}
                                    </Text>
                                    <View
                                        className="w-4 rounded-t-md bg-amber-500/80 border-t border-amber-400"
                                        style={{ height: (hourData.predictedKW / maxKW) * 110 }}
                                    />
                                </View>
                                <Text className="text-[9px] font-semibold text-muted-foreground">
                                    {hourData.hour}
                                </Text>
                            </View>
                        ))}
                    </View>

                    <Text className="text-[11px] text-muted-foreground text-center mt-3 font-medium">
                        ☀️ Peak Irradiance Window: 10:30 AM – 3:30 PM (Optimal for heavy appliance usage)
                    </Text>
                </View>

                {/* 3. 7-DAY SOLAR GENERATION FORECAST */}
                <View className="rounded-[28px] border border-border/70 bg-card/85 dark:bg-card/50 p-5 mb-5 shadow-sm">
                    <Text className="text-base font-bold text-foreground mb-3">
                        7-Day Solar Forecast
                    </Text>

                    <View className="divide-y divide-border/40">
                        {weather.dailyForecast.map((dayItem, idx) => (
                            <View key={idx} className="py-2.5 flex-row items-center justify-between">
                                <View className="flex-row items-center flex-1 mr-2">
                                    <MaterialCommunityIcons
                                        name={
                                            dayItem.condition === 'sunny'
                                                ? 'weather-sunny'
                                                : dayItem.condition === 'rainy'
                                                ? 'weather-pouring'
                                                : 'weather-partly-cloudy'
                                        }
                                        size={20}
                                        color={dayItem.condition === 'sunny' ? '#F59E0B' : '#64748B'}
                                        style={{ marginRight: 8 }}
                                    />
                                    <Text className="text-xs font-bold text-foreground">
                                        {dayItem.day}
                                    </Text>
                                </View>

                                <View className="flex-row items-center gap-4">
                                    <Text className="text-xs font-semibold text-muted-foreground">
                                        {dayItem.tempMin}° / {dayItem.tempMax}°C
                                    </Text>
                                    <View className="w-20 items-end">
                                        <Text className="text-xs font-black text-amber-500">
                                            ~{dayItem.estimatedKWh} kWh
                                        </Text>
                                        <Text className="text-[9px] font-bold text-muted-foreground">
                                            {dayItem.solarLevel}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* 4. SMART ENERGY-EFFICIENCY SUGGESTIONS BASED ON FORECAST */}
                <View className="rounded-[28px] border border-border/70 bg-card/85 dark:bg-card/50 p-5 mb-6 shadow-sm">
                    <Text className="text-base font-bold text-foreground mb-1">
                        AI Efficiency Suggestions
                    </Text>
                    <Text className="text-xs text-muted-foreground mb-4">
                        Actionable tips to maximize free solar power based on today's forecast
                    </Text>

                    <View className="gap-3">
                        {suggestions.slice(0, 2).map((sug) => (
                            <View
                                key={sug.id}
                                className="rounded-2xl border border-border/60 bg-secondary/40 p-3.5"
                            >
                                <View className="flex-row items-center justify-between mb-1">
                                    <Text className="text-xs font-bold text-foreground flex-1 mr-2">
                                        {sug.title}
                                    </Text>
                                    {sug.actionableTime && (
                                        <View className="bg-primary/20 px-2 py-0.5 rounded-md">
                                            <Text className="text-[10px] font-bold text-primary">
                                                {sug.actionableTime}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                                <Text className="text-xs text-muted-foreground leading-relaxed mt-1">
                                    {sug.description}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default SolarOwnerPrediction;
