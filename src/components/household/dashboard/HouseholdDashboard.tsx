import TabScreenBackground from "@/components/shared/TabScreenBackground";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

const HouseholdDashboard = () => {
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
      <View className="flex-row items-center justify-between mb-8">
        <View>
          <Text className="text-white text-4xl font-bold">Hello, Shyamika</Text>

          <Text className="text-zinc-300 mt-1 text-base">
            Welcome back to SolarLink
          </Text>
        </View>

        <View className="mr-16">
          <Pressable className="h-12 w-12 rounded-full bg-black/30 border border-white/10 items-center justify-center">
            <Feather name="bell" size={28} color="white" />
          </Pressable>
        </View>
      </View>

      {/* Hero Card */}
      <Pressable
        className="rounded-3xl p-5 mb-8"
        style={{
          backgroundColor: "#334155",
        }}
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-white text-xl font-bold">
              Request Solar Power
            </Text>

            <Text className="text-slate-300 mt-1">
              Submit a new energy request
            </Text>
          </View>

          <View className="h-14 w-14 rounded-full bg-white/10 items-center justify-center">
            <Feather name="plus" size={28} color="white" />
          </View>
        </View>
      </Pressable>

      {/* Attention Section */}
      <Text className="text-white text-2xl font-bold mb-4">
        Needs Attention
      </Text>

      <View className="bg-black/30 border border-white/10 rounded-3xl overflow-hidden mb-8">
        <View className="flex-row items-center p-4 border-b border-white/10">
          <Feather name="alert-triangle" size={20} color="#FBBF24" />

          <Text className="text-white ml-3 flex-1">
            Shared energy availability is low
          </Text>
        </View>

        <View className="flex-row items-center p-4">
          <Feather name="alert-triangle" size={20} color="#FBBF24" />

          <Text className="text-white ml-3 flex-1">
            Energy allocation may be affected
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View className="flex-row justify-between mb-8">
        <View className="w-[48%] bg-black/30 border border-white/10 rounded-3xl p-5">
          <View className="h-12 w-12 rounded-xl bg-yellow-500/10 items-center justify-center mb-4">
            <Feather name="zap" size={20} color="#FBBF24" />
          </View>

          <Text className="text-zinc-400 text-sm">Available Energy</Text>

          <Text className="text-white text-3xl font-bold mt-1">142</Text>

          <Text className="text-zinc-400">kWh</Text>

          <Text className="text-green-400 text-xs mt-2">+12% this week</Text>
        </View>

        <View className="w-[48%] bg-black/30 border border-white/10 rounded-3xl p-5">
          <View className="h-12 w-12 rounded-xl bg-blue-500/10 items-center justify-center mb-4">
            <Feather name="clock" size={20} color="#60A5FA" />
          </View>

          <Text className="text-zinc-400 text-sm">Pending Requests</Text>

          <Text className="text-white text-3xl font-bold mt-1">2</Text>

          <Text className="text-zinc-400">Active</Text>

          <Text className="text-yellow-400 text-xs mt-2">
            1 awaiting approval
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <Text className="text-white text-2xl font-bold mb-4">Quick Actions</Text>

      <View className="flex-row justify-between mb-8">
        <Pressable className="w-[31%] bg-black/30 border border-white/10 rounded-2xl py-5 items-center">
          <Feather name="plus-circle" size={24} color="#FBBF24" />
          <Text className="text-white text-xs mt-2">Request</Text>
        </Pressable>

        <Pressable className="w-[31%] bg-black/30 border border-white/10 rounded-2xl py-5 items-center">
          <Feather name="file-text" size={24} color="#60A5FA" />
          <Text className="text-white text-xs mt-2">Reports</Text>
        </Pressable>

        <Pressable className="w-[31%] bg-black/30 border border-white/10 rounded-2xl py-5 items-center">
          <Feather name="users" size={24} color="#22C55E" />
          <Text className="text-white text-xs mt-2">Members</Text>
        </Pressable>
      </View>

      {/* Recent Activity Header */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-white text-2xl font-bold">Recent Activity</Text>

        <Pressable>
          <Text className="text-yellow-400 font-semibold">View All</Text>
        </Pressable>
      </View>

      {/* Activity List */}
      <View className="bg-black/30 border border-white/10 rounded-3xl overflow-hidden">
        <View className="flex-row items-center px-4 py-4 border-b border-white/10">
          <View className="h-10 w-10 rounded-full bg-green-500/20 items-center justify-center">
            <Feather name="check" size={18} color="#22C55E" />
          </View>

          <View className="flex-1 ml-3">
            <Text className="text-white font-semibold">Request Approved</Text>

            <Text className="text-zinc-400 text-xs">
              Sunny Valley Farm • 20 kWh
            </Text>
          </View>

          <Text className="text-zinc-500 text-xs">2h ago</Text>
        </View>

        <View className="flex-row items-center px-4 py-4 border-b border-white/10">
          <View className="h-10 w-10 rounded-full bg-blue-500/20 items-center justify-center">
            <Feather name="calendar" size={18} color="#60A5FA" />
          </View>

          <View className="flex-1 ml-3">
            <Text className="text-white font-semibold">Payment Due</Text>

            <Text className="text-zinc-400 text-xs">Cycle ending Sept 30</Text>
          </View>

          <Text className="text-zinc-500 text-xs">5h ago</Text>
        </View>

        <View className="flex-row items-center px-4 py-4">
          <View className="h-10 w-10 rounded-full bg-yellow-500/20 items-center justify-center">
            <Feather name="zap" size={18} color="#FBBF24" />
          </View>

          <View className="flex-1 ml-3">
            <Text className="text-white font-semibold">
              New Provider Nearby
            </Text>

            <Text className="text-zinc-400 text-xs">
              EcoGrid Collective joined
            </Text>
          </View>

          <Text className="text-zinc-500 text-xs">Yesterday</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default HouseholdDashboard;
