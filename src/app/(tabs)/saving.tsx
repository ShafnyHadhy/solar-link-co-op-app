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

  const {
    stats,
    loading: isLoadingStats,
    refetch,
  } = useHouseholdEnergyRequests();

  const isRefreshing = isLoadingStats;

  const onRefresh = () => {
    refetch();
  };

  // Theme
  const bg = isDark ? "bg-background" : "bg-gray-50";
  const text = isDark ? "text-white" : "text-gray-900";
  const textMuted = isDark ? "text-zinc-400" : "text-gray-500";
  const textSecondary = isDark ? "text-zinc-300" : "text-gray-600";
  const card = isDark
    ? "bg-black/30 border-white/10"
    : "bg-white border-gray-200";
  const innerBg = isDark ? "bg-white/5" : "bg-gray-50";

  const monthlySavings = stats?.monthlySavingsLKR ?? 0;
  const lifetimeSavings = stats?.lifetimeSavingsLKR ?? 0;
  const cleanEnergyKwh = stats?.cleanEnergyUsedKwh ?? 0;
  const gridFallbackKwh = stats?.gridFallbackUsedKwh ?? 76;
  const cleanShare = stats?.cleanEnergySharePercent ?? 53;
  const gridShare = stats?.gridFallbackSharePercent ?? 47;
  const gridCost = stats?.gridCostLKR ?? 0;
  const solarCost = stats?.solarCostLKR ?? 0;
  const co2Saved = stats?.co2SavedKg ?? 0;
  const savedAmount = gridCost - solarCost;
  const allocation = stats?.monthlyAllocationKwh ?? 0;
  const approvedKwh = stats?.approvedKwh ?? 0;

  return (
    <ScrollView
      className={`flex-1 ${bg}`}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 55,
        paddingBottom: 120,
      }}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={isDark ? "#FBBF24" : "#D97706"}
        />
      }
    >
      <TabScreenBackground />

      {/* Header */}
      <View className="mb-6">
        <Text className={`text-4xl font-bold ${text}`}>Savings</Text>
        <Text className={`mt-1 text-base ${textSecondary}`}>
          Your solar energy savings dashboard
        </Text>
      </View>

      {/* Loading state */}
      {isLoadingStats && !stats && (
        <View className="items-center py-16">
          <ActivityIndicator
            size="large"
            color={isDark ? "#FBBF24" : "#D97706"}
          />
          <Text className={`mt-3 text-sm ${textMuted}`}>
            Loading your savings data…
          </Text>
        </View>
      )}

      {/* Content — visible once stats load */}
      {stats && (
        <>
          {/* Monthly Savings Hero */}
          <Pressable
            onPress={() => router.push("/(tabs)/energy")}
            className={`rounded-3xl p-5 mb-5 border ${card}`}
          >
            <View className="flex-row items-center">
              <View className="h-16 w-16 rounded-2xl bg-yellow-500/10 items-center justify-center">
                <Feather name="dollar-sign" size={28} color="#FBBF24" />
              </View>

              <View className="ml-4 flex-1">
                <Text className={`text-sm ${textMuted}`}>Monthly Savings</Text>
                <Text className={`text-4xl font-bold mt-1 ${text}`}>
                  Rs. {monthlySavings.toLocaleString()}
                </Text>
                <View className="flex-row items-center mt-1.5">
                  <Feather name="trending-up" size={13} color="#22C55E" />
                  <Text className="text-green-400 ml-1 text-xs font-medium">
                    vs. full grid usage
                  </Text>
                </View>
              </View>

              <Feather
                name="chevron-right"
                size={20}
                color={isDark ? "#9CA3AF" : "#6B7280"}
              />
            </View>
          </Pressable>

          {/* Stats row */}
          <View className="flex-row justify-between mb-5">
            {/* Lifetime Savings */}
            <View className={`w-[48%] rounded-3xl p-5 border ${card}`}>
              <View className="h-12 w-12 rounded-xl bg-green-500/10 items-center justify-center mb-3">
                <Feather name="bar-chart-2" size={20} color="#22C55E" />
              </View>
              <Text className={`text-xs ${textMuted}`}>Lifetime Savings</Text>
              <Text className={`text-2xl font-bold mt-1.5 ${text}`}>
                Rs. {lifetimeSavings.toLocaleString()}
              </Text>
            </View>

            {/* Clean Energy Used */}
            <View className={`w-[48%] rounded-3xl p-5 border ${card}`}>
              <View className="h-12 w-12 rounded-xl bg-blue-500/10 items-center justify-center mb-3">
                <Feather name="zap" size={20} color="#60A5FA" />
              </View>
              <Text className={`text-xs ${textMuted}`}>Clean Energy Used</Text>
              <Text className={`text-2xl font-bold mt-1.5 ${text}`}>
                {cleanEnergyKwh} kWh
              </Text>
            </View>
          </View>

          {/* Allocation usage row */}
          <View className={`rounded-3xl p-5 mb-5 border ${card}`}>
            <Text className={`text-base font-bold mb-4 ${text}`}>
              Monthly Allocation
            </Text>

            {/* Progress bar */}
            <View className="flex-row items-center mb-2">
              <Text className={`text-xs w-24 ${textMuted}`}>Used</Text>
              <View
                className={`flex-1 h-3 rounded-full overflow-hidden ${isDark ? "bg-white/10" : "bg-gray-100"}`}
              >
                <View
                  style={{
                    width:
                      allocation > 0
                        ? `${Math.min((approvedKwh / allocation) * 100, 100)}%`
                        : "0%",
                  }}
                  className="h-full rounded-full bg-yellow-400"
                />
              </View>
              <Text className={`text-xs w-20 text-right ${text}`}>
                {approvedKwh.toFixed(1)} / {allocation} kWh
              </Text>
            </View>

            <View className="flex-row justify-between mt-1">
              <Text className={`text-xs ${textMuted}`}>
                Remaining: {Math.max(allocation - approvedKwh, 0).toFixed(1)}{" "}
                kWh
              </Text>
              <Text className="text-xs font-semibold text-yellow-400">
                {allocation > 0
                  ? `${Math.min(Math.round((approvedKwh / allocation) * 100), 100)}% used`
                  : "—"}
              </Text>
            </View>
          </View>

          {/* Energy Source Mix & Grid Fallback */}
          <View className={`rounded-3xl p-5 mb-5 border ${card}`}>
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text className={`text-base font-bold ${text}`}>
                  Energy Source Mix
                </Text>
                <Text className={`text-xs mt-0.5 ${textMuted}`}>
                  Clean solar vs. utility grid fallback
                </Text>
              </View>
              <View
                className={`px-2.5 py-1 rounded-full ${isDark ? "bg-emerald-500/15" : "bg-emerald-50"}`}
              >
                <Text className="text-xs font-semibold text-emerald-400">
                  {cleanShare}% Clean
                </Text>
              </View>
            </View>

            {/* Split progress bar */}
            <View
              className={`h-3.5 rounded-full overflow-hidden flex-row mb-3.5 ${isDark ? "bg-white/10" : "bg-gray-100"}`}
            >
              <View
                style={{ width: `${cleanShare}%` }}
                className="h-full bg-emerald-400"
              />
              <View
                style={{ width: `${gridShare}%` }}
                className="h-full bg-red-400/80"
              />
            </View>

            {/* Two source cards */}
            <View className="flex-row justify-between mb-2">
              {/* Clean Solar */}
              <View className={`w-[48%] rounded-2xl p-3.5 ${innerBg}`}>
                <View className="flex-row items-center mb-1.5">
                  <View className="h-7 w-7 rounded-lg bg-emerald-500/15 items-center justify-center mr-2">
                    <Feather name="sun" size={14} color="#34D399" />
                  </View>
                  <Text className={`text-xs font-medium ${textSecondary}`}>
                    Clean Solar
                  </Text>
                </View>
                <Text className={`text-xl font-bold ${text}`}>
                  {cleanEnergyKwh}{" "}
                  <Text className={`text-xs font-normal ${textMuted}`}>
                    kWh
                  </Text>
                </Text>
                <Text className="text-[11px] text-emerald-400 font-medium mt-1">
                  Rs. 18.5/kWh rate
                </Text>
              </View>

              {/* Grid Fallback */}
              <View className={`w-[48%] rounded-2xl p-3.5 ${innerBg}`}>
                <View className="flex-row items-center mb-1.5">
                  <View className="h-7 w-7 rounded-lg bg-red-500/15 items-center justify-center mr-2">
                    <Feather name="activity" size={14} color="#F87171" />
                  </View>
                  <Text className={`text-xs font-medium ${textSecondary}`}>
                    Grid Fallback
                  </Text>
                </View>
                <Text className={`text-xl font-bold ${text}`}>
                  {gridFallbackKwh}{" "}
                  <Text className={`text-xs font-normal ${textMuted}`}>
                    kWh
                  </Text>
                </Text>
                <Text className="text-[11px] text-red-400 font-medium mt-1">
                  Rs. 38.0/kWh rate
                </Text>
              </View>
            </View>

            <Text className={`text-[11px] ${textMuted} mt-1`}>
              Grid fallback guarantees 24/7 reliability when solar generation is
              insufficient.
            </Text>
          </View>

          {/* Electricity Cost Comparison */}
          <View className={`rounded-3xl p-5 mb-5 border ${card}`}>
            <Text className={`text-base font-bold mb-4 ${text}`}>
              Electricity Cost Comparison
            </Text>

            <View className={`rounded-2xl overflow-hidden ${innerBg}`}>
              {/* Grid */}
              <View
                className={`flex-row items-center justify-between p-4 border-b ${isDark ? "border-white/8" : "border-gray-100"}`}
              >
                <View className="flex-row items-center">
                  <View
                    className={`h-10 w-10 rounded-full items-center justify-center ${isDark ? "bg-red-500/15" : "bg-red-50"}`}
                  >
                    <Feather
                      name="activity"
                      size={16}
                      color={isDark ? "#F87171" : "#DC2626"}
                    />
                  </View>
                  <View className="ml-3">
                    <Text className={`text-sm font-medium ${text}`}>
                      Grid (if no solar)
                    </Text>
                    <Text className={`text-xs ${textMuted}`}>
                      Rs. 38/kWh rate
                    </Text>
                  </View>
                </View>
                <Text
                  className={`font-bold text-base ${isDark ? "text-red-300" : "text-red-600"}`}
                >
                  Rs. {gridCost.toLocaleString()}
                </Text>
              </View>

              {/* Solar */}
              <View
                className={`flex-row items-center justify-between p-4 border-b ${isDark ? "border-white/8" : "border-gray-100"}`}
              >
                <View className="flex-row items-center">
                  <View
                    className={`h-10 w-10 rounded-full items-center justify-center ${isDark ? "bg-yellow-500/15" : "bg-yellow-50"}`}
                  >
                    <Feather
                      name="sun"
                      size={16}
                      color={isDark ? "#FBBF24" : "#D97706"}
                    />
                  </View>
                  <View className="ml-3">
                    <Text className={`text-sm font-medium ${text}`}>
                      Solar Co-op
                    </Text>
                    <Text className={`text-xs ${textMuted}`}>
                      Rs. 18.5/kWh rate
                    </Text>
                  </View>
                </View>
                <Text
                  className={`font-bold text-base ${isDark ? "text-yellow-300" : "text-yellow-600"}`}
                >
                  Rs. {solarCost.toLocaleString()}
                </Text>
              </View>

              {/* Saved */}
              <View className="flex-row items-center justify-between p-4">
                <View className="flex-row items-center">
                  <View
                    className={`h-10 w-10 rounded-full items-center justify-center ${isDark ? "bg-green-500/15" : "bg-green-50"}`}
                  >
                    <Feather
                      name="check-circle"
                      size={16}
                      color={isDark ? "#22C55E" : "#16A34A"}
                    />
                  </View>
                  <Text className={`ml-3 text-sm font-semibold ${text}`}>
                    You Saved
                  </Text>
                </View>
                <Text
                  className={`font-bold text-base ${isDark ? "text-green-400" : "text-green-600"}`}
                >
                  Rs. {Math.max(savedAmount, 0).toLocaleString()}
                </Text>
              </View>
            </View>
          </View>

          {/* Environmental Impact */}
          <View className={`rounded-3xl p-5 border ${card}`}>
            <Text className={`text-base font-bold mb-4 ${text}`}>
              Environmental Impact
            </Text>

            <View
              className={`flex-row items-center justify-between py-3 border-b ${isDark ? "border-white/8" : "border-gray-100"}`}
            >
              <View className="flex-row items-center">
                <View className="h-9 w-9 rounded-xl bg-green-500/10 items-center justify-center mr-3">
                  <Feather name="wind" size={16} color="#22C55E" />
                </View>
                <Text className={`${textSecondary}`}>CO₂ Saved</Text>
              </View>
              <Text className={`font-bold text-base ${text}`}>
                {co2Saved} kg
              </Text>
            </View>

            <View className="flex-row items-center justify-between py-3 mb-4">
              <View className="flex-row items-center">
                <View className="h-9 w-9 rounded-xl bg-blue-500/10 items-center justify-center mr-3">
                  <Feather name="zap" size={16} color="#60A5FA" />
                </View>
                <Text className={`${textSecondary}`}>Renewable Used</Text>
              </View>
              <Text className={`font-bold text-base ${text}`}>
                {cleanEnergyKwh} kWh
              </Text>
            </View>

            <Pressable
              onPress={() => router.push("/(tabs)/energy")}
              className="rounded-2xl py-4 items-center"
              style={{ backgroundColor: isDark ? "#334155" : "#1F2937" }}
            >
              <Text className="text-white font-bold text-base">
                Manage Requests
              </Text>
            </Pressable>
          </View>
        </>
      )}
    </ScrollView>
  );
};

export default SavingsDashboard;
