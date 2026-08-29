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
        <View className="rounded-xl border border-amber-500/40 bg-secondary/60 p-4 mb-5 shadow-sm overflow-hidden relative">
            {/* Header / Badge */}
            <View className="flex-row items-center justify-between mb-2 gap-2">
                <View className="flex-row items-center flex-1 mr-2">
                    <View className="h-8 w-8 rounded-lg bg-amber-500/20 items-center justify-center mr-2 border border-amber-500/30 flex-shrink-0">
                        <MaterialCommunityIcons name="lightning-bolt" size={18} color="#F59E0B" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
                            Available Excess Energy
                        </Text>
                        <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                            Calculated in real-time
                        </Text>
                    </View>
                </View>

                {autoShareEnabled && (
                    <View className="flex-row items-center rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 flex-shrink-0">
                        <View className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1.5" />
                        <Text className="text-xs font-bold text-[#10B981]">
                            Auto-Share Active
                        </Text>
                    </View>
                )}
            </View>

            {/* Big Value Section */}
            <View className="flex-row items-center justify-between my-2 gap-2">
                <View className="flex-1 mr-2">
                    <View className="flex-row items-baseline">
                        <Text className="text-3xl font-extrabold text-foreground">
                            {metrics.excessKW.toFixed(1)}
                        </Text>
                        <Text className="text-sm font-bold text-amber-500 ml-1.5">
                            kW Live
                        </Text>
                    </View>
                    <Text className="text-xs font-semibold text-muted-foreground mt-0.5" numberOfLines={2}>
                        +{metrics.dailyExcessKWh.toFixed(1)} kWh surplus generated today
                    </Text>
                </View>

                <Pressable
                    onPress={onQuickSharePress}
                    className="rounded-lg bg-primary px-3.5 py-2 flex-row items-center active:opacity-75 shadow-sm flex-shrink-0"
                >
                    <Feather name="share-2" size={14} color="#1E293B" style={{ marginRight: 6 }} />
                    <Text className="text-xs font-bold text-primary-foreground">
                        Share Now
                    </Text>
                </Pressable>
            </View>
        </View>
    );
};
