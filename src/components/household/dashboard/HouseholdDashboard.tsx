import TabScreenBackground from "@/components/shared/TabScreenBackground";
import { useHouseholdAllocations } from "@/hooks/household/useHouseholdAllocations";
import { useHouseholdEnergyRequests } from "@/hooks/household/useHouseholdEnergyRequests";
import { useUser } from "@clerk/expo";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

const HouseholdDashboard = () => {
  const { colorScheme } = useColorScheme();
  const router = useRouter();
  const isDark = colorScheme === "dark";
  const { user } = useUser();

  const {
    stats,
    requests,
    loading: isLoadingStats,
  } = useHouseholdEnergyRequests();
  const { allocations } = useHouseholdAllocations();
  const pendingRequests = requests.filter(
    (request) => request.status === "pending",
  );
  const approvedRequests = requests.filter(
    (request) =>
      request.status === "approved" || request.status === "fulfilled",
  );

  const firstName = user?.firstName || user?.fullName?.split(" ")[0] || "there";

  // Theme
  const bg = isDark ? "bg-background" : "bg-gray-50";
  const text = isDark ? "text-white" : "text-gray-900";
  const textSecondary = isDark ? "text-zinc-300" : "text-gray-600";
  const textMuted = isDark ? "text-zinc-400" : "text-gray-500";
  const textLight = isDark ? "text-zinc-400" : "text-gray-400";
  const card = isDark
    ? "bg-black/30 border-white/10"
    : "bg-white border-gray-200";
  const iconBg = isDark ? "bg-white/10" : "bg-gray-200";
  const quickActionBg = isDark
    ? "bg-black/30 border-white/10"
    : "bg-white border-gray-200";

  const allocation = stats?.monthlyAllocationKwh ?? 0;
  const approvedKwh = stats?.approvedKwh ?? 0;
  const remaining = Math.max(allocation - approvedKwh, 0);
  const pendingCount = pendingRequests.length;

  return (
    <ScrollView
      className={`flex-1 ${bg}`}
      showsVerticalScrollIndicator={false}
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
          <Text className={`text-4xl font-bold ${text}`}>
            Hello, {firstName}
          </Text>
          <Text className={`mt-1 text-base ${textSecondary}`}>
            Welcome back to SolarLink
          </Text>
        </View>

        <View className="mr-16">
          <Pressable
            className={`h-12 w-12 rounded-full items-center justify-center ${
              isDark
                ? "bg-black/30 border border-white/10"
                : "bg-gray-200 border border-gray-300"
            }`}
          >
            <Feather
              name="bell"
              size={22}
              color={isDark ? "white" : "#374151"}
            />
          </Pressable>
        </View>
      </View>

      {/* Hero Card */}
      <Pressable
        onPress={() => router.push("/(tabs)/energy")}
        className="rounded-3xl p-5 mb-8"
        style={{ backgroundColor: isDark ? "#334155" : "#1F2937" }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-xl font-bold text-white">
              Request Solar Power
            </Text>
            <Text className="mt-1 text-slate-300 text-sm">
              Submit a new energy request
            </Text>

            {/* Allocation pill */}
            {stats && (
              <View className="mt-3 flex-row items-center self-start bg-white/10 rounded-full px-3 py-1.5">
                <Feather name="zap" size={12} color="#FBBF24" />
                <Text className="text-white text-xs font-semibold ml-1.5">
                  {remaining.toFixed(0)} kWh remaining this month
                </Text>
              </View>
            )}
          </View>

          <View className="h-14 w-14 rounded-full bg-white/10 items-center justify-center">
            <Feather name="plus" size={28} color="white" />
          </View>
        </View>
      </Pressable>

      {/* Stats */}
      <View className="flex-row justify-between mb-8">
        {/* Available/Allocated Energy */}
        <View className={`w-[48%] rounded-3xl p-5 border ${card}`}>
          <View className="h-12 w-12 rounded-xl bg-yellow-500/10 items-center justify-center mb-4">
            <Feather name="battery-charging" size={20} color="#FBBF24" />
          </View>

          <Text className={`text-sm ${textLight}`}>Monthly Allocation</Text>
          {isLoadingStats && !stats ? (
            <ActivityIndicator
              size="small"
              color="#FBBF24"
              style={{ marginTop: 8 }}
            />
          ) : (
            <>
              <Text className={`text-3xl font-bold mt-1 ${text}`}>
                {allocation}
              </Text>
              <Text className={`${textLight}`}>kWh</Text>
              <Text
                className={`text-xs mt-2 ${remaining > 0 ? "text-green-400" : "text-red-400"}`}
              >
                {remaining.toFixed(1)} kWh remaining
              </Text>
            </>
          )}
        </View>

        {/* Pending Requests */}
        <View className={`w-[48%] rounded-3xl p-5 border ${card}`}>
          <View className="h-12 w-12 rounded-xl bg-blue-500/10 items-center justify-center mb-4">
            <Feather name="clock" size={20} color="#60A5FA" />
          </View>

          <Text className={`text-sm ${textLight}`}>Pending Requests</Text>
          {isLoadingStats && !stats ? (
            <ActivityIndicator
              size="small"
              color="#60A5FA"
              style={{ marginTop: 8 }}
            />
          ) : (
            <>
              <Text className={`text-3xl font-bold mt-1 ${text}`}>
                {pendingCount}
              </Text>
              <Text className={`${textLight}`}>Active</Text>
              <Text
                className={`text-xs mt-2 ${pendingCount > 0 ? "text-yellow-400" : "text-green-400"}`}
              >
                {pendingCount > 0
                  ? `${pendingCount} awaiting approval`
                  : "All clear"}
              </Text>
            </>
          )}
        </View>
      </View>

      {/* Energy Mix Overview */}
      {stats && (
        <Pressable
          onPress={() => router.push("/(tabs)/saving")}
          className={`rounded-3xl p-4 mb-8 border ${card}`}
        >
          <View className="flex-row items-center justify-between mb-2.5">
            <View className="flex-row items-center">
              <View className="h-8 w-8 rounded-xl bg-emerald-500/15 items-center justify-center mr-2.5">
                <Feather name="zap" size={16} color="#34D399" />
              </View>
              <View>
                <Text className={`font-semibold text-sm ${text}`}>
                  Energy Source Mix
                </Text>
                <Text className={`text-xs ${textMuted}`}>
                  {stats.cleanEnergyUsedKwh} kWh solar (
                  {stats.cleanEnergySharePercent}%) ·{" "}
                  {stats.gridFallbackUsedKwh} kWh grid fallback
                </Text>
              </View>
            </View>
            <Feather
              name="chevron-right"
              size={16}
              color={isDark ? "#71717A" : "#9CA3AF"}
            />
          </View>

          {/* Micro split progress bar */}
          <View
            className={`h-2 rounded-full overflow-hidden flex-row ${isDark ? "bg-white/10" : "bg-gray-100"}`}
          >
            <View
              style={{ width: `${stats.cleanEnergySharePercent}%` }}
              className="h-full bg-emerald-400"
            />
            <View
              style={{ width: `${stats.gridFallbackSharePercent}%` }}
              className="h-full bg-red-400/80"
            />
          </View>
        </Pressable>
      )}

      {/* Needs Attention — only shown when there are pending requests */}
      {pendingCount > 0 && (
        <>
          <Text className={`text-2xl font-bold mb-4 ${text}`}>
            Needs Attention
          </Text>
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/(tabs)/energy",
                params: { tab: "pending" },
              })
            }
            className={`rounded-3xl overflow-hidden mb-8 border ${card}`}
          >
            <View className={`flex-row items-center p-4`}>
              <Feather name="alert-circle" size={20} color="#FBBF24" />
              <View className="flex-1 ml-3">
                <Text className={`font-semibold ${text}`}>
                  {pendingCount} request{pendingCount > 1 ? "s" : ""} awaiting
                  review
                </Text>
                <Text className={`text-xs mt-0.5 ${textMuted}`}>
                  Tap to view pending energy requests
                </Text>
              </View>
              <Feather
                name="chevron-right"
                size={16}
                color={isDark ? "#71717A" : "#9CA3AF"}
              />
            </View>
          </Pressable>
        </>
      )}

      {/* Quick Actions */}
      <Text className={`text-2xl font-bold mb-4 ${text}`}>Quick Actions</Text>

      <View className="flex-row justify-between mb-8">
        <Pressable
          onPress={() => router.push("/(tabs)/energy")}
          className={`w-[31%] rounded-2xl py-5 items-center border ${quickActionBg}`}
        >
          <Feather name="plus-circle" size={24} color="#FBBF24" />
          <Text className={`text-xs mt-2 ${text}`}>Request</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/(tabs)/saving")}
          className={`w-[31%] rounded-2xl py-5 items-center border ${quickActionBg}`}
        >
          <Feather name="trending-up" size={24} color="#60A5FA" />
          <Text className={`text-xs mt-2 ${text}`}>Savings</Text>
        </Pressable>

        <Pressable
          onPress={() =>
            router.push({
              pathname: "/(tabs)/energy",
              params: { tab: "requests" },
            })
          }
          className={`w-[31%] rounded-2xl py-5 items-center border ${quickActionBg}`}
        >
          <Feather name="list" size={24} color="#22C55E" />
          <Text className={`text-xs mt-2 ${text}`}>History</Text>
        </Pressable>
      </View>

      {/* Recent Activity */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className={`text-2xl font-bold ${text}`}>Recent Activity</Text>
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/(tabs)/energy",
              params: { tab: allocations.length > 0 ? "allocations" : "requests" },
            })
          }
        >
          <Text className="text-yellow-400 font-semibold">View All</Text>
        </Pressable>
      </View>

      <View className={`rounded-3xl overflow-hidden border ${card}`}>
        {/* Dispatched energy allocations */}
        {allocations.slice(0, 2).map((alloc, idx) => (
          <Pressable
            key={alloc.id}
            onPress={() =>
              router.push({
                pathname: "/(tabs)/energy",
                params: { tab: "allocations" },
              })
            }
            className={`flex-row items-center px-4 py-4 ${
              idx < Math.min(allocations.length, 2) - 1 ||
              approvedRequests.length > 0 ||
              pendingRequests.length > 0
                ? `border-b ${isDark ? "border-white/8" : "border-gray-100"}`
                : ""
            }`}
          >
            <View className="h-10 w-10 rounded-full bg-emerald-500/20 items-center justify-center">
              <Feather name="zap" size={18} color="#10B981" />
            </View>
            <View className="flex-1 ml-3">
              <Text className={`font-semibold ${text}`}>Energy Allocated</Text>
              <Text className={`text-xs ${textLight}`}>
                +{parseFloat(alloc.dispatchedEnergyKwh).toFixed(1)} kWh • from{" "}
                {alloc.offer?.ownerName || "Community Solar"}
              </Text>
            </View>
            <View className="items-end">
              <Text className={`text-xs ${textLight}`}>
                {new Date(alloc.dispatchedAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                })}
              </Text>
              <Text className="text-[10px] font-bold text-emerald-500 mt-0.5">
                Allocated
              </Text>
            </View>
          </Pressable>
        ))}

        {/* Approved requests */}
        {approvedRequests.slice(0, 2).map((req, idx) => (
          <View
            key={req.id}
            className={`flex-row items-center px-4 py-4 ${
              idx < Math.min(approvedRequests.length, 2) - 1 ||
              pendingRequests.length > 0
                ? `border-b ${isDark ? "border-white/8" : "border-gray-100"}`
                : ""
            }`}
          >
            <View className="h-10 w-10 rounded-full bg-green-500/20 items-center justify-center">
              <Feather name="check" size={18} color="#22C55E" />
            </View>
            <View className="flex-1 ml-3">
              <Text className={`font-semibold ${text}`}>Request Approved</Text>
              <Text className={`text-xs ${textLight}`}>
                {parseFloat(req.requestedEnergyKwh).toFixed(1)} kWh •{" "}
                {req.reason || "Energy request"}
              </Text>
            </View>
            <Text className={`text-xs ${textLight}`}>
              {new Date(req.requestedAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
              })}
            </Text>
          </View>
        ))}

        {/* Pending requests */}
        {pendingRequests.slice(0, 2).map((req, idx) => (
          <View
            key={req.id}
            className={`flex-row items-center px-4 py-4 ${
              idx < Math.min(pendingRequests.length, 2) - 1
                ? `border-b ${isDark ? "border-white/8" : "border-gray-100"}`
                : ""
            }`}
          >
            <View className="h-10 w-10 rounded-full bg-yellow-500/20 items-center justify-center">
              <Feather name="clock" size={18} color="#FBBF24" />
            </View>
            <View className="flex-1 ml-3">
              <Text className={`font-semibold ${text}`}>Request Pending</Text>
              <Text className={`text-xs ${textLight}`}>
                {parseFloat(req.requestedEnergyKwh).toFixed(1)} kWh • Awaiting
                review
              </Text>
            </View>
            <Text className={`text-xs ${textLight}`}>
              {new Date(req.requestedAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
              })}
            </Text>
          </View>
        ))}

        {/* Empty state */}
        {allocations.length === 0 && approvedRequests.length === 0 && pendingRequests.length === 0 && (
          <View className="flex-row items-center px-4 py-4">
            <View
              className={`h-10 w-10 rounded-full ${iconBg} items-center justify-center`}
            >
              <Feather
                name="inbox"
                size={18}
                color={isDark ? "#71717A" : "#9CA3AF"}
              />
            </View>
            <View className="flex-1 ml-3">
              <Text className={`font-semibold ${text}`}>
                No recent activity
              </Text>
              <Text className={`text-xs ${textLight}`}>
                Submit your first energy request
              </Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default HouseholdDashboard;
