import TabScreenBackground from "@/components/shared/TabScreenBackground";
import { Feather } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

const SavingsDashboard = () => {
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
    cardBg: isDark ? 'bg-white/5' : 'bg-gray-100',
    submitBg: isDark ? '#334155' : '#E5E7EB',
    submitText: isDark ? 'text-white' : 'text-gray-900',
    gridBg: isDark ? 'bg-red-500/20' : 'bg-red-100',
    gridText: isDark ? 'text-red-300' : 'text-red-600',
    solarBg: isDark ? 'bg-yellow-500/20' : 'bg-yellow-100',
    solarText: isDark ? 'text-yellow-300' : 'text-yellow-600',
    savedBg: isDark ? 'bg-green-500/20' : 'bg-green-100',
    savedText: isDark ? 'text-green-400' : 'text-green-600',
    iconBg: isDark ? 'bg-white/10' : 'bg-gray-200',
  };

  // Navigation handlers
  const handleViewDetails = () => {
    router.push('/(tabs)/energy');
    console.log('Navigating to Energy Details');
  };

  const handleMonthlySavings = () => {
    // Navigate to detailed savings report
    console.log('Viewing monthly savings details');
  };

  const handleLifetimeSavings = () => {
    // Navigate to lifetime savings report
    console.log('Viewing lifetime savings details');
  };

  const handleRenewableEnergy = () => {
    router.push('/(tabs)/energy');
    console.log('Navigating to Renewable Energy details');
  };

  const handleGridCost = () => {
    console.log('Viewing grid cost details');
  };

  const handleSolarCost = () => {
    console.log('Viewing solar cost details');
  };

  const handleSavedAmount = () => {
    console.log('Viewing saved amount details');
  };

  const handleCO2Saved = () => {
    console.log('Viewing CO2 savings details');
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
      <View className="mb-8">
        <Text className={`text-4xl font-bold ${theme.text}`}>
          Savings
        </Text>
        <Text className={`mt-1 text-base ${theme.textSecondary}`}>
          Monitor your energy savings
        </Text>
      </View>

      {/* Savings Summary - Clickable */}
      <Pressable
        onPress={handleMonthlySavings}
        className={`rounded-3xl p-5 mb-6 border ${theme.cardBorder} ${theme.card}`}
      >
        <View className="flex-row items-center">
          <View className="h-16 w-16 rounded-2xl bg-yellow-500/10 items-center justify-center">
            <Feather name="dollar-sign" size={28} color="#FBBF24" />
          </View>

          <View className="ml-4 flex-1">
            <Text className={`text-sm ${theme.textMuted}`}>
              Monthly Savings
            </Text>
            <Text className={`text-4xl font-bold mt-1 ${theme.text}`}>
              Rs. 7,850
            </Text>
            <View className="flex-row items-center mt-2">
              <Feather name="trending-up" size={14} color="#22C55E" />
              <Text className="text-green-400 ml-1 text-sm">
                +18% vs Last Month
              </Text>
            </View>
          </View>

          <Feather name="chevron-right" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
        </View>
      </Pressable>

      {/* Stats */}
      <View className="flex-row justify-between mb-6">
        {/* Lifetime Savings - Clickable */}
        <Pressable
          onPress={handleLifetimeSavings}
          className={`w-[48%] rounded-3xl p-5 border ${theme.cardBorder} ${theme.card}`}
        >
          <View className="h-12 w-12 rounded-xl bg-green-500/10 items-center justify-center mb-4">
            <Feather name="bar-chart-2" size={20} color="#22C55E" />
          </View>
          <Text className={`text-sm ${theme.textMuted}`}>
            Lifetime Savings
          </Text>
          <Text className={`text-3xl font-bold mt-2 ${theme.text}`}>
            Rs. 42,500
          </Text>
        </Pressable>

        {/* Renewable Energy - Clickable */}
        <Pressable
          onPress={handleRenewableEnergy}
          className={`w-[48%] rounded-3xl p-5 border ${theme.cardBorder} ${theme.card}`}
        >
          <View className="h-12 w-12 rounded-xl bg-blue-500/10 items-center justify-center mb-4">
            <Feather name="zap" size={20} color="#60A5FA" />
          </View>
          <Text className={`text-sm ${theme.textMuted}`}>
            Renewable Energy
          </Text>
          <Text className={`text-3xl font-bold mt-2 ${theme.text}`}>
            84 kWh
          </Text>
        </Pressable>
      </View>

      {/* Electricity Cost Comparison */}
      <View className={`rounded-3xl p-5 mb-6 border ${theme.cardBorder} ${theme.card}`}>
        <Text className={`text-2xl font-bold mb-5 ${theme.text}`}>
          Electricity Cost Comparison
        </Text>

        <View className={`rounded-2xl overflow-hidden ${theme.cardBg}`}>
          {/* Grid - Clickable */}
          <Pressable
            onPress={handleGridCost}
            className="flex-row items-center justify-between p-4 border-b border-white/10"
          >
            <View className="flex-row items-center">
              <View className={`h-10 w-10 rounded-full ${theme.gridBg} items-center justify-center`}>
                <Feather name="activity" size={16} color={isDark ? '#F87171' : '#DC2626'} />
              </View>
              <Text className={`ml-3 text-base ${theme.text}`}>
                Grid
              </Text>
            </View>
            <Text className={`font-bold text-base ${theme.gridText}`}>
              Rs. 12,500
            </Text>
          </Pressable>

          {/* Solar - Clickable */}
          <Pressable
            onPress={handleSolarCost}
            className="flex-row items-center justify-between p-4 border-b border-white/10"
          >
            <View className="flex-row items-center">
              <View className={`h-10 w-10 rounded-full ${theme.solarBg} items-center justify-center`}>
                <Feather name="sun" size={16} color={isDark ? '#FBBF24' : '#D97706'} />
              </View>
              <Text className={`ml-3 text-base ${theme.text}`}>
                Solar
              </Text>
            </View>
            <Text className={`font-bold text-base ${theme.solarText}`}>
              Rs. 6,650
            </Text>
          </Pressable>

          {/* Saved - Clickable */}
          <Pressable
            onPress={handleSavedAmount}
            className="flex-row items-center justify-between p-4"
          >
            <View className="flex-row items-center">
              <View className={`h-10 w-10 rounded-full ${theme.savedBg} items-center justify-center`}>
                <Feather name="check-circle" size={16} color={isDark ? '#22C55E' : '#16A34A'} />
              </View>
              <Text className={`ml-3 text-base ${theme.text}`}>
                Saved
              </Text>
            </View>
            <Text className={`font-bold text-base ${theme.savedText}`}>
              Rs. 7,850
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Environmental Impact */}
      <View className={`rounded-3xl p-5 border ${theme.cardBorder} ${theme.card}`}>
        <Text className={`text-2xl font-bold mb-5 ${theme.text}`}>
          Environmental Impact
        </Text>

        {/* CO₂ Saved - Clickable */}
        <Pressable
          onPress={handleCO2Saved}
          className="flex-row justify-between items-center mb-4 py-2"
        >
          <View className="flex-row items-center">
            <Feather name="wind" size={18} color="#22C55E" />
            <Text className={`ml-2 ${theme.textSecondary}`}>
              CO₂ Saved
            </Text>
          </View>
          <Text className={`font-bold text-lg ${theme.text}`}>
            125 kg
          </Text>
        </Pressable>

        {/* Renewable Energy Used - Clickable */}
        <Pressable
          onPress={handleRenewableEnergy}
          className="flex-row justify-between items-center mb-6 py-2"
        >
          <View className="flex-row items-center">
            <Feather name="zap" size={18} color="#60A5FA" />
            <Text className={`ml-2 ${theme.textSecondary}`}>
              Renewable Energy Used
            </Text>
          </View>
          <Text className={`font-bold text-lg ${theme.text}`}>
            84 kWh
          </Text>
        </Pressable>

        {/* View Details Button */}
        <Pressable
          onPress={handleViewDetails}
          className="rounded-2xl py-4 items-center"
          style={{
            backgroundColor: isDark ? '#334155' : '#E5E7EB',
          }}
        >
          <Text className={`font-bold text-base ${theme.submitText}`}>
            View Details
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default SavingsDashboard;