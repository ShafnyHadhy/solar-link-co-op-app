import TabScreenBackground from '@/components/shared/TabScreenBackground';
import { useUser } from '@clerk/expo';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SolarToast } from '../shared/SolarToast';
import { ViewHeader } from '../shared/ViewHeader';
import { useSolarOwnerStore } from '../store/useSolarOwnerStore';

export const SolarOwnerShare = () => {
    const insets = useSafeAreaInsets();
    const { user } = useUser();
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
        solarOffers,
        fetchSolarData,
        fetchSolarOffers,
        fetchCommunityRequests,
        cancelSolarOfferAction,
    } = useSolarOwnerStore();

    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [shareAmountInput, setShareAmountInput] = useState<string>('3.5');
    const [selectedPool, setSelectedPool] = useState<string>('Co-Op Community Pool');
    const [offerFilter, setOfferFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'cancelled'>('all');
    const [cancellingOfferId, setCancellingOfferId] = useState<string | null>(null);

    useEffect(() => {
        if (user?.id) {
            fetchSolarData(user.id);
            fetchSolarOffers(user.id);
            fetchCommunityRequests();
        }
    }, [user?.id]);

    const enteredVal = parseFloat(shareAmountInput) || 0;
    const remainingAfterShare = Math.max(0, metrics.dailyExcessKWh - enteredVal);

    const handleShareSubmit = async () => {
        if (enteredVal <= 0 || enteredVal > metrics.dailyExcessKWh) return;
        const success = await shareEnergyWithCommunity(enteredVal, selectedPool, user?.id);
        if (success) {
            setShareModalOpen(false);
        }
    };

    const handleCancelOffer = async (offerId: string) => {
        if (!user?.id) return;
        setCancellingOfferId(offerId);
        await cancelSolarOfferAction(offerId, user.id);
        setCancellingOfferId(null);
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
                    <View className="flex-row items-center justify-between mb-2 gap-2">
                        <View className="flex-row items-center flex-1 mr-2 min-w-0">
                            <View className="h-8 w-8 rounded-xl bg-amber-500/20 items-center justify-center mr-2 flex-shrink-0">
                                <MaterialCommunityIcons name="lightning-bolt" size={18} color="#F59E0B" />
                            </View>
                            <Text className="text-xs font-bold uppercase tracking-wider text-amber-500" numberOfLines={1}>
                                Available to Share
                            </Text>
                        </View>
                        <Text className="text-xs font-semibold text-muted-foreground flex-shrink-0">
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
                    <View className="pt-3 border-t border-border/50 flex-row items-center justify-between gap-2">
                        <View className="flex-row items-center flex-1 mr-2 min-w-0">
                            <Feather name="zap" size={16} color="#10B981" style={{ flexShrink: 0 }} />
                            <View className="ml-2 flex-1 min-w-0">
                                <Text className="text-xs font-bold text-foreground" numberOfLines={1}>
                                    Auto-Share Excess
                                </Text>
                                <Text className="text-[10px] text-muted-foreground" numberOfLines={1}>
                                    Export surplus when battery &gt; 75%
                                </Text>
                            </View>
                        </View>

                        <Pressable
                            onPress={toggleAutoShare}
                            className={`px-3 py-1.5 rounded-full border flex-shrink-0 ${
                                autoShareEnabled
                                    ? 'bg-emerald-500 border-emerald-600'
                                    : 'bg-secondary border-border'
                            }`}
                        >
                            <Text
                                className={`text-xs font-bold ${
                                    autoShareEnabled ? 'text-white' : 'text-foreground'
                                }`}
                            >
                                {autoShareEnabled ? 'Active' : 'Off'}
                            </Text>
                        </Pressable>
                    </View>
                </View>

                {/* 2. TRANSPARENCY & COMMUNITY IMPACT METRICS */}
                <View className="rounded-[28px] border border-border/70 bg-card/85 dark:bg-card/50 p-4 mb-5 shadow-sm">
                    <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5" numberOfLines={1}>
                        Transparency & Contribution Record
                    </Text>
                    <View className="flex-row items-center justify-between gap-1">
                        <View className="items-center flex-1 min-w-0">
                            <Text className="text-[10px] font-bold uppercase text-muted-foreground" numberOfLines={1}>
                                Total Shared
                            </Text>
                            <Text className="text-base font-black text-amber-500 mt-0.5" numberOfLines={1}>
                                {totalSharedKWh.toFixed(1)} kWh
                            </Text>
                        </View>

                        <View className="items-center flex-1 min-w-0 border-x border-border/40 px-1">
                            <Text className="text-[10px] font-bold uppercase text-muted-foreground" numberOfLines={1}>
                                Households
                            </Text>
                            <Text className="text-base font-black text-foreground mt-0.5" numberOfLines={1}>
                                {uniqueHouseholdsSupported} Supp.
                            </Text>
                        </View>

                        <View className="items-center flex-1 min-w-0">
                            <Text className="text-[10px] font-bold uppercase text-muted-foreground" numberOfLines={1}>
                                Total Credits
                            </Text>
                            <Text className="text-base font-black text-emerald-500 mt-0.5" numberOfLines={1}>
                                +${totalCreditsEarned.toFixed(2)}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* 3. MY SUBMITTED OFFERS (Manager Review & Dispatch Lifecycle) */}
                <View className="rounded-[28px] border border-border/70 bg-card/85 dark:bg-card/50 p-5 mb-5 shadow-sm">
                    <View className="flex-row items-center justify-between mb-3 gap-2">
                        <View className="flex-1 mr-2 min-w-0">
                            <View className="flex-row items-center gap-1.5 mb-0.5">
                                <Text className="text-base font-bold text-foreground" numberOfLines={1}>
                                    My Submitted Offers
                                </Text>
                                <View className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                            </View>
                            <Text className="text-xs text-muted-foreground font-medium" numberOfLines={1}>
                                Co-Op Manager review & dispatch status
                            </Text>
                        </View>
                        <View className="bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30 flex-shrink-0">
                            <Text className="text-[10px] font-black text-amber-500">
                                {solarOffers.filter((o) => o.status === 'pending').length} Pending
                            </Text>
                        </View>
                    </View>

                    {/* Filter Pills */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-3.5 pb-1">
                        {(['all', 'pending', 'approved', 'rejected', 'cancelled'] as const).map((filter) => {
                            const isSelected = offerFilter === filter;
                            const count = filter === 'all' ? solarOffers.length : solarOffers.filter((o) => o.status === filter).length;
                            return (
                                <Pressable
                                    key={filter}
                                    onPress={() => setOfferFilter(filter)}
                                    className={`px-3 py-1.5 rounded-full mr-2 border flex-row items-center active:opacity-80 ${
                                        isSelected
                                            ? 'bg-amber-500 border-amber-600'
                                            : 'bg-secondary/60 border-border/60'
                                    }`}
                                >
                                    <Text
                                        className={`text-[11px] font-bold capitalize ${
                                            isSelected ? 'text-amber-950 font-black' : 'text-foreground'
                                        }`}
                                    >
                                        {filter}
                                    </Text>
                                    <View
                                        className={`ml-1.5 px-1.5 py-0.2 rounded-full ${
                                            isSelected ? 'bg-amber-600/30' : 'bg-background/80'
                                        }`}
                                    >
                                        <Text
                                            className={`text-[9px] font-black ${
                                                isSelected ? 'text-amber-950' : 'text-muted-foreground'
                                            }`}
                                        >
                                            {count}
                                        </Text>
                                    </View>
                                </Pressable>
                            );
                        })}
                    </ScrollView>

                    {/* Offers List */}
                    {(() => {
                        const formatDisplayOfferId = (id: string): string => {
                            if (!id) return '#OFR-1001';
                            const demoMatch = id.match(/demo_(\d+)/i);
                            if (demoMatch) return `#OFR-0${demoMatch[1]}`;
                            const parts = id.split('_');
                            const lastPart = parts[parts.length - 1];
                            if (lastPart && lastPart.length >= 3 && lastPart.length <= 6) {
                                return `#OFR-${lastPart.toUpperCase()}`;
                            }
                            const clean = id.replace(/[^a-zA-Z0-9]/g, '');
                            const suffix = clean.slice(-4).toUpperCase();
                            return `#OFR-${suffix || '1001'}`;
                        };

                        const filtered = solarOffers.filter(
                            (o) => offerFilter === 'all' || o.status === offerFilter
                        );

                        if (filtered.length === 0) {
                            return (
                                <View className="rounded-2xl border border-dashed border-border/70 p-6 items-center justify-center bg-secondary/15 my-1">
                                    <MaterialCommunityIcons name="solar-power-variant" size={28} color="#9CA3AF" />
                                    <Text className="text-xs font-bold text-foreground mt-2">
                                        No {offerFilter !== 'all' ? offerFilter : ''} solar offers found
                                    </Text>
                                    <Text className="text-[10px] text-muted-foreground mt-0.5 text-center">
                                        Submit excess energy to create a new sharing offer.
                                    </Text>
                                    <Pressable
                                        onPress={() => setShareModalOpen(true)}
                                        className="mt-3 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 active:opacity-80"
                                    >
                                        <Text className="text-xs font-bold text-amber-500">
                                            + Create Sharing Offer
                                        </Text>
                                    </Pressable>
                                </View>
                            );
                        }

                        return (
                            <View className="gap-2.5">
                                {filtered.map((offer) => {
                                    const isPending = offer.status === 'pending';
                                    const isApproved = offer.status === 'approved';
                                    const isRejected = offer.status === 'rejected';
                                    const isCancelled = offer.status === 'cancelled';
                                    const isCancelling = cancellingOfferId === offer.id;

                                    const dateStr = offer.offeredAt
                                        ? new Date(offer.offeredAt).toLocaleDateString(undefined, {
                                              month: 'short',
                                              day: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit',
                                          })
                                        : 'Today';

                                    const statusBadge = isPending
                                        ? { bg: 'bg-amber-500/15 border-amber-500/40', text: 'text-amber-500', color: '#F59E0B', icon: 'clock' as const, label: 'Pending' }
                                        : isApproved
                                        ? { bg: 'bg-emerald-500/15 border-emerald-500/40', text: 'text-emerald-500', color: '#10B981', icon: 'check-circle' as const, label: 'Approved' }
                                        : isRejected
                                        ? { bg: 'bg-destructive/15 border-destructive/40', text: 'text-destructive', color: '#EF4444', icon: 'alert-circle' as const, label: 'Rejected' }
                                        : isCancelled
                                        ? { bg: 'bg-secondary border-border/80', text: 'text-muted-foreground', color: '#94A3B8', icon: 'slash' as const, label: 'Cancelled' }
                                        : { bg: 'bg-sky-500/15 border-sky-500/40', text: 'text-sky-500', color: '#0EA5E9', icon: 'zap' as const, label: 'Completed' };

                                    return (
                                        <View
                                            key={offer.id}
                                            className="rounded-2xl border border-border/60 bg-secondary/30 p-3.5 mb-1"
                                        >
                                            {/* Row 1: Amount & Short Status Badge */}
                                            <View className="flex-row items-center justify-between mb-2">
                                                <View className="flex-row items-center flex-1 mr-2">
                                                    <View className="h-8 w-8 rounded-xl bg-amber-500/20 items-center justify-center mr-2.5 border border-amber-500/30">
                                                        <Feather name="upload" size={14} color="#F59E0B" />
                                                    </View>
                                                    <View className="flex-1">
                                                        <Text className="text-sm font-black text-foreground" numberOfLines={1}>
                                                            {Number(offer.energyAmountKwh).toFixed(1)} kWh Offer
                                                        </Text>
                                                        <Text className="text-[11px] font-bold text-amber-500">
                                                            {formatDisplayOfferId(offer.id)}
                                                        </Text>
                                                    </View>
                                                </View>

                                                <View className={`flex-row items-center px-2.5 py-0.5 rounded-full border ${statusBadge.bg}`}>
                                                    <Feather name={statusBadge.icon} size={11} color={statusBadge.color} style={{ marginRight: 4 }} />
                                                    <Text className={`text-[10px] font-bold ${statusBadge.text}`}>
                                                        {statusBadge.label}
                                                    </Text>
                                                </View>
                                            </View>

                                            {/* Row 2: Metadata (Date & Safety Reserve) */}
                                            <View className="flex-row items-center justify-between py-1.5 border-t border-border/30">
                                                <View className="flex-row items-center">
                                                    <Feather name="calendar" size={11} color="#9CA3AF" style={{ marginRight: 4 }} />
                                                    <Text className="text-[11px] text-muted-foreground font-medium">
                                                        {dateStr}
                                                    </Text>
                                                </View>

                                                <Text className="text-[11px] text-muted-foreground font-medium">
                                                    Reserve: {offer.minimumBatteryPercent ? `${Number(offer.minimumBatteryPercent).toFixed(0)}% Min` : '75% Min'}
                                                </Text>
                                            </View>

                                            {/* Row 3: Action Button (only if pending) */}
                                            {isPending && (
                                                <View className="pt-2 border-t border-border/30 flex-row justify-end">
                                                    <Pressable
                                                        onPress={() => handleCancelOffer(offer.id)}
                                                        disabled={isCancelling}
                                                        className="px-3.5 py-1.5 rounded-xl bg-red-600 border border-red-700 active:bg-red-700 flex-row items-center shadow-sm"
                                                    >
                                                        <Feather name="x-circle" size={13} color="#FFFFFF" style={{ marginRight: 5 }} />
                                                        <Text className="text-xs font-black text-white">
                                                            {isCancelling ? 'Cancelling...' : 'Cancel Offer'}
                                                        </Text>
                                                    </Pressable>
                                                </View>
                                            )}
                                        </View>
                                    );
                                })}
                            </View>
                        );
                    })()}
                </View>

                {/* 4. INCOMING COMMUNITY ENERGY REQUESTS */}
                <View className="rounded-[28px] border border-border/70 bg-card/85 dark:bg-card/50 p-5 mb-5 shadow-sm">
                    <View className="flex-row items-center justify-between mb-4 gap-2">
                        <View className="flex-1 mr-2 min-w-0">
                            <Text className="text-base font-bold text-foreground" numberOfLines={1}>
                                Incoming Requests
                            </Text>
                            <Text className="text-xs text-muted-foreground font-medium" numberOfLines={1}>
                                Requests from neighborhood households
                            </Text>
                        </View>
                        <View className="bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/30 flex-shrink-0">
                            <Text className="text-[10px] font-black text-amber-500">
                                {communityRequests.filter((r) => r.status === 'pending').length} Pending
                            </Text>
                        </View>
                    </View>

                    {communityRequests.length === 0 ? (
                        <View className="rounded-2xl border border-dashed border-border/70 p-6 items-center justify-center bg-secondary/15 my-1">
                            <MaterialCommunityIcons name="account-group-outline" size={28} color="#9CA3AF" />
                            <Text className="text-xs font-bold text-foreground mt-2">
                                No incoming community requests
                            </Text>
                            <Text className="text-[10px] text-muted-foreground mt-0.5 text-center">
                                Real household requests will appear here automatically.
                            </Text>
                        </View>
                    ) : (
                        communityRequests.map((req) => {
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
                                                {req.timestamp || 'Today'}
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
                                                className="flex-1 rounded-xl bg-red-500/20 border border-red-500/50 py-2.5 items-center active:opacity-70"
                                            >
                                                <Text className="text-xs font-bold text-red-500">
                                                    Reject
                                                </Text>
                                            </Pressable>

                                            <Pressable
                                                onPress={() => acceptRequest(req.id, user?.id)}
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
                        })
                    )}
                </View>

                {/* 4. TRANSPARENT SHARING HISTORY */}
                <View className="rounded-[28px] border border-border/70 bg-card/85 dark:bg-card/50 p-5 mb-5 shadow-sm">
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-1 mr-2">
                            <View className="flex-row items-center gap-2">
                                <Text className="text-base font-bold text-foreground">
                                    Sharing History
                                </Text>
                                <View className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30">
                                    <Text className="text-[10px] font-bold text-emerald-500">
                                        {sharingHistory.length} Completed
                                    </Text>
                                </View>
                            </View>
                            <Text className="text-xs text-muted-foreground font-medium">
                                Transparent records of dispatched energy
                            </Text>
                        </View>
                        <Feather name="clock" size={16} color="#9CA3AF" />
                    </View>

                    <View className="divide-y divide-border/40">
                        {sharingHistory.length === 0 ? (
                            <View className="py-8 items-center justify-center">
                                <View className="h-12 w-12 rounded-2xl bg-secondary/80 items-center justify-center mb-2.5">
                                    <Feather name="inbox" size={22} color="#9CA3AF" />
                                </View>
                                <Text className="text-xs font-bold text-foreground mb-1">
                                    No Sharing History Yet
                                </Text>
                                <Text className="text-[11px] text-muted-foreground text-center px-4">
                                    Completed energy dispatches and earned credits will appear here automatically.
                                </Text>
                            </View>
                        ) : (
                            sharingHistory.map((item) => (
                                <View key={item.id} className="py-3.5 flex-row items-center justify-between">
                                    <View className="flex-row items-center flex-1 mr-2">
                                        <View className="h-9 w-9 rounded-xl bg-emerald-500/15 items-center justify-center mr-2.5 border border-emerald-500/30">
                                            <Feather name="arrow-up-right" size={17} color="#10B981" />
                                        </View>
                                        <View className="flex-1">
                                            <View className="flex-row items-center gap-1.5 flex-wrap">
                                                <Text className="text-xs font-bold text-foreground" numberOfLines={1}>
                                                    {item.recipientName}
                                                </Text>
                                                <View className="px-1.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                                                    <Text className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                                                        {(item.co2SavedKg || +(item.amountKWh * 0.4).toFixed(1))} kg CO₂
                                                    </Text>
                                                </View>
                                            </View>
                                            <Text className="text-[10px] text-muted-foreground mt-0.5">
                                                {item.date} • {item.time || 'Completed'}
                                            </Text>
                                        </View>
                                    </View>

                                    <View className="items-end">
                                        <Text className="text-xs font-black text-amber-500">
                                            {item.amountKWh} kWh
                                        </Text>
                                        <Text className="text-[10px] font-bold text-emerald-500 mt-0.5">
                                            +${item.creditsEarnedUSD.toFixed(2)}
                                        </Text>
                                    </View>
                                </View>
                            ))
                        )}
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
