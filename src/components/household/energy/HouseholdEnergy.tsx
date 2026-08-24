import TabScreenBackground from "@/components/shared/TabScreenBackground";
import { Feather } from "@expo/vector-icons";
import { useColorScheme } from 'nativewind';
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
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const [energyAmount, setEnergyAmount] = useState("");
  const [duration, setDuration] = useState("1 Day");
  const [purpose, setPurpose] = useState("Household Usage");
  const [priority, setPriority] = useState("Medium");
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  // Theme-based colors
  const theme = {
    background: isDark ? 'bg-background' : 'bg-gray-50',
    text: isDark ? 'text-white' : 'text-gray-900',
    textSecondary: isDark ? 'text-zinc-300' : 'text-gray-600',
    textMuted: isDark ? 'text-zinc-400' : 'text-gray-500',
    textLight: isDark ? 'text-zinc-400' : 'text-gray-400',
    card: isDark ? 'bg-black/30' : 'bg-white',
    cardBorder: isDark ? 'border-white/10' : 'border-gray-200',
    inputBg: isDark ? 'bg-white/5' : 'bg-gray-100',
    inputBorder: isDark ? 'border-white/10' : 'border-gray-300',
    inputText: isDark ? 'text-white' : 'text-gray-900',
    inputPlaceholder: isDark ? '#A1A1AA' : '#9CA3AF',
    selectedBg: isDark ? 'bg-slate-700' : 'bg-slate-200',
    selectedBorder: isDark ? 'border-slate-500' : 'border-slate-400',
    unselectedBg: isDark ? 'bg-white/5' : 'bg-gray-100',
    unselectedBorder: isDark ? 'border-white/10' : 'border-gray-300',
    modalBg: isDark ? 'bg-zinc-900' : 'bg-white',
    modalBorder: isDark ? 'border-white/10' : 'border-gray-200',
    submitBg: isDark ? '#334155' : '#E5E7EB',
    submitText: isDark ? 'text-white' : 'text-gray-900',
    errorText: isDark ? 'text-red-400' : 'text-red-600',
  };

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

  const getPriorityColor = (item: string) => {
    if (item === "Low") return isDark ? "text-green-400" : "text-green-600";
    if (item === "Medium") return isDark ? "text-yellow-400" : "text-yellow-600";
    return isDark ? "text-red-400" : "text-red-600";
  };

  return (
    <>
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
            Energy Request
          </Text>
          <Text className={`mt-1 ${theme.textSecondary}`}>
            Request renewable energy from nearby providers
          </Text>
        </View>

        {/* Energy Amount */}
        <View className={`rounded-3xl p-5 mb-5 border ${theme.cardBorder} ${theme.card}`}>
          <Text className={`text-xl font-bold mb-4 ${theme.text}`}>
            Energy Amount
          </Text>

          <View className={`flex-row items-center rounded-2xl px-4 py-4 border ${theme.inputBorder} ${theme.inputBg}`}>
            <Feather name="zap" size={20} color="#FBBF24" />
            <TextInput
              value={energyAmount}
              onChangeText={(text) => {
                setEnergyAmount(text);
                setError("");
              }}
              keyboardType="numeric"
              placeholder="Enter required energy (kWh)"
              placeholderTextColor={theme.inputPlaceholder}
              className={`flex-1 ml-3 ${theme.inputText}`}
            />
          </View>

          {error ? (
            <Text className={`mt-3 ${theme.errorText}`}>
              {error}
            </Text>
          ) : null}
        </View>

        {/* Duration */}
        <View className={`rounded-3xl p-5 mb-5 border ${theme.cardBorder} ${theme.card}`}>
          <Text className={`text-xl font-bold mb-4 ${theme.text}`}>
            Duration
          </Text>

          <View className="flex-row justify-between">
            {["1 Day", "1 Week", "1 Month"].map((item) => (
              <Pressable
                key={item}
                onPress={() => setDuration(item)}
                className={`w-[31%] py-4 rounded-2xl items-center border ${
                  duration === item
                    ? `${theme.selectedBg} ${theme.selectedBorder}`
                    : `${theme.unselectedBg} ${theme.unselectedBorder}`
                }`}
              >
                <Text className={`font-semibold ${theme.text}`}>
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Purpose */}
        <View className={`rounded-3xl p-5 mb-5 border ${theme.cardBorder} ${theme.card}`}>
          <Text className={`text-xl font-bold mb-4 ${theme.text}`}>
            Purpose
          </Text>

          <Pressable
            onPress={() => setPurpose("Household Usage")}
            className={`flex-row items-center rounded-2xl p-4 mb-3 border ${
              purpose === "Household Usage"
                ? `${theme.selectedBg} ${theme.selectedBorder}`
                : `${theme.unselectedBg} ${theme.unselectedBorder}`
            }`}
          >
            <Feather name="home" size={18} color="#60A5FA" />
            <Text className={`ml-3 ${theme.text}`}>
              Household Usage
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setPurpose("Appliance Operation")}
            className={`flex-row items-center rounded-2xl p-4 mb-3 border ${
              purpose === "Appliance Operation"
                ? `${theme.selectedBg} ${theme.selectedBorder}`
                : `${theme.unselectedBg} ${theme.unselectedBorder}`
            }`}
          >
            <Feather name="cpu" size={18} color="#22C55E" />
            <Text className={`ml-3 ${theme.text}`}>
              Appliance Operation
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setPurpose("Other Purpose")}
            className={`flex-row items-center rounded-2xl p-4 border ${
              purpose === "Other Purpose"
                ? `${theme.selectedBg} ${theme.selectedBorder}`
                : `${theme.unselectedBg} ${theme.unselectedBorder}`
            }`}
          >
            <Feather name="settings" size={18} color="#FBBF24" />
            <Text className={`ml-3 ${theme.text}`}>
              Other Purpose
            </Text>
          </Pressable>
        </View>

        {/* Priority */}
        <View className={`rounded-3xl p-5 mb-5 border ${theme.cardBorder} ${theme.card}`}>
          <Text className={`text-xl font-bold mb-4 ${theme.text}`}>
            Priority
          </Text>

          <View className="flex-row justify-between">
            {["Low", "Medium", "High"].map((item) => (
              <Pressable
                key={item}
                onPress={() => setPriority(item)}
                className={`w-[31%] py-4 rounded-2xl items-center border ${
                  priority === item
                    ? `${theme.selectedBg} ${theme.selectedBorder}`
                    : `${theme.unselectedBg} ${theme.unselectedBorder}`
                }`}
              >
                <Text className={`font-semibold ${getPriorityColor(item)}`}>
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Summary */}
        <View className={`rounded-3xl p-5 mb-6 border ${theme.cardBorder} ${theme.card}`}>
          <Text className={`text-xl font-bold mb-4 ${theme.text}`}>
            Request Summary
          </Text>

          <View className="flex-row justify-between mb-3">
            <Text className={theme.textMuted}>Energy</Text>
            <Text className={`font-semibold ${theme.text}`}>
              {energyAmount || "0"} kWh
            </Text>
          </View>

          <View className="flex-row justify-between mb-3">
            <Text className={theme.textMuted}>Duration</Text>
            <Text className={`font-semibold ${theme.text}`}>
              {duration}
            </Text>
          </View>

          <View className="flex-row justify-between mb-3">
            <Text className={theme.textMuted}>Purpose</Text>
            <Text className={`font-semibold ${theme.text}`}>
              {purpose}
            </Text>
          </View>

          <View className="flex-row justify-between">
            <Text className={theme.textMuted}>Priority</Text>
            <Text className={`font-semibold ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
              {priority}
            </Text>
          </View>
        </View>

        {/* Submit Button */}
        <Pressable
          onPress={handleSubmit}
          className="rounded-3xl py-5 items-center"
          style={{
            backgroundColor: isDark ? '#334155' : '#E5E7EB',
          }}
        >
          <Text className={`text-lg font-bold ${theme.submitText}`}>
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
          <View className={`w-full rounded-3xl p-6 border ${theme.modalBorder} ${theme.modalBg}`}>
            <View className="items-center mb-5">
              <View className="h-20 w-20 rounded-full bg-green-500/20 items-center justify-center">
                <Feather name="check" size={36} color="#22C55E" />
              </View>
            </View>

            <Text className={`text-2xl font-bold text-center ${theme.text}`}>
              Request Submitted
            </Text>

            <Text className={`text-center mt-2 mb-6 ${theme.textMuted}`}>
              Your energy request has been created successfully.
            </Text>

            <View className={`rounded-2xl p-4 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
              <Text className={`mb-2 ${theme.text}`}>
                Energy: {energyAmount} kWh
              </Text>
              <Text className={`mb-2 ${theme.text}`}>
                Duration: {duration}
              </Text>
              <Text className={`mb-2 ${theme.text}`}>
                Purpose: {purpose}
              </Text>
              <Text className={theme.text}>
                Priority: {priority}
              </Text>
            </View>

            <Pressable
              onPress={closeModal}
              className={`rounded-2xl py-4 mt-6 items-center ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`}
            >
              <Text className={`font-bold ${theme.text}`}>
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