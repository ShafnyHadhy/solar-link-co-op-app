import TabScreenBackground from '@/components/shared/TabScreenBackground';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SolarToast } from '../shared/SolarToast';
import { ViewHeader } from '../shared/ViewHeader';
import { useSolarOwnerStore } from '../store/useSolarOwnerStore';

export const SolarOwnerReports = () => {
    const { metrics, monthlyReports, showToast } = useSolarOwnerStore();
    const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(0);

    const activeReport = monthlyReports[selectedMonthIndex] || monthlyReports[0];

    const handleExport = () => {
        showToast('Monthly statement exported (PDF/CSV ready in Downloads)', 'success');
    };

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
                    title="Reports & Savings"
                    subtitle="Financial savings, energy history & eco impact"
                    showBack={true}
                    rightAction={{
                        icon: 'download',
                        onPress: handleExport,
                    }}
                />

                {/* Month Selector Pills */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mb-5 -mx-5 px-5"
                >
                    <View className="flex-row gap-2">
                        {monthlyReports.map((rep, idx) => (
                            <Pressable
                                key={rep.month}
                                onPress={() => setSelectedMonthIndex(idx)}
                                className={`px-4 py-2 rounded-2xl border ${
                                    selectedMonthIndex === idx
                                        ? 'bg-primary border-primary'
                                        : 'bg-card/90 border-border/70'
                                }`}
                            >
                                <Text
                                    className={`text-xs font-bold ${
                                        selectedMonthIndex === idx
                                            ? 'text-primary-foreground'
                                            : 'text-foreground'
                                    }`}
                                >
                                    {rep.month}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </ScrollView>

                {/* 1. TOTAL MONTHLY SAVINGS HERO CARD */}
                <View className="rounded-[28px] border-2 border-emerald-500/40 bg-card/90 dark:bg-card/60 p-5 mb-5 shadow-lg relative overflow-hidden">
                    <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-row items-center">
                            <View className="h-8 w-8 rounded-xl bg-emerald-500/20 items-center justify-center mr-2">
                                <Feather name="dollar-sign" size={18} color="#10B981" />
                            </View>
                            <Text className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                                Total Savings ({activeReport.month})
                            </Text>
                        </View>
                        <Text className="text-[10px] font-bold text-muted-foreground uppercase">
                            Net Benefit
                        </Text>
                    </View>

                    <View className="flex-row items-baseline my-2">
                        <Text className="text-4xl font-black text-foreground">
                            ${activeReport.totalSavingsUSD.toFixed(2)}
                        </Text>
                        <Text className="text-xs font-bold text-emerald-500 ml-2">
                            Saved this month
                        </Text>
                    </View>

                    {/* Breakdown of Savings */}
                    <View className="mt-3 pt-3 border-t border-border/50 divide-y divide-border/30">
                        <View className="flex-row justify-between py-1.5">
                            <Text className="text-xs text-muted-foreground">
                                Direct Solar Self-Consumption
                            </Text>
                            <Text className="text-xs font-bold text-foreground">
                                +${activeReport.directSolarSavingsUSD.toFixed(2)}
                            </Text>
                        </View>
                        <View className="flex-row justify-between py-1.5">
                            <Text className="text-xs text-muted-foreground">
                                Community Sharing Revenue
                            </Text>
                            <Text className="text-xs font-bold text-emerald-500">
                                +${activeReport.communitySharingRevenueUSD.toFixed(2)}
                            </Text>
                        </View>
                        <View className="flex-row justify-between py-1.5">
                            <Text className="text-xs text-muted-foreground">
                                Grid Peak Charge Avoidance
                            </Text>
                            <Text className="text-xs font-bold text-foreground">
                                +${activeReport.gridAvoidanceSavingsUSD.toFixed(2)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* 2. ENERGY GENERATION & SHARING TOTALS */}
                <View className="rounded-[28px] border border-border/70 bg-card/85 dark:bg-card/50 p-5 mb-5 shadow-sm">
                    <Text className="text-base font-bold text-foreground mb-4">
                        Monthly Energy Summary
                    </Text>

                    <View className="flex-row flex-wrap justify-between gap-3">
                        <View className="w-[48%] rounded-2xl bg-secondary/50 p-3 border border-border/60">
                            <Text className="text-[10px] font-bold uppercase text-muted-foreground">
                                Solar Generated
                            </Text>
                            <Text className="text-xl font-black text-amber-500 mt-0.5">
                                {activeReport.totalGeneratedKWh} kWh
                            </Text>
                        </View>

                        <View className="w-[48%] rounded-2xl bg-secondary/50 p-3 border border-border/60">
                            <Text className="text-[10px] font-bold uppercase text-muted-foreground">
                                Home Consumed
                            </Text>
                            <Text className="text-xl font-black text-sky-500 mt-0.5">
                                {activeReport.totalConsumedKWh} kWh
                            </Text>
                        </View>

                        <View className="w-[48%] rounded-2xl bg-secondary/50 p-3 border border-border/60">
                            <Text className="text-[10px] font-bold uppercase text-muted-foreground">
                                Shared to Co-Op
                            </Text>
                            <Text className="text-xl font-black text-emerald-500 mt-0.5">
                                {activeReport.totalSharedKWh} kWh
                            </Text>
                        </View>

                        <View className="w-[48%] rounded-2xl bg-secondary/50 p-3 border border-border/60">
                            <Text className="text-[10px] font-bold uppercase text-muted-foreground">
                                Grid Draw
                            </Text>
                            <Text className="text-xl font-black text-muted-foreground mt-0.5">
                                {activeReport.gridDrawKWh} kWh
                            </Text>
                        </View>
                    </View>
                </View>

                {/* 3. COMMUNITY CONTRIBUTION & ECO IMPACT */}
                <View className="rounded-[28px] border border-border/70 bg-card/85 dark:bg-card/50 p-5 mb-5 shadow-sm">
                    <Text className="text-base font-bold text-foreground mb-1">
                        Community & Ecological Impact
                    </Text>
                    <Text className="text-xs text-muted-foreground mb-4">
                        Your clean energy contribution to Colombo South Co-Op
                    </Text>

                    <View className="flex-row items-center justify-between gap-2">
                        <View className="flex-1 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-3 items-center">
                            <MaterialCommunityIcons name="molecule-co2" size={24} color="#10B981" />
                            <Text className="text-sm font-black text-foreground mt-1">
                                {activeReport.co2EmissionsAvoidedKg} kg
                            </Text>
                            <Text className="text-[9px] text-muted-foreground text-center">
                                CO2 Avoided
                            </Text>
                        </View>

                        <View className="flex-1 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-3 items-center">
                            <MaterialCommunityIcons name="tree" size={24} color="#10B981" />
                            <Text className="text-sm font-black text-foreground mt-1">
                                {activeReport.treesPlantedEquivalent}
                            </Text>
                            <Text className="text-[9px] text-muted-foreground text-center">
                                Trees Planted Eq.
                            </Text>
                        </View>

                        <View className="flex-1 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-3 items-center">
                            <MaterialCommunityIcons name="home-group" size={24} color="#10B981" />
                            <Text className="text-sm font-black text-foreground mt-1">
                                {activeReport.homesPoweredEquivalent} Homes
                            </Text>
                            <Text className="text-[9px] text-muted-foreground text-center">
                                Powered for a Day
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Export Button */}
                <Pressable
                    onPress={handleExport}
                    className="w-full rounded-2xl bg-primary py-4 items-center justify-center shadow-md active:opacity-90 mb-6"
                >
                    <View className="flex-row items-center">
                        <Feather name="download" size={18} color="#1E293B" style={{ marginRight: 8 }} />
                        <Text className="text-base font-black text-primary-foreground">
                            Download Monthly Report Statement
                        </Text>
                    </View>
                </Pressable>
            </ScrollView>
        </View>
    );
};

export default SolarOwnerReports;
