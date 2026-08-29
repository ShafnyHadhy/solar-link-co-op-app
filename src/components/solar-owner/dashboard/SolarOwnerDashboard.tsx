import TabScreenBackground from '@/components/shared/TabScreenBackground';
import { useUser } from '@clerk/expo';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SolarOwnerAlertsModal } from '../alerts/SolarOwnerAlertsModal';
import { SolarToast } from '../shared/SolarToast';
import { useSolarOwnerStore } from '../store/useSolarOwnerStore';
import { ExcessEnergyCard } from './ExcessEnergyCard';
import { QuickShareModal } from './QuickShareModal';
import { SolarMetricDetailModal, SolarMetricDetailType } from './SolarMetricDetailModal';

export const SolarOwnerDashboard = () => {
    const insets = useSafeAreaInsets();
    const { user } = useUser();
    const router = useRouter();
    const { metrics, battery, alerts, weather } = useSolarOwnerStore();

    const [alertsModalOpen, setAlertsModalOpen] = useState(false);
    const [quickShareOpen, setQuickShareOpen] = useState(false);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedMetric, setSelectedMetric] = useState<SolarMetricDetailType>('battery');

    const unreadAlerts = alerts.filter((a) => !a.isRead);
    const mostRecentAlert = unreadAlerts[0] || alerts[0];

    const handleNavigateToShareTab = () => {
        router.push('/(tabs)/share');
    };

    const handleOpenMetricDetail = (metric: SolarMetricDetailType) => {
        setSelectedMetric(metric);
        setDetailModalOpen(true);
    };

    return (
        <View className="flex-1 bg-background">
            <TabScreenBackground />
            <SolarToast />
            <QuickShareModal visible={quickShareOpen} onClose={() => setQuickShareOpen(false)} />
            <SolarOwnerAlertsModal
                visible={alertsModalOpen}
                onClose={() => setAlertsModalOpen(false)}
                onNavigateToShare={handleNavigateToShareTab}
            />
            <SolarMetricDetailModal
                visible={detailModalOpen}
                initialTab={selectedMetric}
                onClose={() => setDetailModalOpen(false)}
            />

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingTop: insets.top > 0 ? insets.top + 10 : 24,
                    paddingBottom: 40,
                }}
            >
                {/* 1. HEADER: Greeting, Weather pill, Notification Icon */}
                <View className="flex-row items-center justify-between mb-6">
                    <View>
                        <View className="flex-row items-center mb-1 flex-wrap gap-1.5">
                            <Text className="text-xs font-semibold uppercase tracking-[1px] text-amber-500">
                                Solar Panel Owner
                            </Text>
                            <View className="flex-row items-center bg-secondary px-2 py-0.5 rounded-full border border-border/60">
                                <Feather name="sun" size={12} color="#F59E0B" style={{ marginRight: 4 }} />
                                <Text className="text-xs font-semibold text-foreground">
                                    {weather.temperatureC}°C • {weather.condition === 'sunny' ? 'Sunny' : 'Clear'}
                                </Text>
                            </View>
                        </View>
                        <Text className="text-2xl font-extrabold text-foreground">
                            Good morning, {user?.firstName || 'Deshan'}
                        </Text>
                        <Text className="text-xs text-muted-foreground mt-0.5">
                            Manage your solar generation & sharing
                        </Text>
                    </View>

                    {/* Notification Bell Icon */}
                    <Pressable
                        onPress={() => setAlertsModalOpen(true)}
                        className="h-10 w-10 items-center justify-center rounded-2xl bg-secondary border border-border/60 relative active:opacity-70"
                    >
                        <Feather name="bell" size={20} color="#F59E0B" />
                        {unreadAlerts.length > 0 && (
                            <View className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 rounded-full bg-destructive items-center justify-center border-2 border-background">
                                <Text className="text-xs font-bold text-white">
                                    {unreadAlerts.length}
                                </Text>
                            </View>
                        )}
                    </Pressable>
                </View>

                {/* 2. RECENT IMPORTANT ALERT PREVIEW (Only 1 banner) */}
                {mostRecentAlert && (
                    <Pressable
                        onPress={() => setAlertsModalOpen(true)}
                        className="flex-row items-center gap-4 p-4 bg-secondary/60 rounded-xl border border-amber-500/40 mb-4 active:opacity-70 shadow-sm"
                    >
                        <View className="h-12 w-12 items-center justify-center rounded-full bg-amber-500/15 border border-amber-500 flex-shrink-0">
                            <Feather name="alert-circle" size={20} color="#F59E0B" />
                        </View>
                        <View className="flex-1 flex-col">
                            <Text className="text-lg font-semibold text-foreground" numberOfLines={1}>
                                {mostRecentAlert.title}
                            </Text>
                            <Text className="text-xs font-semibold text-muted-foreground" numberOfLines={1}>
                                {mostRecentAlert.message}
                            </Text>
                        </View>
                        <Feather name="chevron-right" size={20} color="#9CA3AF" />
                    </Pressable>
                )}

                {/* 3. HERO: AVAILABLE EXCESS ENERGY (Automatic Calculation) */}
                <ExcessEnergyCard onQuickSharePress={() => setQuickShareOpen(true)} />

                {/* 4. FOUR KEY KPI TILES (Generation, Consumption, Battery, Savings) - CLICKABLE */}
                <View className="flex-row flex-wrap justify-between gap-3 mb-6">
                    {/* Solar Generation */}
                    <Pressable
                        onPress={() => handleOpenMetricDetail('generation')}
                        className="w-[48%] flex-col gap-2 rounded-lg border border-border/30 bg-secondary/60 p-4 shadow-sm active:opacity-75"
                    >
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center gap-1.5">
                                <Feather name="sun" size={14} color="#F59E0B" />
                                <Text className="text-sm font-semibold text-muted-foreground" numberOfLines={1}>
                                    Generation
                                </Text>
                            </View>
                            <Feather name="chevron-right" size={12} color="#9CA3AF" />
                        </View>
                        <Text className="text-xl font-extrabold text-foreground mt-1" numberOfLines={1}>
                            {metrics.generationKW.toFixed(1)} kW
                        </Text>
                        <View className="flex-row items-center gap-1">
                            <Feather name="trending-up" size={12} color="#10B981" />
                            <Text className="text-xs font-semibold text-[#10B981]" numberOfLines={1}>
                                {metrics.dailyGenerationKWh.toFixed(1)} kWh today
                            </Text>
                        </View>
                    </Pressable>

                    {/* Household Consumption */}
                    <Pressable
                        onPress={() => handleOpenMetricDetail('consumption')}
                        className="w-[48%] flex-col gap-2 rounded-lg border border-border/30 bg-secondary/60 p-4 shadow-sm active:opacity-75"
                    >
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center gap-1.5">
                                <Feather name="home" size={14} color="#0EA5E9" />
                                <Text className="text-sm font-semibold text-muted-foreground" numberOfLines={1}>
                                    Consumption
                                </Text>
                            </View>
                            <Feather name="chevron-right" size={12} color="#9CA3AF" />
                        </View>
                        <Text className="text-xl font-extrabold text-foreground mt-1" numberOfLines={1}>
                            {metrics.consumptionKW.toFixed(1)} kW
                        </Text>
                        <View className="flex-row items-center gap-1">
                            <Feather name="activity" size={12} color="#0EA5E9" />
                            <Text className="text-xs font-semibold text-[#0EA5E9]" numberOfLines={1}>
                                {metrics.dailyConsumptionKWh.toFixed(1)} kWh today
                            </Text>
                        </View>
                    </Pressable>

                    {/* Battery Status */}
                    <Pressable
                        onPress={() => handleOpenMetricDetail('battery')}
                        className="w-[48%] flex-col gap-2 rounded-lg border border-border/30 bg-secondary/60 p-4 shadow-sm active:opacity-75"
                    >
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center gap-1.5">
                                <Feather name="battery-charging" size={14} color="#10B981" />
                                <Text className="text-sm font-semibold text-muted-foreground" numberOfLines={1}>
                                    Battery
                                </Text>
                            </View>
                            <Feather name="chevron-right" size={12} color="#9CA3AF" />
                        </View>
                        <Text className="text-xl font-extrabold text-foreground mt-1" numberOfLines={1}>
                            {battery.percentage}%
                        </Text>
                        <View className="flex-row items-center gap-1">
                            <Feather name="zap" size={12} color="#10B981" />
                            <Text className="text-xs font-semibold text-[#10B981]" numberOfLines={1}>
                                +{metrics.batteryPowerKW.toFixed(1)} kW chg
                            </Text>
                        </View>
                    </Pressable>

                    {/* Monthly Savings */}
                    <Pressable
                        onPress={() => handleOpenMetricDetail('savings')}
                        className="w-[48%] flex-col gap-2 rounded-lg border border-border/30 bg-secondary/60 p-4 shadow-sm active:opacity-75"
                    >
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center gap-1.5">
                                <Feather name="dollar-sign" size={14} color="#10B981" />
                                <Text className="text-sm font-semibold text-muted-foreground" numberOfLines={1}>
                                    Savings
                                </Text>
                            </View>
                            <Feather name="chevron-right" size={12} color="#9CA3AF" />
                        </View>
                        <Text className="text-xl font-extrabold text-foreground mt-1" numberOfLines={1}>
                            ${metrics.monthlySavingsUSD.toFixed(0)}
                        </Text>
                        <View className="flex-row items-center gap-1">
                            <Feather name="trending-up" size={12} color="#10B981" />
                            <Text className="text-xs font-semibold text-[#10B981]" numberOfLines={1}>
                                +${metrics.dailySavingsUSD.toFixed(2)} today
                            </Text>
                        </View>
                    </Pressable>
                </View>

                {/* Section Header: ENERGY BALANCE */}
                <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-sm font-semibold uppercase tracking-[1px] text-muted-foreground">
                        Today's Energy Balance
                    </Text>
                    <View className="bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                        <Text className="text-xs font-bold text-[#10B981]">
                            Zero Grid Draw
                        </Text>
                    </View>
                </View>

                {/* 5. TODAY'S ENERGY BALANCE CARD */}
                <View className="flex-col gap-3 rounded-xl border border-border/30 bg-secondary/60 p-4 shadow-sm mb-6">
                    <View className="flex-row items-center justify-between">
                        <Text className="text-sm font-semibold text-foreground">
                            100% self-powered from rooftop solar
                        </Text>
                    </View>

                    {/* Visual Balance Bar */}
                    <View className="h-2 w-full rounded-full bg-secondary overflow-hidden border border-border/40 flex-row">
                        <View
                            className="h-full bg-sky-500"
                            style={{
                                width: `${Math.min(100, (metrics.dailyConsumptionKWh / (metrics.dailyGenerationKWh || 1)) * 100)}%`,
                            }}
                        />
                        <View
                            className="h-full bg-purple-500"
                            style={{
                                width: `${Math.min(100, (metrics.dailySharedKWh / (metrics.dailyGenerationKWh || 1)) * 100)}%`,
                            }}
                        />
                        <View className="h-full bg-amber-500 flex-1" />
                    </View>

                    <View className="flex-row items-center justify-between pt-2 border-t border-border/30 gap-1 flex-wrap">
                        <View className="flex-row items-center min-w-[30%] flex-1">
                            <View className="h-2 w-2 rounded-full bg-sky-500 mr-1.5 flex-shrink-0" />
                            <Text className="text-xs font-semibold text-muted-foreground" numberOfLines={1}>
                                Home: {metrics.dailyConsumptionKWh.toFixed(1)} kWh
                            </Text>
                        </View>
                        <View className="flex-row items-center min-w-[30%] flex-1 justify-center">
                            <View className="h-2 w-2 rounded-full bg-purple-500 mr-1.5 flex-shrink-0" />
                            <Text className="text-xs font-semibold text-muted-foreground" numberOfLines={1}>
                                Shared: {metrics.dailySharedKWh.toFixed(1)} kWh
                            </Text>
                        </View>
                        <View className="flex-row items-center min-w-[30%] flex-1 justify-end">
                            <View className="h-2 w-2 rounded-full bg-amber-500 mr-1.5 flex-shrink-0" />
                            <Text className="text-xs font-semibold text-muted-foreground" numberOfLines={1}>
                                Excess: {metrics.dailyExcessKWh.toFixed(1)} kWh
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Section Header: SOLAR FORECAST */}
                <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-sm font-semibold uppercase tracking-[1px] text-muted-foreground">
                        Weather & Solar Prediction
                    </Text>
                    <View className="bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                        <Text className="text-xs font-bold text-[#10B981]">
                            {weather.expectedSolarLevel} Solar
                        </Text>
                    </View>
                </View>

                {/* 6. WEATHER & PREDICTION CARD */}
                <View className="flex-col gap-2 rounded-xl border border-border/30 bg-secondary/60 p-4 shadow-sm mb-6">
                    <View className="flex-row items-center gap-2">
                        <MaterialCommunityIcons name="weather-sunny" size={20} color="#F59E0B" />
                        <Text className="text-sm font-semibold text-foreground">
                            High solar generation expected today
                        </Text>
                    </View>
                    <Text className="text-xs font-semibold text-muted-foreground leading-relaxed">
                        Estimated ~32.5 kWh. Peak sunlight window between 10:30 AM – 3:30 PM (UV {weather.uvIndex}).
                    </Text>
                </View>

                {/* 7. QUICK ACTION: SHARE EXCESS ENERGY BUTTON */}
                <Pressable
                    onPress={handleNavigateToShareTab}
                    className="w-full items-center justify-center rounded-xl bg-primary py-3.5 px-4 shadow-sm active:opacity-75 mb-6"
                >
                    <View className="flex-row items-center justify-center">
                        <Feather name="share-2" size={18} color="#1E293B" style={{ marginRight: 8 }} />
                        <Text className="text-sm font-bold text-primary-foreground text-center">
                            Manage & Share {metrics.dailyExcessKWh.toFixed(1)} kWh Excess Energy
                        </Text>
                    </View>
                </Pressable>
            </ScrollView>
        </View>
    );
};

export default SolarOwnerDashboard;
