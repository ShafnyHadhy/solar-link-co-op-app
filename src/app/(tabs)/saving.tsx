import TabScreenBackground from "@/components/shared/TabScreenBackground";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

const SavingsDashboard = () => {
  return (
    <ScrollView
      className="flex-1 bg-background"
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
        <Text className="text-white text-4xl font-bold">
          Savings
        </Text>

        <Text className="text-zinc-300 mt-1 text-base">
          Monitor your energy savings
        </Text>
      </View>

      {/* Savings Summary */}
      <View className="bg-black/30 border border-white/10 rounded-3xl p-5 mb-6">
        <View className="flex-row items-center">
          <View className="h-16 w-16 rounded-2xl bg-yellow-500/10 items-center justify-center">
            <Feather
              name="dollar-sign"
              size={28}
              color="#FBBF24"
            />
          </View>

          <View className="ml-4 flex-1">
            <Text className="text-zinc-400 text-sm">
              Monthly Savings
            </Text>

            <Text className="text-white text-4xl font-bold mt-1">
              Rs. 7,850
            </Text>

            <View className="flex-row items-center mt-2">
              <Feather
                name="trending-up"
                size={14}
                color="#22C55E"
              />

              <Text className="text-green-400 ml-1 text-sm">
                +18% vs Last Month
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View className="flex-row justify-between mb-6">
        <View className="w-[48%] bg-black/30 border border-white/10 rounded-3xl p-5">
          <View className="h-12 w-12 rounded-xl bg-green-500/10 items-center justify-center mb-4">
            <Feather
              name="bar-chart-2"
              size={20}
              color="#22C55E"
            />
          </View>

          <Text className="text-zinc-400 text-sm">
            Lifetime Savings
          </Text>

          <Text className="text-white text-3xl font-bold mt-2">
            Rs. 42,500
          </Text>
        </View>

        <View className="w-[48%] bg-black/30 border border-white/10 rounded-3xl p-5">
          <View className="h-12 w-12 rounded-xl bg-blue-500/10 items-center justify-center mb-4">
            <Feather
              name="zap"
              size={20}
              color="#60A5FA"
            />
          </View>

          <Text className="text-zinc-400 text-sm">
            Renewable Energy
          </Text>

          <Text className="text-white text-3xl font-bold mt-2">
            84 kWh
          </Text>
        </View>
      </View>

      {/* Electricity Cost Comparison */}
      <View className="bg-black/30 border border-white/10 rounded-3xl p-5 mb-6">
        <Text className="text-white text-2xl font-bold mb-5">
          Electricity Cost Comparison
        </Text>

        <View className="bg-white/5 rounded-2xl overflow-hidden">
          {/* Grid */}
          <View className="flex-row items-center justify-between p-4 border-b border-white/10">
            <View className="flex-row items-center">
              <View className="h-10 w-10 rounded-full bg-red-500/20 items-center justify-center">
                <Feather
                  name="activity"
                  size={16}
                  color="#F87171"
                />
              </View>

              <Text className="text-white ml-3 text-base">
                Grid
              </Text>
            </View>

            <Text className="text-red-300 font-bold text-base">
              Rs. 12,500
            </Text>
          </View>

          {/* Solar */}
          <View className="flex-row items-center justify-between p-4 border-b border-white/10">
            <View className="flex-row items-center">
              <View className="h-10 w-10 rounded-full bg-yellow-500/20 items-center justify-center">
                <Feather
                  name="sun"
                  size={16}
                  color="#FBBF24"
                />
              </View>

              <Text className="text-white ml-3 text-base">
                Solar
              </Text>
            </View>

            <Text className="text-yellow-300 font-bold text-base">
              Rs. 6,650
            </Text>
          </View>

          {/* Saved */}
          <View className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center">
              <View className="h-10 w-10 rounded-full bg-green-500/20 items-center justify-center">
                <Feather
                  name="check-circle"
                  size={16}
                  color="#22C55E"
                />
              </View>

              <Text className="text-white ml-3 text-base">
                Saved
              </Text>
            </View>

            <Text className="text-green-400 font-bold text-base">
              Rs. 7,850
            </Text>
          </View>
        </View>
      </View>

      {/* Environmental Impact */}
      <View className="bg-black/30 border border-white/10 rounded-3xl p-5">
        <Text className="text-white text-2xl font-bold mb-5">
          Environmental Impact
        </Text>

        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center">
            <Feather
              name="wind"
              size={18}
              color="#22C55E"
            />
            <Text className="text-zinc-300 ml-2">
              CO₂ Saved
            </Text>
          </View>

          <Text className="text-white font-bold text-lg">
            125 kg
          </Text>
        </View>

        <View className="flex-row justify-between items-center mb-6">
          <View className="flex-row items-center">
            <Feather
              name="zap"
              size={18}
              color="#60A5FA"
            />
            <Text className="text-zinc-300 ml-2">
              Renewable Energy Used
            </Text>
          </View>

          <Text className="text-white font-bold text-lg">
            84 kWh
          </Text>
        </View>

        <Pressable
          className="rounded-2xl py-4 items-center"
          style={{
            backgroundColor: "#334155",
          }}
        >
          <Text className="text-white font-bold text-base">
            View Details
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default SavingsDashboard;