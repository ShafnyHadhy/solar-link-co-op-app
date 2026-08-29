import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Pressable, Text, TextInput, View } from 'react-native';
import { useSolarOwnerStore } from '../store/useSolarOwnerStore';

interface QuickShareModalProps {
    visible: boolean;
    onClose: () => void;
}

export const QuickShareModal: React.FC<QuickShareModalProps> = ({ visible, onClose }) => {
    const { metrics, shareEnergyWithCommunity } = useSolarOwnerStore();
    const [amountInput, setAmountInput] = useState<string>('3.5');
    const [selectedPool, setSelectedPool] = useState<string>('Co-Op Community Pool');

    const handleShare = () => {
        const amount = parseFloat(amountInput);
        if (isNaN(amount) || amount <= 0) return;
        const success = shareEnergyWithCommunity(amount, selectedPool);
        if (success) {
            onClose();
        }
    };

    const handlePreset = (fraction: number) => {
        const val = (metrics.dailyExcessKWh * fraction).toFixed(1);
        setAmountInput(val);
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View className="flex-1 bg-black/60 justify-center items-center p-4">
                <View className="w-full max-w-sm rounded-[32px] bg-card border border-border/80 p-6 shadow-2xl">
                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center">
                            <View className="h-10 w-10 rounded-xl bg-amber-500/20 items-center justify-center mr-3 border border-amber-500/30">
                                <MaterialCommunityIcons name="solar-power-variant" size={22} color="#F59E0B" />
                            </View>
                            <View>
                                <Text className="text-lg font-semibold text-foreground">
                                    Share Excess Solar
                                </Text>
                                <Text className="text-xs text-muted-foreground">
                                    Routed via Co-Op Manager
                                </Text>
                            </View>
                        </View>
                        <Pressable
                            onPress={onClose}
                            className="h-8 w-8 rounded-full bg-secondary items-center justify-center active:opacity-70"
                        >
                            <Feather name="x" size={18} color="#9CA3AF" />
                        </Pressable>
                    </View>

                    {/* Available Excess Display */}
                    <View className="rounded-xl bg-secondary/60 border border-amber-500/30 p-3.5 mb-4">
                        <Text className="text-xs font-semibold uppercase tracking-[1px] text-amber-500">
                            Available Excess Energy
                        </Text>
                        <Text className="text-2xl font-extrabold text-foreground mt-0.5">
                            {metrics.dailyExcessKWh.toFixed(1)} kWh
                        </Text>
                    </View>

                    {/* Amount Input */}
                    <Text className="text-xs font-semibold uppercase tracking-[1px] text-muted-foreground mb-2">
                        Amount to Share (kWh)
                    </Text>
                    <View className="flex-row items-center rounded-xl bg-secondary border border-border/60 px-4 py-2 mb-3">
                        <TextInput
                            keyboardType="numeric"
                            value={amountInput}
                            onChangeText={setAmountInput}
                            className="flex-1 text-xl font-extrabold text-foreground py-1"
                            placeholder="0.0"
                            placeholderTextColor="#9CA3AF"
                        />
                        <Text className="text-sm font-semibold text-muted-foreground ml-2">
                            kWh
                        </Text>
                    </View>

                    {/* Quick Percentage Presets */}
                    <View className="flex-row items-center justify-between mb-5">
                        {[0.25, 0.5, 0.75, 1.0].map((frac) => (
                            <Pressable
                                key={frac}
                                onPress={() => handlePreset(frac)}
                                className="px-3 py-1.5 rounded-lg bg-secondary border border-border/60 active:opacity-80"
                            >
                                <Text className="text-xs font-semibold text-foreground">
                                    {frac * 100}%
                                </Text>
                            </Pressable>
                        ))}
                    </View>

                    {/* Pool Type Selection */}
                    <Text className="text-xs font-semibold uppercase tracking-[1px] text-muted-foreground mb-2">
                        Target Allocation Pool
                    </Text>
                    <View className="gap-2 mb-4">
                        {[
                            { name: 'Co-Op Community Pool', desc: 'Mutual aid for local households ($0.14/kWh credit)' },
                            { name: 'Emergency Medical Reserve', desc: 'High-priority backup for local clinic' },
                        ].map((pool) => (
                            <Pressable
                                key={pool.name}
                                onPress={() => setSelectedPool(pool.name)}
                                className={`rounded-xl p-3 border ${
                                    selectedPool === pool.name
                                        ? 'bg-primary/15 border-primary'
                                        : 'bg-secondary/40 border-border/50'
                                }`}
                            >
                                <Text
                                    className={`text-xs font-semibold ${
                                        selectedPool === pool.name ? 'text-primary' : 'text-foreground'
                                    }`}
                                >
                                    {pool.name}
                                </Text>
                                <Text className="text-xs text-muted-foreground mt-0.5">
                                    {pool.desc}
                                </Text>
                            </Pressable>
                        ))}
                    </View>

                    {/* Manager Dispatch Notice */}
                    <View className="flex-row items-center rounded-xl bg-blue-500/10 border border-blue-500/20 px-3 py-2 mb-4">
                        <Feather name="shield" size={14} color="#3B82F6" style={{ marginRight: 6 }} />
                        <Text className="text-xs text-blue-500 font-semibold flex-1">
                            Offer is sent to Co-Op Manager for grid verification & distribution.
                        </Text>
                    </View>

                    {/* Share Button */}
                    <Pressable
                        onPress={handleShare}
                        className="w-full rounded-xl bg-primary py-3.5 items-center justify-center shadow-sm active:opacity-75"
                    >
                        <Text className="text-sm font-semibold text-primary-foreground">
                            Submit Offer to Manager
                        </Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
};
