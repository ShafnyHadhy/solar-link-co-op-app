// components/household/menu/HouseholdConsumerMenu.tsx

import TabScreenBackground from "@/components/shared/TabScreenBackground";
import { getUserRole } from "@/lib/getUserRole";
import { useAuth, useUser } from "@clerk/expo";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useColorScheme } from "nativewind";

interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  badge?: string;
  isDestructive?: boolean;
}

const MenuItem = ({
  icon,
  title,
  subtitle,
  onPress,
  badge,
  isDestructive,
}: MenuItemProps) => (
  <Pressable
    onPress={onPress}
    className="flex-row items-center justify-between p-3.5 active:bg-secondary/40"
  >
    <View className="flex-row items-center flex-1 mr-3">
      <View
        className={`h-10 w-10 items-center justify-center rounded-xl mr-3 ${
          isDestructive
            ? "bg-destructive/15"
            : "bg-secondary border border-border/40"
        }`}
      >
        {icon}
      </View>

      <View className="flex-1">
        <Text
          className={`text-base font-semibold ${
            isDestructive ? "text-destructive font-bold" : "text-foreground"
          }`}
        >
          {title}
        </Text>
        {subtitle && (
          <Text className="text-xs text-muted-foreground mt-0.5">
            {subtitle}
          </Text>
        )}
      </View>
    </View>

    <View className="flex-row items-center">
      {badge && (
        <View className="rounded-full bg-primary/20 px-2.5 py-0.5 mr-2">
          <Text className="text-xs font-bold text-primary">{badge}</Text>
        </View>
      )}
      {onPress && (
        <Feather
          name="chevron-right"
          size={18}
          color={isDestructive ? "#EF4444" : "#9CA3AF"}
        />
      )}
    </View>
  </Pressable>
);

const HouseholdConsumerMenu = () => {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const role = getUserRole(user?.publicMetadata?.role as string | undefined);

  // Theme-based colors
  const theme = {
    text: isDark ? 'text-white' : 'text-gray-900',
    textSecondary: isDark ? 'text-zinc-300' : 'text-gray-600',
    textMuted: isDark ? 'text-zinc-400' : 'text-gray-500',
  };

  const getRoleTitle = (r?: string | null) => {
    switch (r) {
      case "solar_owner":
        return "Solar Owner";
      case "manager":
        return "Grid Manager";
      case "technician":
        return "Solar Technician";
      case "household":
        return "Household Consumer";
      default:
        return "Member";
    }
  };

  // Handler functions for navigation using expo-router
  const handleCreateRequest = () => {
    router.push("/(tabs)/energy");
  };

  const handlePendingRequests = () => {
    router.push({
      pathname: "/(tabs)/energy",
      params: { tab: "pending" },
    });
    console.log("Navigating to Pending Requests");
  };

  const handleRequestHistory = () => {
    router.push({
      pathname: "/(tabs)/energy",
      params: { tab: "history" },
    });
    console.log("Navigating to Request History");
  };

  const handleSavingsDashboard = () => {
    router.push("/(tabs)/saving");
    console.log("Navigating to Savings Dashboard");
  };

  const handleEnergyUsage = () => {
    router.push("/(tabs)/energy");
    console.log("Navigating to Energy Usage");
  };

  const handleRenewableStats = () => {
    router.push("/(tabs)/saving");
    console.log("Navigating to Renewable Statistics");
  };

  const handleHomeDashboard = () => {
    router.push("/");
    console.log("Navigating to Home Dashboard");
  };

  return (
    <View className="flex-1 bg-background">
      <TabScreenBackground />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 55,
          paddingBottom: 40,
        }}
      >
        {/* Header - Updated to match Savings Dashboard style */}
        <View className="mb-8">
          <Text className={`text-4xl font-bold ${theme.text}`}>
            Menu
          </Text>
          <Text className={`mt-1 text-base ${theme.textSecondary}`}>
            Manage energy requests, savings & account
          </Text>
        </View>

        {/* User Profile Section */}
        <View className="rounded-[24px] border border-border/70 bg-card/80 dark:bg-card/40 p-4 mb-6 shadow-sm">
          <View className="flex-row items-center">
            <View className="h-14 w-14 items-center justify-center rounded-2xl bg-primary border border-border/50 shadow-sm">
              <Text className="text-xl font-extrabold text-primary-foreground">
                {(user?.firstName?.[0] || "H").toUpperCase()}
              </Text>
            </View>

            <View className="ml-3.5 flex-1">
              <Text className="text-lg font-bold text-foreground">
                {user?.fullName || user?.firstName || "Household User"}
              </Text>
              <Text className="text-xs text-muted-foreground">
                {user?.primaryEmailAddress?.emailAddress ||
                  "household@solarlink.local"}
              </Text>

              <View className="self-start rounded-full bg-secondary px-2.5 py-0.5 mt-1.5">
                <Text className="text-[10px] font-bold uppercase tracking-wider text-secondary-foreground">
                  {getRoleTitle(role)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Section 1: Energy Requests */}
        <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-2 mb-2">
          Energy Requests
        </Text>
        <View className="rounded-[24px] border border-border/70 bg-card/80 dark:bg-card/40 overflow-hidden mb-6 shadow-sm divide-y divide-border/40">
          <MenuItem
            icon={<Feather name="plus-circle" size={18} color="#3B82F6" />}
            title="Create Request"
            subtitle="Request shared solar energy"
            onPress={handleCreateRequest}
          />
          <MenuItem
            icon={<Feather name="clock" size={18} color="#F59E0B" />}
            title="Pending Requests"
            subtitle="View submitted requests awaiting processing"
            badge="3"
            onPress={handlePendingRequests}
          />
          <MenuItem
            icon={<Feather name="check-circle" size={18} color="#10B981" />}
            title="Request History"
            subtitle="Completed and approved energy requests"
            onPress={handleRequestHistory}
          />
        </View>

        {/* Section 2: Savings & Usage */}
        <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-2 mb-2">
          Savings & Usage
        </Text>
        <View className="rounded-[24px] border border-border/70 bg-card/80 dark:bg-card/40 overflow-hidden mb-6 shadow-sm divide-y divide-border/40">
          <MenuItem
            icon={<Feather name="dollar-sign" size={18} color="#10B981" />}
            title="Savings Dashboard"
            subtitle="Money saved through renewable energy"
            onPress={handleSavingsDashboard}
          />
          <MenuItem
            icon={<Feather name="activity" size={18} color="#8B5CF6" />}
            title="Energy Usage"
            subtitle="Monitor household consumption history"
            onPress={handleEnergyUsage}
          />
          <MenuItem
            icon={
              <MaterialCommunityIcons name="leaf" size={20} color="#22C55E" />
            }
            title="Renewable Statistics"
            subtitle="Track environmental impact"
            badge="Active"
            onPress={handleRenewableStats}
          />
        </View>

        {/* Section 3: Settings & Support */}
        <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-2 mb-2">
          Settings & Support
        </Text>
        <View className="rounded-[24px] border border-border/70 bg-card/80 dark:bg-card/40 overflow-hidden mb-6 shadow-sm divide-y divide-border/40">
          <MenuItem
            icon={<Feather name="settings" size={18} color="#6B7280" />}
            title="Profile Settings"
            subtitle="Manage personal account information"
          />
          <MenuItem
            icon={<Feather name="bell" size={18} color="#6B7280" />}
            title="Notifications"
            subtitle="Configure alerts and updates"
          />
          <MenuItem
            icon={<Feather name="help-circle" size={18} color="#6B7280" />}
            title="Help & Support"
            subtitle="Access FAQs and customer support"
          />
        </View>

        {/* Sign Out Button */}
        <Pressable
          onPress={() => signOut()}
          className={`rounded-2xl border p-4 flex-row items-center justify-center active:opacity-80 mb-6 ${
            colorScheme === "dark"
              ? "border-red-500/30 bg-red-500/10"
              : "border-red-500/20 bg-red-50"
          }`}
        >
          <Feather
            name="log-out"
            size={18}
            color="#EF4444"
            style={{ marginRight: 8 }}
          />
          <Text
            className="text-base font-bold"
            style={{ color: "#EF4444" }}
          >
            Sign Out
          </Text>
        </Pressable>

        {/* App Version Info */}
        <View className="items-center justify-center py-2">
          <Text className="text-xs text-muted-foreground font-mono">
            Solar-Link v1.0.0 • Clean Community Energy
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default HouseholdConsumerMenu;