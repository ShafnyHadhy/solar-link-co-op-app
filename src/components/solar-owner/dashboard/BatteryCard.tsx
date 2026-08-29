import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { useSolarOwnerStore } from '../store/useSolarOwnerStore';

export const BatteryCard = () => {
    const { battery, metrics } = useSolarOwnerStore();

    return (
        <View className="rounded-xl border border-border/30 bg-secondary/60 p-4 mb-5 shadow-sm">
            <View className="flex-row items-center justify-between mb-3 gap-2">
                <View className="flex-row items-center flex-1 mr-2">
                    <View className="h-8 w-8 rounded-lg bg-emerald-500/20 items-center justify-center mr-2 border border-emerald-500/30 flex-shrink-0">
                        <MaterialCommunityIcons name="battery-high" size={20} color="#10B981" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                            Home Battery Storage
                        </Text>
                        <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                            10 kWh Lithium Iron Phosphate (LFP)
                        </Text>
                    </View>
                </View>

                <View className="bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex-shrink-0">
                    <Text className="text-xs font-bold text-[#10B981]">
                        {battery.percentage}% Charged
                    </Text>
                </View>
            </View>

            {/* Battery Level Visual Bar */}
            <View className="h-2 w-full rounded-full bg-secondary overflow-hidden my-2 border border-border/40">
                <View
                    className="h-full rounded-full bg-[#10B981]"
                    style={{ width: `${battery.percentage}%` }}
                />
            </View>

            {/* Battery Detailed Stats Row */}
            <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-border/30">
                <View className="items-center flex-1">
                    <Text className="text-xs font-semibold text-muted-foreground">
                        Charge Power
                    </Text>
                    <Text className="text-xs font-bold text-[#10B981] mt-0.5">
                        +{metrics.batteryPowerKW.toFixed(1)} kW
                    </Text>
                </View>

                <View className="items-center flex-1 border-x border-border/30">
                    <Text className="text-xs font-semibold text-muted-foreground">
                        Stored Energy
                    </Text>
                    <Text className="text-xs font-bold text-foreground mt-0.5">
                        {battery.currentStoredKWh.toFixed(1)} / {battery.capacityKWh} kWh
                    </Text>
                </View>

                <View className="items-center flex-1">
                    <Text className="text-xs font-semibold text-muted-foreground">
                        Backup Time
                    </Text>
                    <Text className="text-xs font-bold text-foreground mt-0.5">
                        ~{battery.backupTimeHours} Hours
                    </Text>
                </View>
            </View>
        </View>
    );
};
