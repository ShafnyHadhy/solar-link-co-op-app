import TabScreenBackground from '@/components/shared/TabScreenBackground';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useManagerStore } from '../store/useManagerStore';
import { HouseholdDemandRequest, SolarShareOffer } from '../types/manager.types';

type FilterType = 'all' | 'offers' | 'demands' | 'history';

export const ManagerEnergyRequests = () => {
    const {
        metrics,
        solarOffers,
        householdRequests,
        dispatchHistory,
        toastMessage,
        toastType,
        hideToast,
        approveOffer,
        rejectOffer,
        dispatchSolarToRequest,
        rejectHouseholdRequest,
    } = useManagerStore();

    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const [selectedDemandForDispatch, setSelectedDemandForDispatch] = useState<HouseholdDemandRequest | null>(null);

    const pendingOffers = solarOffers.filter((o) => o.status === 'pending_approval');
    const pendingDemands = householdRequests.filter((d) => d.status === 'pending');

    const handleQuickDispatch = (demand: HouseholdDemandRequest) => {
        dispatchSolarToRequest(demand.id);
        setSelectedDemandForDispatch(null);
    };

    const handleOfferBasedDispatch = (demandId: string, offerId: string) => {
        dispatchSolarToRequest(demandId, offerId);
        setSelectedDemandForDispatch(null);
    };

    return (
        <View className="flex-1 bg-background">
            <TabScreenBackground />

            {/* Custom Toast */}
            {toastMessage && (
                <View className="absolute top-12 left-5 right-5 z-50">
                    <View
                        className={`flex-row items-center justify-between p-4 rounded-2xl border shadow-xl ${
                            toastType === 'success'
                                ? 'bg-emerald-950/90 border-emerald-500/50'
                                : toastType === 'warning'
                                ? 'bg-amber-950/90 border-amber-500/50'
                                : 'bg-slate-900/90 border-blue-500/50'
                        }`}
                    >
                        <View className="flex-row items-center flex-1 mr-2">
                            <Feather
                                name={toastType === 'success' ? 'check-circle' : 'info'}
                                size={20}
                                color={toastType === 'success' ? '#10B981' : '#38BDF8'}
                            />
                            <Text className="ml-3 text-sm font-semibold text-white flex-1">
                                {toastMessage}
                            </Text>
                        </View>
                        <Pressable onPress={hideToast} className="p-1">
                            <Feather name="x" size={18} color="#94A3B8" />
                        </Pressable>
                    </View>
                </View>
            )}

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
            >
                {/* Header */}
                <View className="mb-5">
                    <View className="flex-row items-center justify-between">
                        <View>
                            <Text className="text-2xl font-black text-foreground">
                                Energy Management Hub
                            </Text>
                            <Text className="text-xs text-muted-foreground font-medium mt-0.5">
                                Review solar offers, balance grid & dispatch power
                            </Text>
                        </View>
                        <View className="h-10 w-10 rounded-2xl bg-primary/20 items-center justify-center border border-primary/30">
                            <MaterialCommunityIcons name="transmission-tower" size={22} color="#F59E0B" />
                        </View>
                    </View>
                </View>

                {/* 1. GRID STATUS & SUPPLY VS DEMAND METRICS */}
                <View className="rounded-[28px] border-2 border-primary/40 bg-card/90 dark:bg-card/60 p-5 mb-5 shadow-lg">
                    <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center">
                            <View className="h-3 w-3 rounded-full bg-emerald-500 mr-2" />
                            <Text className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                                Microgrid Balanced • {metrics.gridStabilityScore}% Stability
                            </Text>
                        </View>
                        <Text className="text-xs font-semibold text-muted-foreground">
                            CO₂ Saved: {metrics.co2OffsetTodayKg}kg
                        </Text>
                    </View>

                    <View className="flex-row items-center justify-between gap-3 mb-3">
                        <View className="flex-1 rounded-2xl bg-amber-500/10 border border-amber-500/20 p-3">
                            <Text className="text-[11px] font-bold text-amber-500 uppercase">
                                Solar Inflow
                            </Text>
                            <Text className="text-xl font-black text-foreground mt-0.5">
                                {metrics.totalSolarInflowKWh} <Text className="text-xs font-bold text-amber-500">kWh</Text>
                            </Text>
                            <Text className="text-[10px] text-muted-foreground mt-1">
                                {solarOffers.length} Active Solar Offers
                            </Text>
                        </View>

                        <View className="flex-1 rounded-2xl bg-blue-500/10 border border-blue-500/20 p-3">
                            <Text className="text-[11px] font-bold text-blue-500 uppercase">
                                Active Reserve
                            </Text>
                            <Text className="text-xl font-black text-foreground mt-0.5">
                                {metrics.communityReserveKWh} <Text className="text-xs font-bold text-blue-500">kWh</Text>
                            </Text>
                            <Text className="text-[10px] text-muted-foreground mt-1">
                                Ready for allocation
                            </Text>
                        </View>

                        <View className="flex-1 rounded-2xl bg-purple-500/10 border border-purple-500/20 p-3">
                            <Text className="text-[11px] font-bold text-purple-500 uppercase">
                                Allocated
                            </Text>
                            <Text className="text-xl font-black text-foreground mt-0.5">
                                {metrics.totalAllocatedKWh} <Text className="text-xs font-bold text-purple-500">kWh</Text>
                            </Text>
                            <Text className="text-[10px] text-muted-foreground mt-1">
                                Dispatched to needs
                            </Text>
                        </View>
                    </View>
                </View>

                {/* 2. FILTER TABS */}
                <View className="flex-row items-center justify-between bg-secondary/50 p-1.5 rounded-2xl border border-border/60 mb-5">
                    {[
                        { key: 'all', label: 'All', count: pendingOffers.length + pendingDemands.length },
                        { key: 'offers', label: 'Solar Offers', count: pendingOffers.length },
                        { key: 'demands', label: 'Demands', count: pendingDemands.length },
                        { key: 'history', label: 'Dispatched', count: dispatchHistory.length },
                    ].map((tab) => (
                        <Pressable
                            key={tab.key}
                            onPress={() => setActiveFilter(tab.key as FilterType)}
                            className={`flex-1 py-2 rounded-xl items-center flex-row justify-center ${
                                activeFilter === tab.key
                                    ? 'bg-primary shadow-sm'
                                    : 'bg-transparent'
                            }`}
                        >
                            <Text
                                className={`text-xs font-bold ${
                                    activeFilter === tab.key
                                        ? 'text-primary-foreground'
                                        : 'text-muted-foreground'
                                }`}
                            >
                                {tab.label}
                            </Text>
                            {tab.count > 0 && (
                                <View
                                    className={`ml-1 px-1.5 py-0.2 rounded-full ${
                                        activeFilter === tab.key
                                            ? 'bg-primary-foreground/20'
                                            : 'bg-primary/20'
                                    }`}
                                >
                                    <Text
                                        className={`text-[10px] font-black ${
                                            activeFilter === tab.key
                                                ? 'text-primary-foreground'
                                                : 'text-primary'
                                        }`}
                                    >
                                        {tab.count}
                                    </Text>
                                </View>
                            )}
                        </Pressable>
                    ))}
                </View>

                {/* 3. SOLAR SHARE OFFERS (SUPPLY) */}
                {(activeFilter === 'all' || activeFilter === 'offers') && (
                    <View className="mb-6">
                        <View className="flex-row items-center justify-between mb-3">
                            <View className="flex-row items-center">
                                <MaterialCommunityIcons name="solar-power" size={18} color="#F59E0B" />
                                <Text className="text-sm font-black uppercase tracking-wider text-foreground ml-2">
                                    Solar Share Offers ({solarOffers.length})
                                </Text>
                            </View>
                            <Text className="text-xs text-amber-500 font-bold">
                                {pendingOffers.length} Pending Approval
                            </Text>
                        </View>

                        {solarOffers.map((offer) => (
                            <View
                                key={offer.id}
                                className="rounded-2xl border border-border/80 bg-card p-4 mb-3 shadow-sm"
                            >
                                <View className="flex-row items-start justify-between mb-2">
                                    <View className="flex-1 mr-2">
                                        <View className="flex-row items-center">
                                            <Text className="text-sm font-bold text-foreground">
                                                {offer.solarOwnerName}
                                            </Text>
                                            <View className="ml-2 px-2 py-0.5 rounded-full bg-secondary">
                                                <Text className="text-[10px] text-muted-foreground font-semibold">
                                                    Battery: {offer.batteryLevelPercent}%
                                                </Text>
                                            </View>
                                        </View>
                                        <Text className="text-xs text-muted-foreground mt-0.5">
                                            {offer.solarOwnerAddress}
                                        </Text>
                                    </View>

                                    {/* Status Badge */}
                                    <View
                                        className={`px-2.5 py-1 rounded-xl ${
                                            offer.status === 'pending_approval'
                                                ? 'bg-amber-500/20 border border-amber-500/30'
                                                : offer.status === 'approved'
                                                ? 'bg-emerald-500/20 border border-emerald-500/30'
                                                : offer.status === 'allocated'
                                                ? 'bg-blue-500/20 border border-blue-500/30'
                                                : 'bg-rose-500/20 border border-rose-500/30'
                                        }`}
                                    >
                                        <Text
                                            className={`text-[10px] font-bold uppercase ${
                                                offer.status === 'pending_approval'
                                                    ? 'text-amber-500'
                                                    : offer.status === 'approved'
                                                    ? 'text-emerald-500'
                                                    : offer.status === 'allocated'
                                                    ? 'text-blue-500'
                                                    : 'text-rose-500'
                                            }`}
                                        >
                                            {offer.status === 'pending_approval'
                                                ? 'Pending Review'
                                                : offer.status === 'approved'
                                                ? 'In Reserve Pool'
                                                : offer.status === 'allocated'
                                                ? 'Allocated'
                                                : 'Declined'}
                                        </Text>
                                    </View>
                                </View>

                                {/* Pool Target & Energy Offer */}
                                <View className="rounded-xl bg-secondary/60 p-2.5 my-2 flex-row items-center justify-between">
                                    <View>
                                        <Text className="text-[10px] uppercase font-bold text-muted-foreground">
                                            Destination Pool
                                        </Text>
                                        <Text className="text-xs font-bold text-foreground">
                                            {offer.destinationPool}
                                        </Text>
                                    </View>
                                    <View className="items-end">
                                        <Text className="text-[10px] uppercase font-bold text-muted-foreground">
                                            Offered Surplus
                                        </Text>
                                        <Text className="text-sm font-black text-amber-500">
                                            {offer.amountKWh} kWh (${offer.offeredRateUSDPerKWh}/kWh)
                                        </Text>
                                    </View>
                                </View>

                                {offer.notes && (
                                    <Text className="text-xs text-muted-foreground italic mb-3">
                                        "{offer.notes}"
                                    </Text>
                                )}

                                {/* Action Buttons */}
                                {offer.status === 'pending_approval' && (
                                    <View className="flex-row items-center gap-2 pt-2 border-t border-border/40">
                                        <Pressable
                                            onPress={() => approveOffer(offer.id)}
                                            className="flex-1 py-2.5 rounded-xl bg-emerald-600 items-center active:opacity-80 flex-row justify-center"
                                        >
                                            <Feather name="check" size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                                            <Text className="text-xs font-black text-white">
                                                Approve & Add to Pool
                                            </Text>
                                        </Pressable>
                                        <Pressable
                                            onPress={() => rejectOffer(offer.id)}
                                            className="px-3 py-2.5 rounded-xl bg-secondary border border-border/80 items-center active:opacity-80"
                                        >
                                            <Feather name="x" size={14} color="#EF4444" />
                                        </Pressable>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* 4. HOUSEHOLD DEMANDS (DEMAND) */}
                {(activeFilter === 'all' || activeFilter === 'demands') && (
                    <View className="mb-6">
                        <View className="flex-row items-center justify-between mb-3">
                            <View className="flex-row items-center">
                                <MaterialCommunityIcons name="home-lightning-bolt" size={18} color="#3B82F6" />
                                <Text className="text-sm font-black uppercase tracking-wider text-foreground ml-2">
                                    Community Energy Demands ({householdRequests.length})
                                </Text>
                            </View>
                            <Text className="text-xs text-blue-500 font-bold">
                                {pendingDemands.length} Pending Dispatch
                            </Text>
                        </View>

                        {householdRequests.map((demand) => (
                            <View
                                key={demand.id}
                                className={`rounded-2xl border bg-card p-4 mb-3 shadow-sm ${
                                    demand.urgency === 'critical'
                                        ? 'border-rose-500/60 bg-rose-500/5'
                                        : 'border-border/80'
                                }`}
                            >
                                <View className="flex-row items-start justify-between mb-2">
                                    <View className="flex-1 mr-2">
                                        <View className="flex-row items-center">
                                            <Text className="text-sm font-bold text-foreground">
                                                {demand.requesterName}
                                            </Text>
                                            {demand.urgency === 'critical' && (
                                                <View className="ml-2 px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40">
                                                    <Text className="text-[10px] text-rose-500 font-black uppercase">
                                                        Critical Medical
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                        <Text className="text-xs text-muted-foreground mt-0.5">
                                            {demand.requesterAddress}
                                        </Text>
                                    </View>

                                    <View
                                        className={`px-2.5 py-1 rounded-xl ${
                                            demand.status === 'pending'
                                                ? 'bg-amber-500/20 border border-amber-500/30'
                                                : demand.status === 'dispatched'
                                                ? 'bg-emerald-500/20 border border-emerald-500/30'
                                                : 'bg-slate-500/20'
                                        }`}
                                    >
                                        <Text
                                            className={`text-[10px] font-bold uppercase ${
                                                demand.status === 'pending'
                                                    ? 'text-amber-500'
                                                    : demand.status === 'dispatched'
                                                    ? 'text-emerald-500'
                                                    : 'text-slate-400'
                                            }`}
                                        >
                                            {demand.status === 'pending' ? 'Needs Solar' : 'Dispatched ✓'}
                                        </Text>
                                    </View>
                                </View>

                                <Text className="text-xs font-semibold text-foreground/80 mb-2">
                                    Purpose: {demand.purpose}
                                </Text>

                                <View className="rounded-xl bg-secondary/60 p-2.5 my-1 flex-row items-center justify-between">
                                    <Text className="text-xs font-bold text-muted-foreground">
                                        Requested Amount:
                                    </Text>
                                    <Text className="text-sm font-black text-blue-500">
                                        {demand.amountKWh} kWh (${demand.offeredRateUSDPerKWh}/kWh)
                                    </Text>
                                </View>

                                {/* Dispatch Action */}
                                {demand.status === 'pending' && (
                                    <View className="flex-row items-center gap-2 pt-3 border-t border-border/40 mt-2">
                                        <Pressable
                                            onPress={() => setSelectedDemandForDispatch(demand)}
                                            className="flex-1 py-2.5 rounded-xl bg-primary items-center active:opacity-90 flex-row justify-center shadow-sm"
                                        >
                                            <MaterialCommunityIcons name="lightning-bolt" size={16} color="#1E293B" style={{ marginRight: 6 }} />
                                            <Text className="text-xs font-black text-primary-foreground">
                                                Match & Dispatch Solar
                                            </Text>
                                        </Pressable>
                                        <Pressable
                                            onPress={() => rejectHouseholdRequest(demand.id)}
                                            className="px-3 py-2.5 rounded-xl bg-secondary border border-border/80 items-center active:opacity-80"
                                        >
                                            <Feather name="x" size={14} color="#EF4444" />
                                        </Pressable>
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* 5. RECENT DISPATCH AUDIT LOG */}
                {(activeFilter === 'all' || activeFilter === 'history') && (
                    <View className="mb-6">
                        <View className="flex-row items-center justify-between mb-3">
                            <View className="flex-row items-center">
                                <Feather name="activity" size={18} color="#10B981" />
                                <Text className="text-sm font-black uppercase tracking-wider text-foreground ml-2">
                                    Manager Dispatch Ledger ({dispatchHistory.length})
                                </Text>
                            </View>
                        </View>

                        {dispatchHistory.map((record) => (
                            <View
                                key={record.id}
                                className="rounded-2xl border border-border/70 bg-card p-3.5 mb-2.5 flex-row items-center justify-between shadow-sm"
                            >
                                <View className="flex-row items-center flex-1 mr-2">
                                    <View className="h-9 w-9 rounded-xl bg-emerald-500/10 items-center justify-center mr-3 border border-emerald-500/20">
                                        <Feather name="check" size={16} color="#10B981" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-xs font-bold text-foreground">
                                            {record.sourceName} ➔ {record.recipientName}
                                        </Text>
                                        <Text className="text-[10px] text-muted-foreground">
                                            {record.poolType} • {record.date} at {record.timestamp}
                                        </Text>
                                    </View>
                                </View>
                                <View className="items-end">
                                    <Text className="text-xs font-black text-emerald-500">
                                        {record.amountKWh} kWh
                                    </Text>
                                    <Text className="text-[10px] font-semibold text-muted-foreground">
                                        +${record.totalAmountUSD.toFixed(2)}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* DISPATCH SELECTION MODAL */}
            {selectedDemandForDispatch && (
                <Modal visible={true} transparent animationType="slide">
                    <View className="flex-1 bg-black/60 justify-end">
                        <View className="bg-card rounded-t-[36px] border-t border-border p-6 shadow-2xl">
                            <View className="flex-row items-center justify-between mb-4">
                                <View>
                                    <Text className="text-lg font-black text-foreground">
                                        Dispatch Solar Energy
                                    </Text>
                                    <Text className="text-xs text-muted-foreground">
                                        Fulfilling {selectedDemandForDispatch.amountKWh} kWh for {selectedDemandForDispatch.requesterName}
                                    </Text>
                                </View>
                                <Pressable
                                    onPress={() => setSelectedDemandForDispatch(null)}
                                    className="h-8 w-8 rounded-full bg-secondary items-center justify-center"
                                >
                                    <Feather name="x" size={18} color="#9CA3AF" />
                                </Pressable>
                            </View>

                            <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                                Select Power Source
                            </Text>

                            {/* Quick Option 1: Community Reserve */}
                            <Pressable
                                onPress={() => handleQuickDispatch(selectedDemandForDispatch)}
                                className="rounded-2xl border-2 border-primary/50 bg-primary/10 p-3.5 mb-3 active:opacity-90"
                            >
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row items-center">
                                        <MaterialCommunityIcons name="battery-charging-high" size={20} color="#F59E0B" />
                                        <View className="ml-2">
                                            <Text className="text-xs font-black text-foreground">
                                                Co-Op Community Reserve Pool
                                            </Text>
                                            <Text className="text-[10px] text-muted-foreground">
                                                Available: {metrics.communityReserveKWh} kWh
                                            </Text>
                                        </View>
                                    </View>
                                    <Text className="text-xs font-bold text-primary">
                                        Instant Dispatch ➔
                                    </Text>
                                </View>
                            </Pressable>

                            {/* Option 2: Specific Available Solar Offers */}
                            <Text className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                                Or Match Direct Solar Offer:
                            </Text>

                            <ScrollView style={{ maxHeight: 180 }} className="mb-4">
                                {solarOffers
                                    .filter((o) => o.status === 'approved' || o.status === 'pending_approval')
                                    .map((offer) => (
                                        <Pressable
                                            key={offer.id}
                                            onPress={() =>
                                                handleOfferBasedDispatch(selectedDemandForDispatch.id, offer.id)
                                            }
                                            className="rounded-xl border border-border/80 bg-secondary/50 p-3 mb-2 active:opacity-80 flex-row items-center justify-between"
                                        >
                                            <View className="flex-1 mr-2">
                                                <Text className="text-xs font-bold text-foreground">
                                                    {offer.solarOwnerName}
                                                </Text>
                                                <Text className="text-[10px] text-muted-foreground">
                                                    {offer.destinationPool} • Battery: {offer.batteryLevelPercent}%
                                                </Text>
                                            </View>
                                            <View className="items-end">
                                                <Text className="text-xs font-black text-amber-500">
                                                    {offer.amountKWh} kWh
                                                </Text>
                                                <Text className="text-[10px] text-emerald-500 font-bold">
                                                    Select ➔
                                                </Text>
                                            </View>
                                        </Pressable>
                                    ))}
                            </ScrollView>

                            <Pressable
                                onPress={() => setSelectedDemandForDispatch(null)}
                                className="w-full py-3.5 rounded-2xl bg-secondary items-center justify-center"
                            >
                                <Text className="text-xs font-bold text-muted-foreground">
                                    Cancel
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </Modal>
            )}
        </View>
    );
};

export default ManagerEnergyRequests;
