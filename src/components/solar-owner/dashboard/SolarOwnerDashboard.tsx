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
import { BatteryCard } from './BatteryCard';
import { ExcessEnergyCard } from './ExcessEnergyCard';
import { PowerFlowDiagram } from './PowerFlowDiagram';
import { QuickShareModal } from './QuickShareModal';

export const SolarOwnerDashboard = () => {
    const insets = useSafeAreaInsets();
    const { user } = useUser();
    const router = useRouter();
    const { metrics, battery, alerts, weather } = useSolarOwnerStore();

    const [alertsModalOpen, setAlertsModalOpen] = useState(false);
    const [quickShareOpen, setQuickShareOpen] = useState(false);

    const unreadAlerts = alerts.filter((a) => !a.isRead);
    const mostRecentAlert = unreadAlerts[0] || alerts[0];

    const handleNavigateToShareTab = () => {
        router.push('/(tabs)/share');
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
                <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-1 mr-3">
                        <View className="flex-row items-center mb-0.5">
                            <Text className="text-xs font-bold uppercase tracking-wider text-amber-500 mr-2">
                                Solar Panel Owner
                            </Text>
                            <View className="flex-row items-center bg-secondary/80 px-2 py-0.5 rounded-full border border-border/50">
                                <Feather name="sun" size={10} color="#F59E0B" style={{ marginRight: 4 }} />
                                <Text className="text-[10px] font-bold text-foreground">
                                    {weather.temperatureC}°C • {weather.condition === 'sunny' ? 'Sunny' : 'Clear'}
                                </Text>
                            </View>
                        </View>
                        <Text className="text-2xl font-black text-foreground tracking-tight">
                            Hi, {user?.firstName || 'Deshan'} 👋
                        </Text>
                    </View>

                    {/* Notification Bell Icon */}
                    <Pressable
                        onPress={() => setAlertsModalOpen(true)}
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

                {/* 2. RECENT IMPORTANT ALERT PREVIEW (Only 1 banner) */}
                {mostRecentAlert && (
                    <Pressable
                        onPress={() => setAlertsModalOpen(true)}
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
                    {/* Solar Generation */}
                    <View className="w-[48%] rounded-[24px] border border-amber-500/30 bg-card/85 p-4 shadow-sm">
                        <View className="flex-row items-center justify-between mb-1.5">
                            <Text className="text-[11px] font-bold text-muted-foreground uppercase">
                                Generation
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

                    {/* Household Consumption */}
                    <View className="w-[48%] rounded-[24px] border border-sky-500/30 bg-card/85 p-4 shadow-sm">
                        <View className="flex-row items-center justify-between mb-1.5">
                            <Text className="text-[11px] font-bold text-muted-foreground uppercase">
                                Consumption
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

                    {/* Battery Status */}
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

                    {/* Monthly Savings */}
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

                {/* 5. TODAY'S ENERGY BALANCE: Generation - Consumption = Excess */}
                <View className="rounded-[28px] border border-border/70 bg-card/85 dark:bg-card/50 p-5 mb-5 shadow-sm">
                    <View className="flex-row items-center justify-between mb-2">
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

                    {/* Visual Balance Bar */}
                    <View className="h-3.5 w-full rounded-full bg-secondary/80 flex-row overflow-hidden my-2.5">
                        <View
                            className="h-full bg-sky-500"
                            style={{
                                width: `${(metrics.dailyConsumptionKWh / metrics.dailyGenerationKWh) * 100}%`,
                            }}
                        />
                        <View
                            className="h-full bg-purple-500"
                            style={{
                                width: `${(metrics.dailySharedKWh / metrics.dailyGenerationKWh) * 100}%`,
                            }}
                        />
                        <View className="h-full bg-amber-500 flex-1" />
                    </View>

                    <View className="flex-row items-center justify-between pt-2 border-t border-border/30">
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

                {/* 6. WEATHER & TODAY'S PREDICTED SOLAR GENERATION SUMMARY */}
                <View className="rounded-[28px] border border-border/70 bg-card/85 dark:bg-card/50 p-5 mb-5 shadow-sm">
                    <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-row items-center">
                            <MaterialCommunityIcons name="weather-sunny" size={22} color="#F59E0B" style={{ marginRight: 8 }} />
                            <Text className="text-base font-bold text-foreground">
                                Weather & Solar Prediction
                            </Text>
                        </View>
                        <View className="bg-emerald-500/20 px-2.5 py-0.5 rounded-full">
                            <Text className="text-[10px] font-black text-emerald-500 uppercase">
                                {weather.expectedSolarLevel} Solar
                            </Text>
                        </View>
                    </View>
                    <Text className="text-xs text-muted-foreground leading-relaxed">
                        ☀️ <Text className="font-bold text-foreground">High solar generation expected today</Text> (~32.5 kWh estimated). Peak sunlight window between 10:30 AM – 3:30 PM (UV {weather.uvIndex}).
                    </Text>
                </View>

                {/* 7. LIVE POWER FLOW DIAGRAM */}
                <PowerFlowDiagram />

                {/* 8. BATTERY STATUS CARD */}
                <BatteryCard />

                {/* 9. QUICK ACTION: SHARE EXCESS ENERGY BUTTON */}
                <Pressable
                    onPress={handleNavigateToShareTab}
                    className="w-full rounded-2xl bg-primary py-4 items-center justify-center shadow-lg active:opacity-90 active:scale-98 mb-6"
                >
                    <View className="flex-row items-center">
                        <Feather name="share-2" size={18} color="#1E293B" style={{ marginRight: 8 }} />
                        <Text className="text-base font-black text-primary-foreground">
                            Go to Share Tab (Manage {metrics.dailyExcessKWh.toFixed(1)} kWh Excess)
                        </Text>
                    </View>
                </Pressable>
            </ScrollView>
        </View>
    );
};

export default SolarOwnerDashboard;
