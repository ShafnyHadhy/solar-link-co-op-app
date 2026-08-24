import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { useSolarOwnerStore } from '../store/useSolarOwnerStore';

export const PowerFlowDiagram = () => {
    const { metrics, battery } = useSolarOwnerStore();

    return (
        <View className="rounded-[28px] border border-border/70 bg-card/85 dark:bg-card/50 p-5 mb-5 shadow-sm">
            <View className="flex-row items-center justify-between mb-4 gap-2">
                <View className="flex-1 mr-2 min-w-0">
                    <Text className="text-base font-bold text-foreground" numberOfLines={1}>
                        Live Power Flow
                    </Text>
                    <Text className="text-xs text-muted-foreground font-medium" numberOfLines={1}>
                        Real-time energy distribution across microgrid
                    </Text>
                </View>
                <View className="flex-row items-center bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-full flex-shrink-0">
                    <View className="h-2 w-2 rounded-full bg-emerald-500 mr-1.5 animate-ping" />
                    <Text className="text-[10px] font-black text-emerald-500 uppercase">
                        Active Flow
                    </Text>
                </View>
            </View>

            {/* Central Solar Hub at Top */}
            <View className="items-center mb-3">
                <View className="h-16 w-16 rounded-3xl bg-amber-500/20 border-2 border-amber-500 items-center justify-center shadow-md">
                    <MaterialCommunityIcons name="solar-panel" size={30} color="#F59E0B" />
                </View>
                <Text className="text-xs font-bold text-foreground mt-1.5">
                    Rooftop Solar
                </Text>
                <View className="bg-amber-500/20 px-2.5 py-0.5 rounded-full mt-0.5 border border-amber-500/40">
                    <Text className="text-xs font-black text-amber-500">
                        +{metrics.generationKW.toFixed(1)} kW
                    </Text>
                </View>
            </View>

            {/* Connector Flow Lines */}
            <View className="items-center my-1">
                <Feather name="arrow-down" size={18} color="#F59E0B" />
            </View>

            {/* Inverter Node in Center */}
            <View className="items-center mb-4">
                <View className="px-4 py-1.5 rounded-2xl bg-secondary border border-border/80 flex-row items-center">
                    <MaterialCommunityIcons name="swap-vertical-bold" size={16} color="#F59E0B" />
                    <Text className="text-[11px] font-bold text-foreground ml-1.5">
                        Hybrid Inverter (98.4% Eff.)
                    </Text>
                </View>
            </View>

            {/* 3 Destination Nodes (Home, Battery, Community Microgrid) */}
            <View className="flex-row items-start justify-between pt-2 border-t border-border/50">
                {/* Home Load Node */}
                <View className="items-center flex-1">
                    <View className="h-12 w-12 rounded-2xl bg-sky-500/15 border border-sky-500/40 items-center justify-center mb-1.5">
                        <Feather name="home" size={20} color="#0EA5E9" />
                    </View>
                    <Text className="text-[11px] font-bold text-foreground">
                        Home Load
                    </Text>
                    <Text className="text-xs font-black text-sky-500 mt-0.5">
                        {metrics.consumptionKW.toFixed(1)} kW
                    </Text>
                    <Text className="text-[10px] text-muted-foreground">
                        Self-powered
                    </Text>
                </View>

                {/* Battery Node */}
                <View className="items-center flex-1 border-x border-border/40 px-1">
                    <View className="h-12 w-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 items-center justify-center mb-1.5">
                        <Feather name="battery-charging" size={20} color="#10B981" />
                    </View>
                    <Text className="text-[11px] font-bold text-foreground">
                        Battery ({battery.percentage}%)
                    </Text>
                    <Text className="text-xs font-black text-emerald-500 mt-0.5">
                        +{metrics.batteryPowerKW.toFixed(1)} kW
                    </Text>
                    <Text className="text-[10px] text-muted-foreground">
                        Charging
                    </Text>
                </View>

                {/* Community Co-Op Node */}
                <View className="items-center flex-1">
                    <View className="h-12 w-12 rounded-2xl bg-purple-500/15 border border-purple-500/40 items-center justify-center mb-1.5">
                        <MaterialCommunityIcons name="account-group" size={22} color="#A855F7" />
                    </View>
                    <Text className="text-[11px] font-bold text-foreground">
                        Co-Op Sharing
                    </Text>
                    <Text className="text-xs font-black text-purple-500 mt-0.5">
                        {metrics.excessKW.toFixed(1)} kW
                    </Text>
                    <Text className="text-[10px] text-muted-foreground">
                        Community
                    </Text>
                </View>
            </View>
        </View>
    );
};
