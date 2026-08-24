import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';
import { useSolarOwnerStore } from '../store/useSolarOwnerStore';

export const BatteryCard = () => {
    const { battery, metrics } = useSolarOwnerStore();

    return (
        <View className="rounded-[28px] border border-border/70 bg-card/85 dark:bg-card/50 p-5 mb-5 shadow-sm">
            <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                    <View className="h-9 w-9 rounded-xl bg-emerald-500/20 items-center justify-center mr-2.5 border border-emerald-500/30">
                        <MaterialCommunityIcons name="battery-high" size={22} color="#10B981" />
                    </View>
                    <View>
                        <Text className="text-base font-bold text-foreground">
                            Home Battery Storage
                        </Text>
                        <Text className="text-xs text-muted-foreground font-medium">
                            10 kWh Lithium Iron Phosphate (LFP)
                        </Text>
                    </View>
                </View>

                <View className="bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-500/40">
                    <Text className="text-xs font-black text-emerald-500">
                        {battery.percentage}% Charged
                    </Text>
                </View>
            </View>

            {/* Battery Level Visual Bar */}
            <View className="h-4 w-full rounded-full bg-secondary/80 overflow-hidden my-2 border border-border/60">
                <View
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${battery.percentage}%` }}
                />
            </View>

            {/* Battery Detailed Stats Row */}
            <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-border/40">
                <View className="items-center flex-1">
                    <Text className="text-[10px] uppercase font-bold text-muted-foreground">
                        Charge Power
                    </Text>
                    <Text className="text-xs font-black text-emerald-500 mt-0.5">
                        +{metrics.batteryPowerKW.toFixed(1)} kW
                    </Text>
                </View>

                <View className="items-center flex-1 border-x border-border/40">
                    <Text className="text-[10px] uppercase font-bold text-muted-foreground">
                        Stored Energy
                    </Text>
                    <Text className="text-xs font-black text-foreground mt-0.5">
                        {battery.currentStoredKWh.toFixed(1)} / {battery.capacityKWh} kWh
                    </Text>
                </View>

                <View className="items-center flex-1">
                    <Text className="text-[10px] uppercase font-bold text-muted-foreground">
                        Backup Time
                    </Text>
                    <Text className="text-xs font-black text-foreground mt-0.5">
                        ~{battery.backupTimeHours} Hours
                    </Text>
                </View>
            </View>
        </View>
    );
};
