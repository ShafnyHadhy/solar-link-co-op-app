import TabScreenBackground from '@/components/shared/TabScreenBackground';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SolarToast } from '../shared/SolarToast';
import { ViewHeader } from '../shared/ViewHeader';
import { useSolarOwnerStore } from '../store/useSolarOwnerStore';

export const SolarOwnerShare = () => {
    const insets = useSafeAreaInsets();
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

    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [shareAmountInput, setShareAmountInput] = useState<string>('3.5');
    const [selectedPool, setSelectedPool] = useState<string>('Co-Op Community Pool');

    const enteredVal = parseFloat(shareAmountInput) || 0;
    const remainingAfterShare = Math.max(0, metrics.dailyExcessKWh - enteredVal);

    const handleShareSubmit = () => {
        if (enteredVal <= 0 || enteredVal > metrics.dailyExcessKWh) return;
        const success = shareEnergyWithCommunity(enteredVal, selectedPool);
        if (success) {
            setShareModalOpen(false);
        }
    };

    const handlePreset = (fraction: number) => {
        const val = (metrics.dailyExcessKWh * fraction).toFixed(1);
        setShareAmountInput(val);
    };

    // Calculate transparency aggregates
    const totalSharedKWh = sharingHistory.reduce((acc, curr) => acc + curr.amountKWh, 0);
    const totalCreditsEarned = sharingHistory.reduce((acc, curr) => acc + curr.creditsEarnedUSD, 0);
    const uniqueHouseholdsSupported = new Set(sharingHistory.map((s) => s.recipientName)).size;

    return (
        <View className="flex-1 bg-background">
            <TabScreenBackground />
            <SolarToast />

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingTop: insets.top > 0 ? insets.top + 10 : 24,
                    paddingBottom: 40,
                }}
            >
                {/* Header */}
                <ViewHeader
                    title="Energy Sharing"
                    subtitle="Manage community requests & share excess solar"
                    showBack={false}
                />

                {/* 1. MAIN CARD: AVAILABLE TO SHARE & PRIMARY SHARE BUTTON */}
                <View className="rounded-[28px] border-2 border-amber-500/50 bg-card/90 dark:bg-card/60 p-5 mb-5 shadow-lg relative overflow-hidden">
                    <View className="flex-row items-center justify-between mb-2">
                        <View className="flex-row items-center">
                            <View className="h-8 w-8 rounded-xl bg-amber-500/20 items-center justify-center mr-2">
                                <MaterialCommunityIcons name="lightning-bolt" size={18} color="#F59E0B" />
                            </View>
                            <Text className="text-xs font-bold uppercase tracking-wider text-amber-500">
                                Available to Share
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
                            kWh
                        </Text>
                    </View>
                    <Text className="text-xs text-muted-foreground mb-4">
                        Calculated automatically after household consumption and battery safety reserve.
                    </Text>

                    {/* Primary [ SHARE ENERGY ] Button */}
                    <Pressable
                        onPress={() => setShareModalOpen(true)}
                        className="w-full rounded-2xl bg-primary py-4 items-center justify-center shadow-md active:opacity-90 active:scale-98 mb-3"
                    >
                        <View className="flex-row items-center">
                            <Feather name="share-2" size={18} color="#1E293B" style={{ marginRight: 8 }} />
                            <Text className="text-base font-black text-primary-foreground">
                                SHARE ENERGY
                            </Text>
                        </View>
                    </Pressable>

                    {/* Auto-Sharing Switcher */}
                    <View className="pt-3 border-t border-border/50 flex-row items-center justify-between">
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

                {/* 2. TRANSPARENCY & COMMUNITY IMPACT METRICS */}
                <View className="rounded-[28px] border border-border/70 bg-card/85 dark:bg-card/50 p-4 mb-5 shadow-sm">
                    <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
                        Transparency & Contribution Record
                    </Text>
                    <View className="flex-row items-center justify-between">
                        <View className="items-center flex-1">
                            <Text className="text-[10px] font-bold uppercase text-muted-foreground">
                                Total Shared
                            </Text>
                            <Text className="text-base font-black text-amber-500 mt-0.5">
                                {totalSharedKWh.toFixed(1)} kWh
                            </Text>
                        </View>

                        <View className="items-center flex-1 border-x border-border/40">
                            <Text className="text-[10px] font-bold uppercase text-muted-foreground">
                                Households
                            </Text>
                            <Text className="text-base font-black text-foreground mt-0.5">
                                {uniqueHouseholdsSupported} Supported
                            </Text>
                        </View>

                        <View className="items-center flex-1">
                            <Text className="text-[10px] font-bold uppercase text-muted-foreground">
                                Total Credits
                            </Text>
                            <Text className="text-base font-black text-emerald-500 mt-0.5">
                                +${totalCreditsEarned.toFixed(2)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* 3. INCOMING COMMUNITY ENERGY REQUESTS */}
                <View className="rounded-[28px] border border-border/70 bg-card/85 dark:bg-card/50 p-5 mb-5 shadow-sm">
                    <View className="flex-row items-center justify-between mb-4">
                        <View>
                            <Text className="text-base font-bold text-foreground">
                                Incoming Requests
                            </Text>
                            <Text className="text-xs text-muted-foreground font-medium">
                                Requests from neighborhood households
                            </Text>
                        </View>
                        <View className="bg-amber-500/20 px-2.5 py-0.5 rounded-full">
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
                                                {req.requesterAddress}
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

                                <Text className="text-xs text-foreground/90 font-medium mb-3">
                                    "{req.purpose}"
                                </Text>

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
                                            Date
                                        </Text>
                                        <Text className="text-xs font-bold text-foreground">
                                            Today
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

                                {isPending && (
                                    <View className="flex-row gap-2 mt-3 pt-2 border-t border-border/40">
                                        <Pressable
                                            onPress={() => rejectRequest(req.id)}
                                            className="flex-1 rounded-xl bg-destructive/15 border border-destructive/30 py-2.5 items-center active:opacity-70"
                                        >
                                            <Text className="text-xs font-bold text-destructive">
                                                Reject
                                            </Text>
                                        </Pressable>

                                        <Pressable
                                            onPress={() => acceptRequest(req.id)}
                                            className="flex-1 rounded-xl bg-emerald-500 py-2.5 items-center active:opacity-90 shadow-sm"
                                        >
                                            <Text className="text-xs font-bold text-white">
                                                Accept
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
                                            {item.date} at {item.time} • Completed
                                        </Text>
                                    </View>
                                </View>

                                <View className="items-end">
                                    <Text className="text-xs font-black text-amber-500">
                                        {item.amountKWh} kWh
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

            {/* --- MODAL: SHARE ENERGY FLOW --- */}
            <Modal visible={shareModalOpen} transparent animationType="slide">
                <View className="flex-1 bg-black/60 justify-end">
                    <View className="rounded-t-[36px] bg-card border-t border-border p-6 max-h-[85%]">
                        {/* Modal Header */}
                        <View className="flex-row items-center justify-between mb-4">
                            <View className="flex-row items-center">
                                <View className="h-10 w-10 rounded-2xl bg-amber-500/20 items-center justify-center mr-3 border border-amber-500/30">
                                    <MaterialCommunityIcons name="solar-power-variant" size={22} color="#F59E0B" />
                                </View>
                                <View>
                                    <Text className="text-xl font-black text-foreground">
                                        Share Energy
                                    </Text>
                                    <Text className="text-xs text-muted-foreground">
                                        Enter amount to share with community
                                    </Text>
                                </View>
                            </View>

                            <Pressable
                                onPress={() => setShareModalOpen(false)}
                                className="h-8 w-8 rounded-full bg-secondary items-center justify-center active:opacity-70"
                            >
                                <Feather name="x" size={18} color="#9CA3AF" />
                            </Pressable>
                        </View>

                        {/* Step 1: Available Excess Display */}
                        <View className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-3.5 mb-4">
                            <Text className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                                Available Excess Energy
                            </Text>
                            <Text className="text-2xl font-black text-foreground mt-0.5">
                                {metrics.dailyExcessKWh.toFixed(1)} kWh
                            </Text>
                        </View>

                        {/* Step 2: Enter Amount to Share */}
                        <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                            Amount to Share (kWh)
                        </Text>
                        <View className="flex-row items-center rounded-2xl bg-secondary/80 border border-border/80 px-4 py-2 mb-2">
                            <TextInput
                                keyboardType="numeric"
                                value={shareAmountInput}
                                onChangeText={setShareAmountInput}
                                className="flex-1 text-2xl font-black text-foreground py-1"
                                placeholder="0.0"
                                placeholderTextColor="#9CA3AF"
                            />
                            <Text className="text-sm font-black text-amber-500 ml-2">
                                kWh
                            </Text>
                        </View>

                        {/* Quick Presets */}
                        <View className="flex-row items-center justify-between gap-2 mb-4">
                            {[
                                { label: '25%', frac: 0.25 },
                                { label: '50%', frac: 0.5 },
                                { label: '75%', frac: 0.75 },
                                { label: 'All', frac: 1.0 },
                            ].map((preset) => (
                                <Pressable
                                    key={preset.label}
                                    onPress={() => handlePreset(preset.frac)}
                                    className="flex-1 py-1.5 rounded-xl bg-secondary border border-border/60 items-center active:opacity-80"
                                >
                                    <Text className="text-xs font-bold text-foreground">
                                        {preset.label}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>

                        {/* Step 3: Show Remaining Energy */}
                        <View className="rounded-2xl bg-secondary/40 p-3 border border-border/60 mb-4 flex-row items-center justify-between">
                            <Text className="text-xs text-muted-foreground">
                                Remaining Home Reserve:
                            </Text>
                            <Text className="text-xs font-bold text-foreground">
                                {remainingAfterShare.toFixed(1)} kWh
                            </Text>
                        </View>

                        {/* Target Pool */}
                        <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                            Recipient / Pool
                        </Text>
                        <View className="gap-2 mb-5">
                            {[
                                { name: 'Co-Op Community Pool', desc: 'Mutual aid for neighboring households ($0.14/kWh credit)' },
                                { name: 'Emergency Clinic Reserve', desc: 'Priority medical backup power aid' },
                            ].map((pool) => (
                                <Pressable
                                    key={pool.name}
                                    onPress={() => setSelectedPool(pool.name)}
                                    className={`rounded-2xl p-3 border ${
                                        selectedPool === pool.name
                                            ? 'bg-amber-500/10 border-amber-500'
                                            : 'bg-secondary/40 border-border/50'
                                    }`}
                                >
                                    <Text
                                        className={`text-xs font-bold ${
                                            selectedPool === pool.name ? 'text-amber-500' : 'text-foreground'
                                        }`}
                                    >
                                        {pool.name}
                                    </Text>
                                    <Text className="text-[10px] text-muted-foreground mt-0.5">
                                        {pool.desc}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>

                        {/* Manager Routing Notice */}
                        <View className="flex-row items-center rounded-xl bg-blue-500/10 border border-blue-500/20 px-3 py-2 mb-4">
                            <Feather name="shield" size={14} color="#3B82F6" style={{ marginRight: 6 }} />
                            <Text className="text-[11px] text-blue-500 font-medium flex-1">
                                Share offers are reviewed and dispatched by the Co-Op Manager.
                            </Text>
                        </View>

                        {/* Confirm Share Button */}
                        <Pressable
                            onPress={handleShareSubmit}
                            className="w-full rounded-2xl bg-primary py-4 items-center justify-center shadow-lg active:opacity-90 mb-4"
                        >
                            <Text className="text-base font-black text-primary-foreground">
                                Submit Offer to Manager ({shareAmountInput} kWh)
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default SolarOwnerShare;
