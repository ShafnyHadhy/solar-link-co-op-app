import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSolarOwnerStore } from '../store/useSolarOwnerStore';

interface ExcessEnergyCardProps {
    onQuickSharePress: () => void;
}

export const ExcessEnergyCard: React.FC<ExcessEnergyCardProps> = ({ onQuickSharePress }) => {
    const { metrics, autoShareEnabled } = useSolarOwnerStore();

    return (
        <View className="rounded-[28px] border-2 border-amber-500/40 bg-card/90 dark:bg-card/60 p-5 mb-5 shadow-lg overflow-hidden relative">
            {/* Background Glow Accent */}
            <View className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-primary/20 blur-xl" />

            {/* Header / Badge */}
            <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center">
                    <View className="h-9 w-9 rounded-xl bg-amber-500/20 items-center justify-center mr-2.5 border border-amber-500/30">
                        <MaterialCommunityIcons name="lightning-bolt" size={20} color="#F59E0B" />
                    </View>
                    <View>
                        <Text className="text-xs font-bold uppercase tracking-wider text-amber-500">
                            Available Excess Energy
                        </Text>
                        <Text className="text-[11px] text-muted-foreground font-medium">
                            Calculated automatically in real-time
                        </Text>
                    </View>
                </View>

                {autoShareEnabled && (
                    <View className="flex-row items-center rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1">
                        <View className="h-2 w-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                        <Text className="text-[10px] font-bold text-emerald-500 uppercase">
                            Auto-Share Active
                        </Text>
                    </View>
                )}
            </View>

            {/* Big Value Section */}
            <View className="flex-row items-baseline justify-between my-2">
                <View>
                    <View className="flex-row items-baseline">
                        <Text className="text-4xl font-black text-foreground tracking-tight">
                            {metrics.excessKW.toFixed(1)}
                        </Text>
                        <Text className="text-lg font-bold text-amber-500 ml-1.5">
                            kW Live
                        </Text>
                    </View>
                    <Text className="text-xs font-semibold text-muted-foreground mt-0.5">
                        +{metrics.dailyExcessKWh.toFixed(1)} kWh total surplus generated today
                    </Text>
                </View>

                <Pressable
                    onPress={onQuickSharePress}
                    className="rounded-2xl bg-primary px-4 py-3 flex-row items-center shadow-md active:opacity-90 active:scale-95"
                >
                    <Feather name="share-2" size={16} color="#1E293B" style={{ marginRight: 6 }} />
                    <Text className="text-xs font-black text-primary-foreground uppercase tracking-wide">
                        Share Now
                    </Text>
                </Pressable>
            </View>

            {/* Transparent Calculation Breakdown Formula */}
            <View className="mt-4 pt-3.5 border-t border-border/60 bg-secondary/30 -mx-5 -mb-5 px-5 py-3.5">
                <Text className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Live Calculation Formula:
                </Text>
                <View className="flex-row items-center justify-between flex-wrap">
                    <View className="flex-row items-center">
                        <Text className="text-xs font-bold text-foreground">
                            {metrics.generationKW.toFixed(1)} kW
                        </Text>
                        <Text className="text-[10px] text-muted-foreground ml-1">Gen</Text>
                    </View>

                    <Text className="text-xs font-bold text-muted-foreground">−</Text>

                    <View className="flex-row items-center">
                        <Text className="text-xs font-bold text-foreground">
                            {metrics.consumptionKW.toFixed(1)} kW
                        </Text>
                        <Text className="text-[10px] text-muted-foreground ml-1">Home</Text>
                    </View>

                    <Text className="text-xs font-bold text-muted-foreground">=</Text>

                    <View className="flex-row items-center bg-amber-500/15 px-2 py-0.5 rounded-lg border border-amber-500/30">
                        <Text className="text-xs font-black text-amber-500">
                            {metrics.excessKW.toFixed(1)} kW Excess
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
};
