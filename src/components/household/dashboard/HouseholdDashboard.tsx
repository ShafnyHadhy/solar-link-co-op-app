import TabScreenBackground from "@/components/shared/TabScreenBackground";
import { useHouseholdEnergyRequests } from "@/hooks/household/useHouseholdEnergyRequests";
import { useUser } from "@clerk/expo";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
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

const HouseholdDashboard = () => {
    const { colorScheme } = useColorScheme();
    const router = useRouter();
    const { user } = useUser();
    const isDark = colorScheme === "dark";

    const { requests, stats, loading, refetch } = useHouseholdEnergyRequests();

    // Theme-based colors
    const theme = {
        background: isDark ? "bg-background" : "bg-gray-50",
        text: isDark ? "text-white" : "text-gray-900",
        textSecondary: isDark ? "text-zinc-300" : "text-gray-600",
        textMuted: isDark ? "text-zinc-400" : "text-gray-500",
        textLight: isDark ? "text-zinc-400" : "text-gray-400",
        card: isDark ? "bg-card/90" : "bg-white",
        cardBorder: isDark ? "border-border/60" : "border-gray-200",
        heroCard: isDark ? "#334155" : "#E5E7EB",
        heroText: isDark ? "text-white" : "text-gray-900",
        heroSubText: isDark ? "text-slate-300" : "text-gray-600",
        statCard: isDark ? "bg-card/90" : "bg-white",
        statBorder: isDark ? "border-border/60" : "border-gray-200",
        quickActionBg: isDark ? "bg-card/90" : "bg-white",
        quickActionBorder: isDark ? "border-border/60" : "border-gray-200",
        activityBg: isDark ? "bg-card/90" : "bg-white",
        activityBorder: isDark ? "border-border/60" : "border-gray-100",
        alertBg: isDark ? "bg-card/90" : "bg-white",
        alertBorder: isDark ? "border-border/60" : "border-gray-200",
    };

    const userName = user?.firstName || user?.fullName?.split(" ")[0] || "Member";

    const availableEnergyKwh = stats
        ? stats.monthlyAllocationKwh + stats.approvedKwh
        : 142;

    const pendingRequestsCount = stats ? stats.pendingRequestsCount : requests.filter((r) => r.status === "pending").length;

    // Navigation handlers
    const handleRequestSolarPower = () => {
        router.push("/(tabs)/energy");
    };

    const handleViewPendingRequests = () => {
        router.push({
            pathname: "/(tabs)/energy",
            params: { tab: "pending" },
        });
    };

    const handleReports = () => {
        router.push("/(tabs)/saving");
    };

    const handleViewMenu = () => {
        router.push("/(tabs)/menu");
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
            <View className="flex-row items-center justify-between mb-8">
                <View>
                    <Text className={`text-4xl font-extrabold tracking-tight ${theme.text}`}>
                        Hello, {userName} 👋
                    </Text>
                    <Text className={`mt-1 text-base ${theme.textSecondary}`}>
                        Welcome back to SolarLink
                    </Text>
                </View>

                <Pressable
                    onPress={handleViewMenu}
                    className={`h-12 w-12 rounded-2xl items-center justify-center border ${theme.cardBorder} ${theme.card} shadow-sm active:opacity-80`}
                >
                    <Feather name="user" size={22} color={isDark ? "#F59E0B" : "#D97706"} />
                </Pressable>
            </View>

            {/* Hero Card - Request Solar Power */}
            <Pressable
                onPress={handleRequestSolarPower}
                className="rounded-3xl p-5 mb-7 bg-primary shadow-md active:opacity-95"
            >
                <View className="flex-row items-center justify-between">
                    <View className="flex-1 pr-3">
                        <View className="self-start px-2.5 py-0.5 rounded-full bg-black/20 mb-2">
                            <Text className="text-[10px] font-black uppercase tracking-wider text-primary-foreground">
                                Microgrid Share
                            </Text>
                        </View>
                        <Text className="text-xl font-extrabold text-primary-foreground">
                            Request Solar Power
                        </Text>
                        <Text className="mt-1 text-xs text-primary-foreground/80 font-medium">
                            Submit a new clean energy allocation request
                        </Text>
                    </View>

                    <View className="h-13 w-13 rounded-2xl bg-black/15 items-center justify-center">
                        <Feather name="plus" size={26} color="#18181B" />
                    </View>
                </View>
            </Pressable>

            {/* Microgrid Attention Card */}
            <View className="flex-row items-center justify-between mb-3">
                <Text className={`text-xl font-bold ${theme.text}`}>Grid Status</Text>
                <View className="flex-row items-center bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                    <View className="h-2 w-2 rounded-full bg-emerald-500 mr-1.5" />
                    <Text className="text-[10px] font-bold text-emerald-500 uppercase">
                        Community Grid Active
                    </Text>
                </View>
            </View>

            <View className={`rounded-3xl overflow-hidden mb-7 ${theme.alertBg} border ${theme.alertBorder} shadow-sm`}>
                <View className={`flex-row items-center p-4 border-b ${isDark ? "border-border/40" : "border-gray-200"}`}>
                    <View className="h-9 w-9 rounded-xl bg-amber-500/15 items-center justify-center mr-3">
                        <Feather name="sun" size={18} color="#F59E0B" />
                    </View>
                    <View className="flex-1">
                        <Text className={`font-semibold text-sm ${theme.text}`}>
                            Peak Solar Generation Window
                        </Text>
                        <Text className="text-xs text-muted-foreground mt-0.5">
                            Substation capacity is high. Great time to request power!
                        </Text>
                    </View>
                </View>

                <View className="flex-row items-center p-4">
                    <View className="h-9 w-9 rounded-xl bg-blue-500/15 items-center justify-center mr-3">
                        <Feather name="shield" size={18} color="#3B82F6" />
                    </View>
                    <View className="flex-1">
                        <Text className={`font-semibold text-sm ${theme.text}`}>
                            Co-Op Protection Active
                        </Text>
                        <Text className="text-xs text-muted-foreground mt-0.5">
                            Subsidized rates apply to all community allocations.
                        </Text>
                    </View>
                </View>
            </View>

            {/* Stats Cards */}
            <View className="flex-row justify-between mb-7 gap-3">
                <View className={`flex-1 rounded-3xl p-5 border ${theme.statBorder} ${theme.statCard} shadow-sm`}>
                    <View className="h-12 w-12 rounded-2xl bg-amber-500/15 items-center justify-center mb-3">
                        <Feather name="zap" size={22} color="#F59E0B" />
                    </View>

                    <Text className={`text-xs font-semibold ${theme.textLight}`}>
                        Available Energy
                    </Text>
                    <View className="flex-row items-baseline mt-1">
                        <Text className={`text-3xl font-black ${theme.text}`}>
                            {availableEnergyKwh}
                        </Text>
                        <Text className={`ml-1 text-xs font-bold text-amber-500`}>kWh</Text>
                    </View>
                    <Text className="text-emerald-500 text-[11px] font-semibold mt-1">
                        Clean Allocation Quota
                    </Text>
                </View>

                <Pressable
                    onPress={handleViewPendingRequests}
                    className={`flex-1 rounded-3xl p-5 border ${theme.statBorder} ${theme.statCard} shadow-sm active:opacity-90`}
                >
                    <View className="h-12 w-12 rounded-2xl bg-sky-500/15 items-center justify-center mb-3">
                        <Feather name="clock" size={22} color="#38BDF8" />
                    </View>

                    <Text className={`text-xs font-semibold ${theme.textLight}`}>
                        Pending Requests
                    </Text>
                    <View className="flex-row items-baseline mt-1">
                        <Text className={`text-3xl font-black ${theme.text}`}>
                            {pendingRequestsCount}
                        </Text>
                        <Text className={`ml-1 text-xs font-bold ${theme.textLight}`}>Active</Text>
                    </View>
                    <Text className="text-amber-500 text-[11px] font-semibold mt-1">
                        {pendingRequestsCount === 1 ? "1 awaiting review" : `${pendingRequestsCount} in queue`}
                    </Text>
                </Pressable>
            </View>

            {/* Quick Actions */}
            <Text className={`text-xl font-bold mb-3 ${theme.text}`}>Quick Actions</Text>

            <View className="flex-row justify-between mb-7 gap-3">
                <Pressable
                    onPress={handleRequestSolarPower}
                    className={`flex-1 rounded-2xl py-4 items-center border ${theme.quickActionBorder} ${theme.quickActionBg} shadow-sm active:scale-95`}
                >
                    <Feather name="plus-circle" size={22} color="#F59E0B" />
                    <Text className={`text-xs font-bold mt-2 ${theme.text}`}>Request</Text>
                </Pressable>

                <Pressable
                    onPress={handleReports}
                    className={`flex-1 rounded-2xl py-4 items-center border ${theme.quickActionBorder} ${theme.quickActionBg} shadow-sm active:scale-95`}
                >
                    <Feather name="file-text" size={22} color="#3B82F6" />
                    <Text className={`text-xs font-bold mt-2 ${theme.text}`}>Savings</Text>
                </Pressable>

                <Pressable
                    onPress={handleViewMenu}
                    className={`flex-1 rounded-2xl py-4 items-center border ${theme.quickActionBorder} ${theme.quickActionBg} shadow-sm active:scale-95`}
                >
                    <Feather name="grid" size={22} color="#10B981" />
                    <Text className={`text-xs font-bold mt-2 ${theme.text}`}>Menu</Text>
                </Pressable>
            </View>

            {/* Recent Activity Header */}
            <View className="flex-row justify-between items-center mb-3">
                <Text className={`text-xl font-bold ${theme.text}`}>Recent Activity</Text>
                <Pressable onPress={() => router.push("/(tabs)/energy")}>
                    <Text className="text-amber-500 font-bold text-xs">View All</Text>
                </Pressable>
            </View>

            {/* Activity List */}
            <View className={`rounded-3xl overflow-hidden border ${theme.activityBorder} ${theme.activityBg} shadow-sm divide-y ${isDark ? "divide-border/40" : "divide-gray-100"}`}>
                {requests.length > 0 ? (
                    requests.slice(0, 3).map((item) => (
                        <Pressable
                            key={item.id}
                            onPress={() => router.push("/(tabs)/energy")}
                            className="flex-row items-center px-4 py-3.5 active:bg-secondary/40"
                        >
                            <View
                                className={`h-10 w-10 rounded-xl items-center justify-center mr-3 ${
                                    item.status === "approved" || item.status === "fulfilled"
                                        ? "bg-emerald-500/15"
                                        : item.status === "rejected"
                                          ? "bg-rose-500/15"
                                          : "bg-amber-500/15"
                                }`}
                            >
                                <Feather
                                    name={
                                        item.status === "approved" || item.status === "fulfilled"
                                            ? "check"
                                            : item.status === "rejected"
                                              ? "x"
                                              : "clock"
                                    }
                                    size={18}
                                    color={
                                        item.status === "approved" || item.status === "fulfilled"
                                            ? "#10B981"
                                            : item.status === "rejected"
                                              ? "#F43F5E"
                                              : "#F59E0B"
                                    }
                                />
                            </View>

                            <View className="flex-1">
                                <Text className={`font-bold text-sm ${theme.text}`}>
                                    Energy Request ({parseFloat(item.requestedEnergyKwh).toFixed(1)} kWh)
                                </Text>
                                <Text className={`text-xs ${theme.textLight}`} numberOfLines={1}>
                                    {item.reason || "Household Energy Request"}
                                </Text>
                            </View>

                            <View className="items-end ml-2">
                                <Text
                                    className={`text-[10px] font-black uppercase ${
                                        item.status === "approved" || item.status === "fulfilled"
                                            ? "text-emerald-500"
                                            : item.status === "rejected"
                                              ? "text-rose-500"
                                              : "text-amber-500"
                                    }`}
                                >
                                    {item.status}
                                </Text>
                            </View>
                        </Pressable>
                    ))
                ) : (
                    <View className="p-6 items-center">
                        <Feather name="activity" size={24} color="#9CA3AF" />
                        <Text className="text-sm font-semibold text-muted-foreground mt-2">
                            No recent activity yet
                        </Text>
                    </View>
                )}
            </View>
        </ScrollView>
    );
};

export default HouseholdDashboard;