import TabScreenBackground from "@/components/shared/TabScreenBackground";
import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

const EnergyRequestScreen = () => {
  const [energyAmount, setEnergyAmount] = useState("");
  const [duration, setDuration] = useState("1 Day");
  const [purpose, setPurpose] = useState("Household Usage");
  const [priority, setPriority] = useState("Medium");
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!energyAmount.trim()) {
      setError("Please enter an energy amount.");
      return;
    }

    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);

    setEnergyAmount("");
    setDuration("1 Day");
    setPurpose("Household Usage");
    setPriority("Medium");
  };

  return (
    <>
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
            Energy Request
          </Text>

          <Text className="text-zinc-300 mt-1">
            Request renewable energy from nearby providers
          </Text>
        </View>

        {/* Energy Amount */}
        <View className="bg-black/30 border border-white/10 rounded-3xl p-5 mb-5">
          <Text className="text-white text-xl font-bold mb-4">
            Energy Amount
          </Text>

          <View className="flex-row items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-4">
            <Feather
              name="zap"
              size={20}
              color="#FBBF24"
            />

            <TextInput
              value={energyAmount}
              onChangeText={(text) => {
                setEnergyAmount(text);
                setError("");
              }}
              keyboardType="numeric"
              placeholder="Enter required energy (kWh)"
              placeholderTextColor="#A1A1AA"
              className="flex-1 text-white ml-3"
            />
          </View>

          {error ? (
            <Text className="text-red-400 mt-3">
              {error}
            </Text>
          ) : null}
        </View>

        {/* Duration */}
        <View className="bg-black/30 border border-white/10 rounded-3xl p-5 mb-5">
          <Text className="text-white text-xl font-bold mb-4">
            Duration
          </Text>

          <View className="flex-row justify-between">
            {["1 Day", "1 Week", "1 Month"].map((item) => (
              <Pressable
                key={item}
                onPress={() => setDuration(item)}
                className={`w-[31%] py-4 rounded-2xl items-center ${
                  duration === item
                    ? "bg-slate-700"
                    : "bg-white/5 border border-white/10"
                }`}
              >
                <Text className="text-white font-semibold">
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Purpose */}
        <View className="bg-black/30 border border-white/10 rounded-3xl p-5 mb-5">
          <Text className="text-white text-xl font-bold mb-4">
            Purpose
          </Text>

          <Pressable
            onPress={() =>
              setPurpose("Household Usage")
            }
            className={`flex-row items-center rounded-2xl p-4 mb-3 border ${
              purpose === "Household Usage"
                ? "bg-slate-700 border-slate-500"
                : "bg-white/5 border-white/10"
            }`}
          >
            <Feather
              name="home"
              size={18}
              color="#60A5FA"
            />
            <Text className="text-white ml-3">
              Household Usage
            </Text>
          </Pressable>

          <Pressable
            onPress={() =>
              setPurpose("Appliance Operation")
            }
            className={`flex-row items-center rounded-2xl p-4 mb-3 border ${
              purpose === "Appliance Operation"
                ? "bg-slate-700 border-slate-500"
                : "bg-white/5 border-white/10"
            }`}
          >
            <Feather
              name="cpu"
              size={18}
              color="#22C55E"
            />
            <Text className="text-white ml-3">
              Appliance Operation
            </Text>
          </Pressable>

          <Pressable
            onPress={() =>
              setPurpose("Other Purpose")
            }
            className={`flex-row items-center rounded-2xl p-4 border ${
              purpose === "Other Purpose"
                ? "bg-slate-700 border-slate-500"
                : "bg-white/5 border-white/10"
            }`}
          >
            <Feather
              name="settings"
              size={18}
              color="#FBBF24"
            />
            <Text className="text-white ml-3">
              Other Purpose
            </Text>
          </Pressable>
        </View>

        {/* Priority */}
        <View className="bg-black/30 border border-white/10 rounded-3xl p-5 mb-5">
          <Text className="text-white text-xl font-bold mb-4">
            Priority
          </Text>

          <View className="flex-row justify-between">
            {["Low", "Medium", "High"].map((item) => (
              <Pressable
                key={item}
                onPress={() => setPriority(item)}
                className={`w-[31%] py-4 rounded-2xl items-center ${
                  priority === item
                    ? "bg-slate-700"
                    : "bg-white/5 border border-white/10"
                }`}
              >
                <Text
                  className={`font-semibold ${
                    item === "Low"
                      ? "text-green-400"
                      : item === "Medium"
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Summary */}
        <View className="bg-black/30 border border-white/10 rounded-3xl p-5 mb-6">
          <Text className="text-white text-xl font-bold mb-4">
            Request Summary
          </Text>

          <View className="flex-row justify-between mb-3">
            <Text className="text-zinc-400">
              Energy
            </Text>

            <Text className="text-white font-semibold">
              {energyAmount || "0"} kWh
            </Text>
          </View>

          <View className="flex-row justify-between mb-3">
            <Text className="text-zinc-400">
              Duration
            </Text>

            <Text className="text-white font-semibold">
              {duration}
            </Text>
          </View>

          <View className="flex-row justify-between mb-3">
            <Text className="text-zinc-400">
              Purpose
            </Text>

            <Text className="text-white font-semibold">
              {purpose}
            </Text>
          </View>

          <View className="flex-row justify-between">
            <Text className="text-zinc-400">
              Priority
            </Text>

            <Text className="text-yellow-400 font-semibold">
              {priority}
            </Text>
          </View>
        </View>

        {/* Submit Button */}
        <Pressable
          onPress={handleSubmit}
          className="rounded-3xl py-5 items-center"
          style={{
            backgroundColor: "#334155",
          }}
        >
          <Text className="text-white text-lg font-bold">
            Submit Request
          </Text>
        </Pressable>
      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
      >
        <View className="flex-1 bg-black/80 justify-center items-center px-6">
          <View className="w-full bg-zinc-900 rounded-3xl p-6 border border-white/10">
            <View className="items-center mb-5">
              <View className="h-20 w-20 rounded-full bg-green-500/20 items-center justify-center">
                <Feather
                  name="check"
                  size={36}
                  color="#22C55E"
                />
              </View>
            </View>

            <Text className="text-white text-2xl font-bold text-center">
              Request Submitted
            </Text>

            <Text className="text-zinc-400 text-center mt-2 mb-6">
              Your energy request has been created successfully.
            </Text>

            <View className="bg-white/5 rounded-2xl p-4">
              <Text className="text-white mb-2">
                Energy: {energyAmount} kWh
              </Text>

              <Text className="text-white mb-2">
                Duration: {duration}
              </Text>

              <Text className="text-white mb-2">
                Purpose: {purpose}
              </Text>

              <Text className="text-white">
                Priority: {priority}
              </Text>
            </View>

            <Pressable
              onPress={closeModal}
              className="bg-slate-700 rounded-2xl py-4 mt-6 items-center"
            >
              <Text className="text-white font-bold">
                Close
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default EnergyRequestScreen;