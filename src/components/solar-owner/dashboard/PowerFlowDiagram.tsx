import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { useSolarOwnerStore } from '../store/useSolarOwnerStore';

export const PowerFlowDiagram = () => {
    const { metrics, battery } = useSolarOwnerStore();

    return (
        <View className="rounded-xl border border-border/30 bg-secondary/60 p-4 mb-5 shadow-sm">
            <View className="flex-row items-center justify-between mb-4 gap-2">
                <View className="flex-1 mr-2 min-w-0">
                    <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                        Live Power Flow
                    </Text>
                    <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                        Real-time energy distribution across microgrid
                    </Text>
                </View>
                <View className="flex-row items-center bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex-shrink-0">
                    <View className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5" />
                    <Text className="text-xs font-bold text-[#10B981]">
                        Active Flow
                    </Text>
                </View>
            </View>

            {/* Central Solar Hub at Top */}
            <View className="items-center mb-3">
                <View className="h-14 w-14 rounded-2xl bg-amber-500/20 border border-amber-500 items-center justify-center shadow-sm">
                    <MaterialCommunityIcons name="solar-panel" size={26} color="#F59E0B" />
                </View>
                <Text className="text-xs font-semibold text-foreground mt-1.5">
                    Rooftop Solar
                </Text>
                <View className="bg-amber-500/20 px-2.5 py-0.5 rounded-full mt-0.5 border border-amber-500/30">
                    <Text className="text-xs font-bold text-amber-500">
                        +{metrics.generationKW.toFixed(1)} kW
                    </Text>
                </View>
            </View>

            {/* Connector Flow Lines */}
            <View className="items-center my-1">
                <Feather name="arrow-down" size={16} color="#F59E0B" />
            </View>

            {/* Inverter Node in Center */}
            <View className="items-center mb-4">
                <View className="px-3.5 py-1 rounded-xl bg-secondary border border-border/60 flex-row items-center">
                    <MaterialCommunityIcons name="swap-vertical-bold" size={14} color="#F59E0B" />
                    <Text className="text-xs font-semibold text-foreground ml-1.5">
                        Hybrid Inverter (98.4% Eff.)
                    </Text>
                </View>
            </View>

            {/* 3 Destination Nodes (Home, Battery, Community Microgrid) */}
            <View className="flex-row items-start justify-between pt-2 border-t border-border/30">
                {/* Home Load Node */}
                <View className="items-center flex-1">
                    <View className="h-10 w-10 rounded-xl bg-sky-500/15 border border-sky-500/40 items-center justify-center mb-1">
                        <Feather name="home" size={18} color="#0EA5E9" />
                    </View>
                    <Text className="text-xs font-semibold text-foreground">
                        Home Load
                    </Text>
                    <Text className="text-xs font-bold text-sky-500 mt-0.5">
                        {metrics.consumptionKW.toFixed(1)} kW
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                        Self-powered
                    </Text>
                </View>

                {/* Battery Node */}
                <View className="items-center flex-1 border-x border-border/30 px-1">
                    <View className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/40 items-center justify-center mb-1">
                        <Feather name="battery-charging" size={18} color="#10B981" />
                    </View>
                    <Text className="text-xs font-semibold text-foreground">
                        Battery ({battery.percentage}%)
                    </Text>
                    <Text className="text-xs font-bold text-[#10B981] mt-0.5">
                        +{metrics.batteryPowerKW.toFixed(1)} kW
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                        Charging
                    </Text>
                </View>

                {/* Community Co-Op Node */}
                <View className="items-center flex-1">
                    <View className="h-10 w-10 rounded-xl bg-purple-500/15 border border-purple-500/40 items-center justify-center mb-1">
                        <MaterialCommunityIcons name="account-group" size={18} color="#A855F7" />
                    </View>
                    <Text className="text-xs font-semibold text-foreground">
                        Co-Op Sharing
                    </Text>
                    <Text className="text-xs font-bold text-purple-500 mt-0.5">
                        {metrics.excessKW.toFixed(1)} kW
                    </Text>
                    <Text className="text-xs text-muted-foreground">
                        Community
                    </Text>
                </View>
            </View>
        </View>
    );
};
