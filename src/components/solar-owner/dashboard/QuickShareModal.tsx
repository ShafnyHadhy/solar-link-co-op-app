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
                            <View className="h-10 w-10 rounded-2xl bg-amber-500/20 items-center justify-center mr-3 border border-amber-500/30">
                                <MaterialCommunityIcons name="solar-power-variant" size={22} color="#F59E0B" />
                            </View>
                            <View>
                                <Text className="text-lg font-black text-foreground">
                                    Share Excess Solar
                                </Text>
                                <Text className="text-xs text-muted-foreground font-medium">
                                    Instant Community Export
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
                    <View className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-3.5 mb-4">
                        <Text className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                            Available Excess Energy
                        </Text>
                        <Text className="text-2xl font-black text-foreground mt-0.5">
                            {metrics.dailyExcessKWh.toFixed(1)} kWh
                        </Text>
                    </View>

                    {/* Amount Input */}
                    <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                        Amount to Share (kWh)
                    </Text>
                    <View className="flex-row items-center rounded-2xl bg-secondary/70 border border-border/80 px-4 py-2 mb-3">
                        <TextInput
                            keyboardType="numeric"
                            value={amountInput}
                            onChangeText={setAmountInput}
                            className="flex-1 text-xl font-bold text-foreground py-1"
                            placeholder="0.0"
                            placeholderTextColor="#9CA3AF"
                        />
                        <Text className="text-sm font-bold text-muted-foreground ml-2">
                            kWh
                        </Text>
                    </View>

                    {/* Quick Percentage Presets */}
                    <View className="flex-row items-center justify-between mb-5">
                        {[0.25, 0.5, 0.75, 1.0].map((frac) => (
                            <Pressable
                                key={frac}
                                onPress={() => handlePreset(frac)}
                                className="px-3 py-1.5 rounded-xl bg-secondary border border-border/60 active:opacity-80"
                            >
                                <Text className="text-xs font-bold text-foreground">
                                    {frac * 100}%
                                </Text>
                            </Pressable>
                        ))}
                    </View>

                    {/* Pool Type Selection */}
                    <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                        Sharing Destination
                    </Text>
                    <View className="gap-2 mb-5">
                        {[
                            { name: 'Co-Op Community Pool', desc: 'Mutual aid for local households ($0.14/kWh credit)' },
                            { name: 'Emergency Medical Reserve', desc: 'High-priority backup for local clinic' },
                        ].map((pool) => (
                            <Pressable
                                key={pool.name}
                                onPress={() => setSelectedPool(pool.name)}
                                className={`rounded-2xl p-3 border ${
                                    selectedPool === pool.name
                                        ? 'bg-primary/15 border-primary'
                                        : 'bg-secondary/40 border-border/50'
                                }`}
                            >
                                <Text
                                    className={`text-xs font-bold ${
                                        selectedPool === pool.name ? 'text-primary' : 'text-foreground'
                                    }`}
                                >
                                    {pool.name}
                                </Text>
                                <Text className="text-[11px] text-muted-foreground mt-0.5">
                                    {pool.desc}
                                </Text>
                            </Pressable>
                        ))}
                    </View>

                    {/* Share Button */}
                    <Pressable
                        onPress={handleShare}
                        className="w-full rounded-2xl bg-primary py-4 items-center justify-center shadow-lg active:opacity-90 active:scale-98"
                    >
                        <Text className="text-base font-black text-primary-foreground">
                            Confirm & Share Energy
                        </Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
};
