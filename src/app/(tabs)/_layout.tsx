import { useUserSync } from "@/hooks/useUserSync";
import { getUserRole } from "@/lib/getUserRole";
import { useUser } from "@clerk/expo";
import { Feather } from "@expo/vector-icons";
import { Redirect, Tabs } from "expo-router";
import { useColorScheme } from "nativewind";
import React from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabsLayout() {
  const { dbUser } = useUserSync();
  const { user, isSignedIn, isLoaded } = useUser();
  const insets = useSafeAreaInsets();

  const role = getUserRole(user?.publicMetadata?.role, dbUser?.role);

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const activeColor = isDark ? "#F59E0B" : "#D97706";
  const inactiveColor = isDark ? "#71717A" : "#9CA3AF";

  const bottomPadding = insets.bottom > 0 ? insets.bottom : (Platform.OS === "ios" ? 28 : 12);
  const tabHeight = 58 + bottomPadding;

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: activeColor,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor: isDark ? "#18181B" : "#FFFFFF",
          borderTopColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
          height: tabHeight,
          paddingBottom: bottomPadding,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size || 22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="energy"
        options={{
          title: "Energy",
          tabBarIcon: ({ color, size }) => (
            <Feather name="zap" size={size || 22} color={color} />
          ),
        }}
      />

      {/* Role-specific: Solar Owner Share */}
      <Tabs.Screen
        name="share"
        options={{
          title: "Share",
          href: role === "solar_owner" ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Feather name="share-2" size={size || 22} color={color} />
          ),
        }}
      />

      {/* Role-specific: Grid Manager Members */}
      <Tabs.Screen
        name="member"
        options={{
          title: "Members",
          href: role === "manager" ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Feather name="users" size={size || 22} color={color} />
          ),
        }}
      />

      {/* Role-specific: Household Savings */}
      <Tabs.Screen
        name="saving"
        options={{
          title: "Savings",
          href: role === "household" ? undefined : null,
          tabBarIcon: ({ color, size }) => (
            <Feather name="trending-up" size={size || 22} color={color} />
          ),
        }}
      />

      {/* Role-specific: Technician Requests */}
      <Tabs.Screen
        name="requests"
        options={{
          title: "Requests",
          href: role === "technician" ? undefined : null,
          tabBarBadge: role === "technician" ? 2 : undefined,
          tabBarIcon: ({ color, size }) => (
            <Feather name="tool" size={size || 22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="menu"
        options={{
          title: "Menu",
          tabBarIcon: ({ color, size }) => (
            <Feather name="menu" size={size || 22} color={color} />
          ),
        }}
      />

      {/* Hidden helper screens inside (tabs) */}
      <Tabs.Screen
        name="alerts"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
