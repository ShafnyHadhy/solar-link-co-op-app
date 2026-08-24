import TabScreenBackground from "@/components/shared/TabScreenBackground";
import { Feather } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

const HouseholdDashboard = () => {
  const { colorScheme } = useColorScheme();
  const router = useRouter();
  const isDark = colorScheme === 'dark';

  // Theme-based colors
  const theme = {
    background: isDark ? 'bg-background' : 'bg-gray-50',
    text: isDark ? 'text-white' : 'text-gray-900',
    textSecondary: isDark ? 'text-zinc-300' : 'text-gray-600',
    textMuted: isDark ? 'text-zinc-400' : 'text-gray-500',
    textLight: isDark ? 'text-zinc-400' : 'text-gray-400',
    card: isDark ? 'bg-black/30' : 'bg-white',
    cardBorder: isDark ? 'border-white/10' : 'border-gray-200',
    heroCard: isDark ? '#334155' : '#E5E7EB',
    heroText: isDark ? 'text-white' : 'text-gray-900',
    heroSubText: isDark ? 'text-slate-300' : 'text-gray-600',
    iconBg: isDark ? 'bg-white/10' : 'bg-gray-200',
    badgeBg: isDark ? 'bg-white/5' : 'bg-gray-100',
    statCard: isDark ? 'bg-black/30' : 'bg-white',
    statBorder: isDark ? 'border-white/10' : 'border-gray-200',
    quickActionBg: isDark ? 'bg-black/30' : 'bg-white',
    quickActionBorder: isDark ? 'border-white/10' : 'border-gray-200',
    activityBg: isDark ? 'bg-black/30' : 'bg-white',
    activityBorder: isDark ? 'border-white/10' : 'border-gray-100',
    alertBg: isDark ? 'bg-black/30' : 'bg-white',
    alertBorder: isDark ? 'border-white/10' : 'border-gray-200',
  };

  // Navigation handlers
  const handleRequestSolarPower = () => {
    router.push('/(tabs)/energy');
    console.log('Navigating to Energy page from Hero Card');
  };

  const handleQuickActionRequest = () => {
    router.push('/(tabs)/energy');
    console.log('Navigating to Energy page from Quick Action');
  };

  const handleReports = () => {
    router.push('/(tabs)/saving');
    console.log('Navigating to Savings page');
  };

  const handleMembers = () => {
    // Navigate to members page (create if needed)
    console.log('Navigate to Members page');
  };

  const handleNotification = () => {
    // Navigate to notifications (create if needed)
    console.log('Navigate to Notifications');
  };

  return (
    <ScrollView
      className={`flex-1 ${theme.background}`}
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
          <Text className={`text-4xl font-bold ${theme.text}`}>
            Hello, Shyamika
          </Text>
          <Text className={`mt-1 text-base ${theme.textSecondary}`}>
            Welcome back to SolarLink
          </Text>
        </View>

        <View className="mr-16">
          <Pressable 
            onPress={handleNotification}
            className={`h-12 w-12 rounded-full items-center justify-center ${
              isDark 
                ? 'bg-black/30 border border-white/10' 
                : 'bg-gray-200 border border-gray-300'
            }`}
          >
            <Feather name="bell" size={28} color={isDark ? 'white' : '#374151'} />
          </Pressable>
        </View>
      </View>

      {/* Hero Card - Request Solar Power */}
      <Pressable
        onPress={handleRequestSolarPower}
        className="rounded-3xl p-5 mb-8"
        style={{
          backgroundColor: isDark ? '#334155' : '#E5E7EB',
        }}
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className={`text-xl font-bold ${theme.heroText}`}>
              Request Solar Power
            </Text>
            <Text className={`mt-1 ${theme.heroSubText}`}>
              Submit a new energy request
            </Text>
          </View>

          <View className={`h-14 w-14 rounded-full items-center justify-center ${
            isDark ? 'bg-white/10' : 'bg-gray-300'
          }`}>
            <Feather name="plus" size={28} color={isDark ? 'white' : '#374151'} />
          </View>
        </View>
      </Pressable>

      {/* Attention Section */}
      <Text className={`text-2xl font-bold mb-4 ${theme.text}`}>
        Needs Attention
      </Text>

      <View className={`rounded-3xl overflow-hidden mb-8 ${theme.alertBg} border ${theme.alertBorder}`}>
        <View className={`flex-row items-center p-4 border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
          <Feather name="alert-triangle" size={20} color="#FBBF24" />
          <Text className={`ml-3 flex-1 ${theme.text}`}>
            Shared energy availability is low
          </Text>
        </View>

        <View className="flex-row items-center p-4">
          <Feather name="alert-triangle" size={20} color="#FBBF24" />
          <Text className={`ml-3 flex-1 ${theme.text}`}>
            Energy allocation may be affected
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View className="flex-row justify-between mb-8">
        <View className={`w-[48%] rounded-3xl p-5 border ${theme.statBorder} ${theme.statCard}`}>
          <View className="h-12 w-12 rounded-xl bg-yellow-500/10 items-center justify-center mb-4">
            <Feather name="zap" size={20} color="#FBBF24" />
          </View>

          <Text className={`text-sm ${theme.textLight}`}>Available Energy</Text>
          <Text className={`text-3xl font-bold mt-1 ${theme.text}`}>142</Text>
          <Text className={`${theme.textLight}`}>kWh</Text>
          <Text className="text-green-400 text-xs mt-2">+12% this week</Text>
        </View>

        <View className={`w-[48%] rounded-3xl p-5 border ${theme.statBorder} ${theme.statCard}`}>
          <View className="h-12 w-12 rounded-xl bg-blue-500/10 items-center justify-center mb-4">
            <Feather name="clock" size={20} color="#60A5FA" />
          </View>

          <Text className={`text-sm ${theme.textLight}`}>Pending Requests</Text>
          <Text className={`text-3xl font-bold mt-1 ${theme.text}`}>2</Text>
          <Text className={`${theme.textLight}`}>Active</Text>
          <Text className="text-yellow-400 text-xs mt-2">1 awaiting approval</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <Text className={`text-2xl font-bold mb-4 ${theme.text}`}>Quick Actions</Text>

      <View className="flex-row justify-between mb-8">
        <Pressable 
          onPress={handleQuickActionRequest}
          className={`w-[31%] rounded-2xl py-5 items-center border ${theme.quickActionBorder} ${theme.quickActionBg}`}
        >
          <Feather name="plus-circle" size={24} color="#FBBF24" />
          <Text className={`text-xs mt-2 ${theme.text}`}>Request</Text>
        </Pressable>

        <Pressable 
          onPress={handleReports}
          className={`w-[31%] rounded-2xl py-5 items-center border ${theme.quickActionBorder} ${theme.quickActionBg}`}
        >
          <Feather name="file-text" size={24} color="#60A5FA" />
          <Text className={`text-xs mt-2 ${theme.text}`}>Reports</Text>
        </Pressable>

        <Pressable 
          onPress={handleMembers}
          className={`w-[31%] rounded-2xl py-5 items-center border ${theme.quickActionBorder} ${theme.quickActionBg}`}
        >
          <Feather name="users" size={24} color="#22C55E" />
          <Text className={`text-xs mt-2 ${theme.text}`}>Members</Text>
        </Pressable>
      </View>

      {/* Recent Activity Header */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className={`text-2xl font-bold ${theme.text}`}>Recent Activity</Text>
        <Pressable>
          <Text className="text-yellow-400 font-semibold">View All</Text>
        </Pressable>
      </View>

      {/* Activity List */}
      <View className={`rounded-3xl overflow-hidden border ${theme.activityBorder} ${theme.activityBg}`}>
        <View className={`flex-row items-center px-4 py-4 border-b ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
          <View className="h-10 w-10 rounded-full bg-green-500/20 items-center justify-center">
            <Feather name="check" size={18} color="#22C55E" />
          </View>

          <View className="flex-1 ml-3">
            <Text className={`font-semibold ${theme.text}`}>Request Approved</Text>
            <Text className={`text-xs ${theme.textLight}`}>
              Sunny Valley Farm • 20 kWh
            </Text>
          </View>

          <Text className={`text-xs ${theme.textLight}`}>2h ago</Text>
        </View>

        <View className={`flex-row items-center px-4 py-4 border-b ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
          <View className="h-10 w-10 rounded-full bg-blue-500/20 items-center justify-center">
            <Feather name="calendar" size={18} color="#60A5FA" />
          </View>

          <View className="flex-1 ml-3">
            <Text className={`font-semibold ${theme.text}`}>Payment Due</Text>
            <Text className={`text-xs ${theme.textLight}`}>Cycle ending Sept 30</Text>
          </View>

          <Text className={`text-xs ${theme.textLight}`}>5h ago</Text>
        </View>

        <View className="flex-row items-center px-4 py-4">
          <View className="h-10 w-10 rounded-full bg-yellow-500/20 items-center justify-center">
            <Feather name="zap" size={18} color="#FBBF24" />
          </View>

          <View className="flex-1 ml-3">
            <Text className={`font-semibold ${theme.text}`}>New Provider Nearby</Text>
            <Text className={`text-xs ${theme.textLight}`}>
              EcoGrid Collective joined
            </Text>
          </View>

          <Text className={`text-xs ${theme.textLight}`}>Yesterday</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default HouseholdDashboard;