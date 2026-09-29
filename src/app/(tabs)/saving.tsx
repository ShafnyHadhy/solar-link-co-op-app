import TabScreenBackground from "@/components/shared/TabScreenBackground";
import { useHouseholdEnergyRequests } from "@/hooks/household/useHouseholdEnergyRequests";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    View,
} from "react-native";

const SavingsDashboard = () => {
    const { colorScheme } = useColorScheme();
    const router = useRouter();
    const isDark = colorScheme === "dark";

    const { stats, requests, loading, refetch } = useHouseholdEnergyRequests();

    // Theme-based colors
    const theme = {
        background: isDark ? "bg-background" : "bg-gray-50",
        text: isDark ? "text-white" : "text-gray-900",
        textSecondary: isDark ? "text-zinc-300" : "text-gray-600",
        textMuted: isDark ? "text-zinc-400" : "text-gray-500",
        card: isDark ? "bg-card/90" : "bg-white",
        cardBorder: isDark ? "border-border/60" : "border-gray-200",
        cardBg: isDark ? "bg-secondary/40" : "bg-gray-100",
        submitBg: isDark ? "#334155" : "#E5E7EB",
        submitText: isDark ? "text-white" : "text-gray-900",
        gridBg: isDark ? "bg-red-500/15" : "bg-red-100",
        gridText: isDark ? "text-red-400" : "text-red-600",
        solarBg: isDark ? "bg-yellow-500/15" : "bg-yellow-100",
        solarText: isDark ? "text-yellow-400" : "text-yellow-600",
        savedBg: isDark ? "bg-green-500/15" : "bg-green-100",
        savedText: isDark ? "text-green-400" : "text-green-600",
    };

    // Calculate or fallback
    const monthlySavings = stats ? stats.monthlySavingsLKR : 7850;
    const lifetimeSavings = stats ? stats.lifetimeSavingsLKR : 42500;
    const renewableKwh = stats ? stats.cleanEnergyUsedKwh : 84;
    const gridCost = stats ? stats.gridCostLKR : 12500;
    const solarCost = stats ? stats.solarCostLKR : 6650;
    const co2Saved = stats ? stats.co2SavedKg : 125;

    // Navigation handlers
    const handleViewDetails = () => {
        router.push("/(tabs)/energy");
    };

    const handleRenewableEnergy = () => {
        router.push("/(tabs)/energy");
    };

    return (
        <ScrollView
            className={`flex-1 ${theme.background}`}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={loading}
                    onRefresh={refetch}
                    tintColor={isDark ? "#F59E0B" : "#D97706"}
                />
            }
            contentContainerStyle={{
                paddingHorizontal: 20,
                paddingTop: 55,
                paddingBottom: 120,
            }}
        >
            <TabScreenBackground />

            {/* Header */}
            <View className="mb-8">
                <Text className={`text-4xl font-extrabold tracking-tight ${theme.text}`}>
                    Savings
                </Text>
                <Text className={`mt-1 text-base ${theme.textSecondary}`}>
                    Monitor your household energy savings & environmental impact
                </Text>
            </View>

            {/* Monthly Savings Summary Card */}
            <Pressable
                onPress={handleViewDetails}
                className={`rounded-3xl p-5 mb-6 border ${theme.cardBorder} ${theme.card} shadow-sm active:opacity-90`}
            >
                <View className="flex-row items-center">
                    <View className="h-16 w-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 items-center justify-center">
                        <Feather name="dollar-sign" size={28} color="#F59E0B" />
                    </View>

                    <View className="ml-4 flex-1">
                        <Text className={`text-xs font-semibold uppercase tracking-wider ${theme.textMuted}`}>
                            Monthly Savings
                        </Text>
                        <Text className={`text-3xl font-black mt-0.5 ${theme.text}`}>
                            Rs. {monthlySavings.toLocaleString()}
                        </Text>
                        <View className="flex-row items-center mt-1.5">
                            <Feather name="trending-up" size={14} color="#22C55E" />
                            <Text className="text-emerald-500 ml-1 text-xs font-bold">
                                +18% vs Grid Only
                            </Text>
                        </View>
                    </View>

                    <Feather name="chevron-right" size={20} color={isDark ? "#9CA3AF" : "#6B7280"} />
                </View>
            </Pressable>

            {/* Stats Row: Lifetime Savings & Renewable Energy */}
            <View className="flex-row justify-between mb-6 gap-3">
                {/* Lifetime Savings */}
                <View className={`flex-1 rounded-3xl p-5 border ${theme.cardBorder} ${theme.card} shadow-sm`}>
                    <View className="h-12 w-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 items-center justify-center mb-3">
                        <Feather name="bar-chart-2" size={20} color="#10B981" />
                    </View>
                    <Text className={`text-xs font-semibold ${theme.textMuted}`}>
                        Lifetime Savings
                    </Text>
                    <Text className={`text-2xl font-black mt-1 ${theme.text}`}>
                        Rs. {lifetimeSavings.toLocaleString()}
                    </Text>
                </View>

                {/* Renewable Clean Energy Used */}
                <Pressable
                    onPress={handleRenewableEnergy}
                    className={`flex-1 rounded-3xl p-5 border ${theme.cardBorder} ${theme.card} shadow-sm active:opacity-90`}
                >
                    <View className="h-12 w-12 rounded-2xl bg-sky-500/15 border border-sky-500/30 items-center justify-center mb-3">
                        <Feather name="zap" size={20} color="#38BDF8" />
                    </View>
                    <Text className={`text-xs font-semibold ${theme.textMuted}`}>
                        Clean Energy
                    </Text>
                    <Text className={`text-2xl font-black mt-1 ${theme.text}`}>
                        {renewableKwh} kWh
                    </Text>
                </Pressable>
            </View>

            {/* Electricity Cost Comparison */}
            <View className={`rounded-3xl p-5 mb-6 border ${theme.cardBorder} ${theme.card} shadow-sm`}>
                <Text className={`text-xl font-bold mb-4 ${theme.text}`}>
                    Electricity Cost Comparison
                </Text>

                <View className={`rounded-2xl overflow-hidden ${theme.cardBg} border border-border/40`}>
                    {/* Grid Cost */}
                    <View className="flex-row items-center justify-between p-4 border-b border-border/40">
                        <View className="flex-row items-center">
                            <View className={`h-10 w-10 rounded-xl ${theme.gridBg} items-center justify-center`}>
                                <Feather name="activity" size={16} color={isDark ? "#F87171" : "#DC2626"} />
                            </View>
                            <View className="ml-3">
                                <Text className={`text-sm font-bold ${theme.text}`}>
                                    Grid Tariff (Fallback)
                                </Text>
                                <Text className="text-[11px] text-muted-foreground">Standard Ceylon Grid rate</Text>
                            </View>
                        </View>
                        <Text className={`font-black text-sm ${theme.gridText}`}>
                            Rs. {gridCost.toLocaleString()}
                        </Text>
                    </View>

                    {/* Solar Co-Op Cost */}
                    <View className="flex-row items-center justify-between p-4 border-b border-border/40">
                        <View className="flex-row items-center">
                            <View className={`h-10 w-10 rounded-xl ${theme.solarBg} items-center justify-center`}>
                                <Feather name="sun" size={16} color={isDark ? "#FBBF24" : "#D97706"} />
                            </View>
                            <View className="ml-3">
                                <Text className={`text-sm font-bold ${theme.text}`}>
                                    Solar Co-Op Cost
                                </Text>
                                <Text className="text-[11px] text-muted-foreground">Subsidized clean power</Text>
                            </View>
                        </View>
                        <Text className={`font-black text-sm ${theme.solarText}`}>
                            Rs. {solarCost.toLocaleString()}
                        </Text>
                    </View>

                    {/* Saved Amount */}
                    <View className="flex-row items-center justify-between p-4">
                        <View className="flex-row items-center">
                            <View className={`h-10 w-10 rounded-xl ${theme.savedBg} items-center justify-center`}>
                                <Feather name="check-circle" size={16} color={isDark ? "#22C55E" : "#16A34A"} />
                            </View>
                            <View className="ml-3">
                                <Text className={`text-sm font-bold ${theme.text}`}>
                                    Net Money Saved
                                </Text>
                                <Text className="text-[11px] text-muted-foreground">Retained in your wallet</Text>
                            </View>
                        </View>
                        <Text className={`font-black text-base ${theme.savedText}`}>
                            Rs. {monthlySavings.toLocaleString()}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Environmental Impact */}
            <View className={`rounded-3xl p-5 border ${theme.cardBorder} ${theme.card} shadow-sm`}>
                <Text className={`text-xl font-bold mb-4 ${theme.text}`}>
                    Environmental Impact
                </Text>

                {/* CO2 Saved */}
                <View className="flex-row justify-between items-center mb-3 py-2 border-b border-border/40">
                    <View className="flex-row items-center">
                        <View className="h-9 w-9 rounded-xl bg-emerald-500/15 items-center justify-center mr-3">
                            <Feather name="wind" size={18} color="#10B981" />
                        </View>
                        <View>
                            <Text className={`text-sm font-bold ${theme.text}`}>CO₂ Emissions Avoided</Text>
                            <Text className="text-xs text-muted-foreground">Clean solar generation offset</Text>
                        </View>
                    </View>
                    <Text className={`font-black text-lg text-emerald-500`}>
                        {co2Saved} kg
                    </Text>
                </View>

                {/* Renewable Energy Used */}
                <View className="flex-row justify-between items-center mb-5 py-2">
                    <View className="flex-row items-center">
                        <View className="h-9 w-9 rounded-xl bg-sky-500/15 items-center justify-center mr-3">
                            <Feather name="zap" size={18} color="#38BDF8" />
                        </View>
                        <View>
                            <Text className={`text-sm font-bold ${theme.text}`}>Renewable Energy Consumed</Text>
                            <Text className="text-xs text-muted-foreground">From community rooftop arrays</Text>
                        </View>
                    </View>
                    <Text className={`font-black text-lg text-sky-500`}>
                        {renewableKwh} kWh
                    </Text>
                </View>

                {/* View Details Button */}
                <Pressable
                    onPress={handleViewDetails}
                    className="rounded-2xl py-3.5 items-center bg-secondary border border-border/60 active:opacity-80"
                >
                    <Text className={`font-bold text-sm ${theme.text}`}>
                        Request More Energy
                    </Text>
                </Pressable>
            </View>
        </ScrollView>
    );
};

export default SavingsDashboard;