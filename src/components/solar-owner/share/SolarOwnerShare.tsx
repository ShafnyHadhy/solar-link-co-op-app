import TabScreenBackground from '@/components/shared/TabScreenBackground';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SolarToast } from '../shared/SolarToast';
import { ViewHeader } from '../shared/ViewHeader';
import { useSolarOwnerStore } from '../store/useSolarOwnerStore';

export const SolarOwnerShare = () => {
    const {
        metrics,
        battery,
        communityRequests,
        sharingHistory,
        autoShareEnabled,
        toggleAutoShare,
        acceptRequest,
        rejectRequest,
        shareEnergyWithCommunity,
    } = useSolarOwnerStore();

    const [shareAmount, setShareAmount] = useState<string>('4.0');
    const [selectedPool, setSelectedPool] = useState<string>('Co-Op Community Pool');

    const handleShareSubmit = () => {
        const val = parseFloat(shareAmount);
        if (isNaN(val) || val <= 0) return;
        shareEnergyWithCommunity(val, selectedPool);
    };

    const handlePreset = (fraction: number) => {
        const val = (metrics.dailyExcessKWh * fraction).toFixed(1);
        setShareAmount(val);
    };

    return (
        <View className="flex-1 bg-background">
            <TabScreenBackground />
            <SolarToast />

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
            >
                {/* Header */}
                <ViewHeader
                    title="Energy Sharing"
                    subtitle="Share clean solar power with your community"
                    showBack={false}
                />

                {/* 1. AVAILABLE EXCESS ENERGY HERO */}
                <View className="rounded-[28px] border-2 border-amber-500/50 bg-card/90 dark:bg-card/60 p-5 mb-5 shadow-lg relative overflow-hidden">
                    <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-row items-center">
                            <View className="h-8 w-8 rounded-xl bg-amber-500/20 items-center justify-center mr-2">
                                <MaterialCommunityIcons name="solar-power-variant" size={18} color="#F59E0B" />
                            </View>
                            <Text className="text-xs font-bold uppercase tracking-wider text-amber-500">
                                Available Excess Energy
                            </Text>
                        </View>
                        <Text className="text-xs font-semibold text-muted-foreground">
                            Battery: {battery.percentage}%
                        </Text>
                    </View>

                    <View className="flex-row items-baseline my-2">
                        <Text className="text-4xl font-black text-foreground">
                            {metrics.dailyExcessKWh.toFixed(1)}
                        </Text>
                        <Text className="text-lg font-bold text-amber-500 ml-2">
                            kWh Ready to Share
                        </Text>
                    </View>
                    <Text className="text-xs text-muted-foreground">
                        Your home is 100% self-powered. All surplus power can be shared or exported.
                    </Text>

                    {/* Auto-Sharing Switcher */}
                    <View className="mt-4 pt-3.5 border-t border-border/50 flex-row items-center justify-between">
                        <View className="flex-row items-center flex-1 mr-3">
                            <Feather name="zap" size={16} color="#10B981" />
                            <View className="ml-2">
                                <Text className="text-xs font-bold text-foreground">
                                    Auto-Share Excess
                                </Text>
                                <Text className="text-[10px] text-muted-foreground">
                                    Export surplus when battery &gt; 75%
                                </Text>
                            </View>
                        </View>

                        <Pressable
                            onPress={toggleAutoShare}
                            className={`px-3 py-1.5 rounded-full border ${
                                autoShareEnabled
                                    ? 'bg-emerald-500 border-emerald-600'
                                    : 'bg-secondary border-border'
                            }`}
                        >
                            <Text
                                className={`text-[11px] font-bold ${
                                    autoShareEnabled ? 'text-white' : 'text-muted-foreground'
                                }`}
                            >
                                {autoShareEnabled ? 'Active' : 'Disabled'}
                            </Text>
                        </Pressable>
                    </View>
                </View>

                {/* 2. CHOOSE AMOUNT TO SHARE CARD */}
                <View className="rounded-[28px] border border-border/70 bg-card/85 dark:bg-card/50 p-5 mb-5 shadow-sm">
                    <Text className="text-base font-bold text-foreground mb-1">
                        Share Energy with Community
                    </Text>
                    <Text className="text-xs text-muted-foreground mb-4">
                        Choose the amount you want to contribute to the Co-Op pool
                    </Text>

                    {/* Amount Input */}
                    <Text className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                        Amount to Share (kWh)
                    </Text>
                    <View className="flex-row items-center rounded-2xl bg-secondary/80 border border-border/80 px-4 py-2 mb-3">
                        <TextInput
                            keyboardType="numeric"
                            value={shareAmount}
                            onChangeText={setShareAmount}
                            className="flex-1 text-2xl font-black text-foreground py-1"
                            placeholder="0.0"
                            placeholderTextColor="#9CA3AF"
                        />
                        <Text className="text-sm font-black text-amber-500 ml-2">
                            kWh
                        </Text>
                    </View>

                    {/* Preset buttons */}
                    <View className="flex-row items-center justify-between gap-2 mb-4">
                        {[
                            { label: '25%', frac: 0.25 },
                            { label: '50%', frac: 0.5 },
                            { label: '75%', frac: 0.75 },
                            { label: 'All Excess', frac: 1.0 },
                        ].map((item) => (
                            <Pressable
                                key={item.label}
                                onPress={() => handlePreset(item.frac)}
                                className="flex-1 py-2 rounded-xl bg-secondary border border-border/60 items-center active:opacity-80"
                            >
                                <Text className="text-xs font-bold text-foreground">
                                    {item.label}
                                </Text>
                            </Pressable>
                        ))}
                    </View>

                    {/* Destination Selection */}
                    <Text className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                        Target Pool
                    </Text>
                    <View className="gap-2 mb-5">
                        {[
                            {
                                id: 'Co-Op Community Pool',
                                title: 'Co-Op Community Pool',
                                rate: '$0.14 / kWh credit',
                                desc: 'Shared among neighborhood households in need',
                            },
                            {
                                id: 'Emergency Medical Reserve',
                                title: 'Emergency Clinic Reserve',
                                rate: 'Priority Community Aid',
                                desc: 'Dedicated reserve for local health clinics and oxygen units',
                            },
                        ].map((pool) => (
                            <Pressable
                                key={pool.id}
                                onPress={() => setSelectedPool(pool.id)}
                                className={`rounded-2xl p-3.5 border ${
                                    selectedPool === pool.id
                                        ? 'bg-amber-500/10 border-amber-500'
                                        : 'bg-secondary/40 border-border/50'
                                }`}
                            >
                                <View className="flex-row justify-between items-center">
                                    <Text
                                        className={`text-xs font-bold ${
                                            selectedPool === pool.id ? 'text-amber-500' : 'text-foreground'
                                        }`}
                                    >
                                        {pool.title}
                                    </Text>
                                    <Text className="text-[11px] font-bold text-emerald-500">
                                        {pool.rate}
                                    </Text>
                                </View>
                                <Text className="text-[10px] text-muted-foreground mt-0.5">
                                    {pool.desc}
                                </Text>
                            </Pressable>
                        ))}
                    </View>

                    {/* Submit Share Button */}
                    <Pressable
                        onPress={handleShareSubmit}
                        className="w-full rounded-2xl bg-primary py-4 items-center justify-center shadow-md active:opacity-90"
                    >
                        <View className="flex-row items-center">
                            <Feather name="send" size={16} color="#1E293B" style={{ marginRight: 8 }} />
                            <Text className="text-base font-black text-primary-foreground">
                                Share {shareAmount} kWh with Community
                            </Text>
                        </View>
                    </Pressable>
                </View>

                {/* 3. INCOMING COMMUNITY REQUESTS */}
                <View className="rounded-[28px] border border-border/70 bg-card/85 dark:bg-card/50 p-5 mb-5 shadow-sm">
                    <View className="flex-row items-center justify-between mb-4">
                        <View>
                            <Text className="text-base font-bold text-foreground">
                                Community Requests
                            </Text>
                            <Text className="text-xs text-muted-foreground font-medium">
                                Direct energy requests from neighbors
                            </Text>
                        </View>
                        <View className="bg-amber-500/20 px-2 py-0.5 rounded-full">
                            <Text className="text-[10px] font-black text-amber-500">
                                {communityRequests.filter((r) => r.status === 'pending').length} Pending
                            </Text>
                        </View>
                    </View>

                    {communityRequests.map((req) => {
                        const isPending = req.status === 'pending';
                        const isAccepted = req.status === 'accepted';
                        const isRejected = req.status === 'rejected';

                        return (
                            <View
                                key={req.id}
                                className="rounded-2xl border border-border/60 bg-secondary/30 p-4 mb-3"
                            >
                                <View className="flex-row items-start justify-between mb-2">
                                    <View className="flex-row items-center flex-1 mr-2">
                                        <View
                                            className="h-9 w-9 rounded-xl items-center justify-center mr-2.5"
                                            style={{ backgroundColor: req.avatarBg }}
                                        >
                                            <Text className="text-xs font-black text-white">
                                                {req.requesterName[0]}
                                            </Text>
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-xs font-bold text-foreground">
                                                {req.requesterName}
                                            </Text>
                                            <Text className="text-[10px] text-muted-foreground">
                                                {req.requesterAddress} • {req.timestamp}
                                            </Text>
                                        </View>
                                    </View>

                                    {req.urgency === 'urgent' && isPending && (
                                        <View className="bg-destructive/20 border border-destructive/40 px-2 py-0.5 rounded-full">
                                            <Text className="text-[9px] font-black text-destructive uppercase">
                                                Urgent
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                {/* Request Purpose */}
                                <Text className="text-xs text-foreground/90 font-medium mb-3">
                                    "{req.purpose}"
                                </Text>

                                {/* Request Details & Status */}
                                <View className="flex-row items-center justify-between py-2 border-t border-border/40">
                                    <View>
                                        <Text className="text-[10px] uppercase font-bold text-muted-foreground">
                                            Requested
                                        </Text>
                                        <Text className="text-sm font-black text-amber-500">
                                            {req.amountKWh} kWh
                                        </Text>
                                    </View>

                                    <View>
                                        <Text className="text-[10px] uppercase font-bold text-muted-foreground">
                                            Rate Offered
                                        </Text>
                                        <Text className="text-xs font-bold text-emerald-500">
                                            ${req.offeredRateUSDPerKWh} / kWh
                                        </Text>
                                    </View>

                                    <View>
                                        <Text className="text-[10px] uppercase font-bold text-muted-foreground">
                                            Status
                                        </Text>
                                        <Text
                                            className={`text-xs font-bold capitalize ${
                                                isAccepted
                                                    ? 'text-emerald-500'
                                                    : isRejected
                                                    ? 'text-destructive'
                                                    : 'text-amber-500'
                                            }`}
                                        >
                                            {req.status}
                                        </Text>
                                    </View>
                                </View>

                                {/* Actions for Pending Request */}
                                {isPending && (
                                    <View className="flex-row gap-2 mt-3 pt-2 border-t border-border/40">
                                        <Pressable
                                            onPress={() => rejectRequest(req.id)}
                                            className="flex-1 rounded-xl bg-destructive/15 border border-destructive/30 py-2.5 items-center active:opacity-70"
                                        >
                                            <Text className="text-xs font-bold text-destructive">
                                                Decline
                                            </Text>
                                        </Pressable>

                                        <Pressable
                                            onPress={() => acceptRequest(req.id)}
                                            className="flex-1 rounded-xl bg-emerald-500 py-2.5 items-center active:opacity-90 shadow-sm"
                                        >
                                            <Text className="text-xs font-bold text-white">
                                                Accept & Transfer
                                            </Text>
                                        </Pressable>
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </View>

                {/* 4. TRANSPARENT SHARING HISTORY */}
                <View className="rounded-[28px] border border-border/70 bg-card/85 dark:bg-card/50 p-5 mb-5 shadow-sm">
                    <View className="flex-row items-center justify-between mb-4">
                        <View>
                            <Text className="text-base font-bold text-foreground">
                                Sharing History
                            </Text>
                            <Text className="text-xs text-muted-foreground font-medium">
                                Transparent records of shared energy
                            </Text>
                        </View>
                        <Feather name="clock" size={16} color="#9CA3AF" />
                    </View>

                    <View className="divide-y divide-border/40">
                        {sharingHistory.map((item) => (
                            <View key={item.id} className="py-3 flex-row items-center justify-between">
                                <View className="flex-row items-center flex-1 mr-2">
                                    <View className="h-8 w-8 rounded-xl bg-emerald-500/15 items-center justify-center mr-2.5 border border-emerald-500/30">
                                        <Feather name="arrow-up-right" size={16} color="#10B981" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-xs font-bold text-foreground" numberOfLines={1}>
                                            {item.recipientName}
                                        </Text>
                                        <Text className="text-[10px] text-muted-foreground">
                                            {item.date} at {item.time} • {item.co2SavedKg} kg CO2 saved
                                        </Text>
                                    </View>
                                </View>

                                <View className="items-end">
                                    <Text className="text-xs font-black text-amber-500">
                                        +{item.amountKWh} kWh
                                    </Text>
                                    <Text className="text-[10px] font-bold text-emerald-500">
                                        +${item.creditsEarnedUSD.toFixed(2)}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default SolarOwnerShare;
