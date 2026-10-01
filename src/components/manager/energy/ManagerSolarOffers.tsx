import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native';
import { useUser } from '@clerk/expo';
import { Feather } from '@expo/vector-icons';
import type { ManagerEnergyRequest } from '@/hooks/manager/useEnergyRequests';
import {
    useSolarOffers,
    useSolarOfferDetail,
    type ManagerSolarOffer,
} from '@/hooks/manager/useSolarOffers';

function formatOfferDate(dateStr: string) {
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return dateStr;
    }
}

export function isOfferDispatchable(offer: ManagerSolarOffer): boolean {
    if (offer.status !== 'approved') return false;
    if (offer.expiresAt) {
        const expTime = new Date(offer.expiresAt).getTime();
        if (!isNaN(expTime) && expTime <= Date.now()) {
            return false;
        }
    }
    return true;
}

export function formatOfferExpiration(expiresAt: string | null | undefined): { text: string; isExpired: boolean } {
    if (!expiresAt) {
        return { text: 'No expiration date', isExpired: false };
    }
    const expDate = new Date(expiresAt);
    if (isNaN(expDate.getTime())) {
        return { text: 'No expiration date', isExpired: false };
    }
    const isExpired = expDate.getTime() <= Date.now();
    const formatted = expDate.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
    return {
        text: isExpired ? `Expired (${formatted})` : `Expires: ${formatted}`,
        isExpired,
    };
}

function getStatusBadge(status: ManagerSolarOffer['status']) {
    switch (status) {
        case 'pending':
            return {
                label: 'Pending Review',
                bg: 'bg-yellow-500/15',
                border: 'border-yellow-500/30',
                text: 'text-[#F59E0B]',
                icon: 'clock' as const,
            };
        case 'approved':
            return {
                label: 'Approved',
                bg: 'bg-emerald-500/15',
                border: 'border-emerald-500/30',
                text: 'text-[#10B981]',
                icon: 'check-circle' as const,
            };
        case 'rejected':
            return {
                label: 'Rejected',
                bg: 'bg-red-500/15',
                border: 'border-red-500/30',
                text: 'text-[#EF4444]',
                icon: 'x-circle' as const,
            };
        case 'completed':
            return {
                label: 'Completed',
                bg: 'bg-blue-500/15',
                border: 'border-blue-500/30',
                text: 'text-[#3B82F6]',
                icon: 'check' as const,
            };
        case 'cancelled':
            return {
                label: 'Cancelled',
                bg: 'bg-zinc-500/15',
                border: 'border-zinc-500/30',
                text: 'text-zinc-400',
                icon: 'slash' as const,
            };
        default:
            return {
                label: status,
                bg: 'bg-secondary',
                border: 'border-border/60',
                text: 'text-muted-foreground',
                icon: 'info' as const,
            };
    }
}

export interface ManagerSolarOffersProps {
    onRefreshTrigger?: () => void;
    offers?: ManagerSolarOffer[];
    loading?: boolean;
    error?: string | null;
    refetch?: () => Promise<void>;
    approveOffer?: (offerId: string, managerId?: string) => Promise<ManagerSolarOffer>;
    rejectOffer?: (offerId: string, managerId?: string) => Promise<ManagerSolarOffer>;
    selectedDispatchRequestId?: string | null;
    selectedRequest?: ManagerEnergyRequest | null;
    selectedDispatchOfferId?: string | null;
    confirmedAllocation?: number | null;
    onSelectOfferForDispatch?: (offer: ManagerSolarOffer | null) => void;
    onOpenAllocation?: () => void;
}

export const ManagerSolarOffers: React.FC<ManagerSolarOffersProps> = ({
    onRefreshTrigger,
    offers: propOffers,
    loading: propLoading,
    error: propError,
    refetch: propRefetch,
    approveOffer: propApproveOffer,
    rejectOffer: propRejectOffer,
    selectedDispatchRequestId,
    selectedRequest,
    selectedDispatchOfferId: propSelectedDispatchOfferId,
    confirmedAllocation,
    onSelectOfferForDispatch,
    onOpenAllocation,
}) => {
    const { user } = useUser();
    const internalHook = useSolarOffers({ enabled: propOffers === undefined });

    const offers = propOffers ?? internalHook.offers;
    const loading = propLoading ?? internalHook.loading;
    const error = propError ?? internalHook.error;
    const refetch = propRefetch ?? internalHook.refetch;
    const approveOffer = propApproveOffer ?? internalHook.approveOffer;
    const rejectOffer = propRejectOffer ?? internalHook.rejectOffer;

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

    // Modals & Selection State
    const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
    const [selectedApproveItem, setSelectedApproveItem] = useState<ManagerSolarOffer | null>(null);
    const [selectedRejectItem, setSelectedRejectItem] = useState<ManagerSolarOffer | null>(null);
    const [offerModalVisible, setOfferModalVisible] = useState(false);
    const [approveModalVisible, setApproveModalVisible] = useState(false);
    const [rejectModalVisible, setRejectModalVisible] = useState(false);

    // Action state (approval & rejection)
    const [isApproving, setIsApproving] = useState(false);
    const [approveError, setApproveError] = useState<string | null>(null);
    const [isRejecting, setIsRejecting] = useState(false);
    const [rejectError, setRejectError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Dispatch Selection State (US-12)
    const [selectedDispatchOfferId, setSelectedDispatchOfferId] = useState<string | null>(
        propSelectedDispatchOfferId ?? null
    );

    useEffect(() => {
        if (propSelectedDispatchOfferId !== undefined) {
            setSelectedDispatchOfferId(propSelectedDispatchOfferId);
        }
    }, [propSelectedDispatchOfferId]);

    const handleSelectOfferForDispatch = (offer: ManagerSolarOffer) => {
        // Enforce: Only approved, non-expired offers are dispatchable
        if (!isOfferDispatchable(offer)) return;

        const nextSelectedId = selectedDispatchOfferId === offer.id ? null : offer.id;
        const nextItem = nextSelectedId ? offer : null;

        setSelectedDispatchOfferId(nextSelectedId);
        onSelectOfferForDispatch?.(nextItem);
    };

    const selectedDispatchOffer = offers.find((o) => o.id === selectedDispatchOfferId) || null;

    const {
        offer: detailOffer,
        loading: detailLoading,
        error: detailError,
        notFound: detailNotFound,
        refetch: refetchDetail,
    } = useSolarOfferDetail(offerModalVisible ? selectedOfferId : null);

    const openOfferModal = (id: string) => {
        setSelectedOfferId(id);
        setOfferModalVisible(true);
    };

    const closeOfferModal = () => {
        setOfferModalVisible(false);
        setSelectedOfferId(null);
    };

    const openApproveModal = (item: ManagerSolarOffer) => {
        setSelectedApproveItem(item);
        setApproveError(null);
        setApproveModalVisible(true);
    };

    const openRejectModal = (item: ManagerSolarOffer) => {
        setSelectedRejectItem(item);
        setRejectError(null);
        setRejectModalVisible(true);
    };

    const handleConfirmApprove = async () => {
        if (!selectedApproveItem) return;
        setIsApproving(true);
        setApproveError(null);

        try {
            await approveOffer(selectedApproveItem.id, user?.id);
            const ownerName = selectedApproveItem.ownerName || 'Solar Producer';
            setApproveModalVisible(false);
            setSelectedApproveItem(null);
            setSuccessMessage(`Solar offer from ${ownerName} approved successfully.`);
            setTimeout(() => setSuccessMessage(null), 4000);
        } catch (err: any) {
            setApproveError(err?.message || 'Failed to approve solar offer');
        } finally {
            setIsApproving(false);
        }
    };

    const handleConfirmReject = async () => {
        if (!selectedRejectItem) return;
        setIsRejecting(true);
        setRejectError(null);

        try {
            await rejectOffer(selectedRejectItem.id, user?.id);
            const ownerName = selectedRejectItem.ownerName || 'Solar Producer';
            setRejectModalVisible(false);
            setSelectedRejectItem(null);
            setSuccessMessage(`Solar offer from ${ownerName} was declined.`);
            setTimeout(() => setSuccessMessage(null), 4000);
        } catch (err: any) {
            setRejectError(err?.message || 'Failed to reject solar offer');
        } finally {
            setIsRejecting(false);
        }
    };

    const pendingCount = offers.filter((o) => o.status === 'pending').length;
    const approvedCount = offers.filter((o) => o.status === 'approved').length;
    const rejectedCount = offers.filter((o) => o.status === 'rejected').length;

    const totalOfferedKwh = offers
        .reduce((sum, off) => sum + (parseFloat(off.energyAmountKwh) || 0), 0)
        .toFixed(1);

    const filteredOffers = offers.filter((off) => {
        const owner = (off.ownerName || '').toLowerCase();
        const email = (off.ownerEmail || '').toLowerCase();
        const query = searchQuery.toLowerCase();
        const matchesSearch = owner.includes(query) || email.includes(query);

        if (selectedFilter === 'all') return matchesSearch;
        return matchesSearch && off.status === selectedFilter;
    });

    return (
        <View className='w-full'>
            {/* Top KPI Analytics Overview */}
            <View className='flex-row gap-3 mb-5 w-full'>
                {/* Pending Offers */}
                <View className='flex-1 flex-col justify-between rounded-xl border border-border/40 bg-secondary/60 p-4 shadow-sm'>
                    <View className='flex-row items-center justify-between'>
                        <Text className='text-3xl font-extrabold text-foreground'>
                            {pendingCount}
                        </Text>
                        <View className='h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/15 border border-yellow-500/30'>
                            <Feather name="clock" size={16} color="#F59E0B" />
                        </View>
                    </View>
                    <Text className='text-xs font-semibold text-muted-foreground mt-2'>
                        Pending Offers
                    </Text>
                </View>

                {/* Total Offered Energy */}
                <View className='flex-1 flex-col justify-between rounded-xl border border-border/40 bg-secondary/60 p-4 shadow-sm'>
                    <View className='flex-row items-center justify-between'>
                        <Text className='text-3xl font-extrabold text-foreground'>
                            {totalOfferedKwh} <Text className='text-base font-bold text-muted-foreground'>kWh</Text>
                        </Text>
                        <View className='h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 border border-amber-500/30'>
                            <Feather name="sun" size={16} color="#F59E0B" />
                        </View>
                    </View>
                    <Text className='text-xs font-semibold text-muted-foreground mt-2'>
                        Total Offered Power
                    </Text>
                </View>
            </View>

            {/* Success Feedback Banner */}
            {successMessage && (
                <View className='flex-row items-center gap-2.5 py-3 px-4 rounded-xl border border-emerald-500/40 bg-emerald-500/15 mb-4 shadow-sm'>
                    <Feather name="check-circle" size={18} color="#10B981" />
                    <Text className='flex-1 text-xs font-bold text-[#10B981]'>
                        {successMessage}
                    </Text>
                    <Pressable onPress={() => setSuccessMessage(null)}>
                        <Feather name="x" size={16} color="#10B981" />
                    </Pressable>
                </View>
            )}

            {/* Search Bar */}
            <View className='flex-row items-center bg-secondary/60 border border-border/60 rounded-full px-4 py-2.5 mb-4 shadow-sm'>
                <Feather name="search" size={18} color="#9CA3AF" />
                <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search solar owner..."
                    placeholderTextColor="#9CA3AF"
                    className='flex-1 ml-2.5 text-sm font-medium text-foreground py-0.5'
                />
                {searchQuery.length > 0 && (
                    <Pressable onPress={() => setSearchQuery('')} className='p-1'>
                        <Feather name="x" size={16} color="#9CA3AF" />
                    </Pressable>
                )}
            </View>

            {/* Filter Tabs */}
            <View className='mb-5'>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 8, alignItems: 'center' }}
                    style={{ flexGrow: 0 }}
                >
                    <Pressable
                        onPress={() => setSelectedFilter('all')}
                        className={`px-4 py-2 rounded-full border ${selectedFilter === 'all'
                            ? 'bg-primary border-primary shadow-sm'
                            : 'bg-secondary/60 border-border/60 active:bg-secondary'
                            }`}
                    >
                        <Text
                            className={`text-xs font-bold ${selectedFilter === 'all'
                                ? 'text-primary-foreground'
                                : 'text-muted-foreground'
                                }`}
                        >
                            All ({offers.length})
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={() => setSelectedFilter('pending')}
                        className={`px-4 py-2 rounded-full border ${selectedFilter === 'pending'
                            ? 'bg-primary border-primary shadow-sm'
                            : 'bg-secondary/60 border-border/60 active:bg-secondary'
                            }`}
                    >
                        <Text
                            className={`text-xs font-bold ${selectedFilter === 'pending'
                                ? 'text-primary-foreground'
                                : 'text-muted-foreground'
                                }`}
                        >
                            Pending ({pendingCount})
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={() => setSelectedFilter('approved')}
                        className={`px-4 py-2 rounded-full border ${selectedFilter === 'approved'
                            ? 'bg-primary border-primary shadow-sm'
                            : 'bg-secondary/60 border-border/60 active:bg-secondary'
                            }`}
                    >
                        <Text
                            className={`text-xs font-bold ${selectedFilter === 'approved'
                                ? 'text-primary-foreground'
                                : 'text-muted-foreground'
                                }`}
                        >
                            Approved ({approvedCount})
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={() => setSelectedFilter('rejected')}
                        className={`px-4 py-2 rounded-full border ${selectedFilter === 'rejected'
                            ? 'bg-primary border-primary shadow-sm'
                            : 'bg-secondary/60 border-border/60 active:bg-secondary'
                            }`}
                    >
                        <Text
                            className={`text-xs font-bold ${selectedFilter === 'rejected'
                                ? 'text-primary-foreground'
                                : 'text-muted-foreground'
                                }`}
                        >
                            Rejected ({rejectedCount})
                        </Text>
                    </Pressable>
                </ScrollView>
            </View>

            {/* Loading State */}
            {loading && (
                <View className='items-center justify-center py-16'>
                    <ActivityIndicator size="large" color="#F59E0B" />
                    <Text className='text-xs font-semibold text-muted-foreground mt-3'>
                        Loading solar offers from producers...
                    </Text>
                </View>
            )}

            {/* API Error State */}
            {!loading && error && (
                <View className='items-center justify-center py-8 px-4 rounded-xl border border-red-500/30 bg-red-500/10 mb-4'>
                    <Feather name="alert-triangle" size={24} color="#EF4444" />
                    <Text className='text-sm font-bold text-[#EF4444] mt-2'>
                        Failed to load solar offers
                    </Text>
                    <Text className='text-xs text-muted-foreground text-center mt-1 mb-4'>
                        {error}
                    </Text>
                    <Pressable
                        onPress={refetch}
                        className='px-4 py-2 rounded-lg bg-primary active:opacity-80'
                    >
                        <Text className='text-xs font-bold text-primary-foreground'>
                            Retry
                        </Text>
                    </Pressable>
                </View>
            )}

            {/* Target Household Request Info Banner */}
            {selectedRequest && (
                <View className='mb-4 rounded-xl border border-primary/40 bg-primary/10 p-3.5 flex-row items-center justify-between shadow-sm'>
                    <View className='flex-1 mr-2'>
                        <View className='flex-row items-center gap-1.5 mb-0.5'>
                            <Feather name="send" size={13} color="#F59E0B" />
                            <Text className='text-xs font-bold text-foreground'>
                                Target Request: {selectedRequest.householdName || 'Household Member'}
                            </Text>
                        </View>
                        <Text className='text-xs text-muted-foreground' numberOfLines={1}>
                            {parseFloat(selectedRequest.requestedEnergyKwh).toFixed(1)} kWh requested • Select an approved solar offer below
                        </Text>
                    </View>
                </View>
            )}

            {/* Active Solar Offer Selection Banner */}
            {selectedDispatchOffer && (
                <View className='mb-4 rounded-xl border border-emerald-500/50 bg-emerald-500/10 p-3.5 flex-row items-center justify-between shadow-sm'>
                    <View className='flex-1 mr-2'>
                        <View className='flex-row items-center gap-1.5 mb-0.5'>
                            <Feather name="check-circle" size={13} color="#10B981" />
                            <Text className='text-xs font-bold text-foreground'>
                                Selected Solar Energy Source
                            </Text>
                        </View>
                        <Text className='text-xs text-muted-foreground' numberOfLines={1}>
                            {selectedDispatchOffer.ownerName || 'Solar Producer'} • {parseFloat(selectedDispatchOffer.energyAmountKwh).toFixed(1)} kWh available
                        </Text>
                        {confirmedAllocation !== null && confirmedAllocation !== undefined && (
                            <Text className='text-xs font-bold text-[#F59E0B] mt-1' numberOfLines={1}>
                                Allocated Amount: {confirmedAllocation.toFixed(1)} kWh
                            </Text>
                        )}
                    </View>
                    <View className='flex-col items-end gap-1.5'>
                        {selectedRequest && onOpenAllocation && (
                            <Pressable
                                onPress={onOpenAllocation}
                                className='px-2.5 py-1.5 rounded-lg bg-primary active:opacity-80'
                            >
                                <Text className='text-[11px] font-bold text-primary-foreground'>
                                    {confirmedAllocation !== null && confirmedAllocation !== undefined ? 'Edit Allocation' : 'Allocate Energy →'}
                                </Text>
                            </Pressable>
                        )}
                        <Pressable
                            onPress={() => handleSelectOfferForDispatch(selectedDispatchOffer)}
                            className='px-2.5 py-1.5 rounded-lg bg-card border border-border/60 active:opacity-75'
                        >
                            <Text className='text-[11px] font-bold text-muted-foreground'>
                                Deselect
                            </Text>
                        </Pressable>
                    </View>
                </View>
            )}

            {/* Solar Offers List */}
            {!loading && !error && (
                <View className='flex-col gap-4'>
                    {filteredOffers.map((item) => {
                        const badge = getStatusBadge(item.status);
                        const isPending = item.status === 'pending';
                        const isApproved = item.status === 'approved';
                        const isCompleted = item.status === 'completed';
                        const isCancelled = item.status === 'cancelled';
                        const isDispatchable = isOfferDispatchable(item);
                        const isSelectedForDispatch = selectedDispatchOfferId === item.id;
                        const expirationInfo = formatOfferExpiration(item.expiresAt);
                        const formattedKwh = parseFloat(item.energyAmountKwh).toFixed(1);
                        const minBattery = item.minimumBatteryPercent
                            ? `${parseFloat(item.minimumBatteryPercent).toFixed(0)}%`
                            : 'N/A';

                        return (
                            <View
                                key={item.id}
                                className={`rounded-xl border p-4 shadow-sm ${
                                    isSelectedForDispatch
                                        ? 'border-emerald-500/80 bg-emerald-500/10'
                                        : 'border-border/40 bg-secondary/60'
                                }`}
                            >
                                {/* Header Row: Owner info & Status Badge */}
                                <View className='flex-row items-center justify-between mb-3'>
                                    <View className='flex-row items-center gap-3 flex-1 mr-2'>
                                        <View className='h-10 w-10 items-center justify-center rounded-xl bg-card border border-border/60'>
                                            <Feather name="sun" size={18} color={isSelectedForDispatch ? "#10B981" : "#F59E0B"} />
                                        </View>
                                        <View className='flex-1'>
                                            <Text className='text-base font-bold text-foreground' numberOfLines={1}>
                                                {item.ownerName || 'Solar Producer'}
                                            </Text>
                                            <Text className='text-xs text-muted-foreground mt-0.5' numberOfLines={1}>
                                                {item.ownerEmail || 'Co-op Solar Producer'}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Status Badge + Selected Pill */}
                                    <View className='flex-row items-center gap-1.5'>
                                        {isSelectedForDispatch && (
                                            <View className='flex-row items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/50'>
                                                <Feather name="check" size={10} color="#10B981" />
                                                <Text className='text-[10px] font-bold text-[#10B981]'>
                                                    Selected
                                                </Text>
                                            </View>
                                        )}
                                        <View className={`flex-row items-center gap-1.5 px-2.5 py-1 rounded-full border ${badge.bg} ${badge.border}`}>
                                            <Feather name={badge.icon} size={11} color={badge.text.includes('10B981') ? '#10B981' : badge.text.includes('EF4444') ? '#EF4444' : '#F59E0B'} />
                                            <Text className={`text-[11px] font-bold ${badge.text}`}>
                                                {badge.label}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Technical Specs: Energy & Battery Reserve */}
                                <View className='flex-row items-center justify-between bg-card/60 rounded-lg p-3 border border-border/40 mb-3'>
                                    <View className='flex-1 items-start'>
                                        <Text className='text-[11px] font-semibold text-muted-foreground uppercase tracking-wider'>
                                            Offered Energy
                                        </Text>
                                        <Text className='text-base font-extrabold text-foreground mt-0.5'>
                                            {formattedKwh} <Text className='text-xs font-bold text-muted-foreground'>kWh</Text>
                                        </Text>
                                    </View>

                                    <View className='h-8 w-[1px] bg-border/40 mx-2' />

                                    <View className='flex-1 items-start'>
                                        <Text className='text-[11px] font-semibold text-muted-foreground uppercase tracking-wider'>
                                            Min Battery
                                        </Text>
                                        <View className='flex-row items-center gap-1 mt-0.5'>
                                            <Feather name="battery-charging" size={14} color="#10B981" />
                                            <Text className='text-sm font-extrabold text-foreground'>
                                                {minBattery}
                                            </Text>
                                        </View>
                                    </View>

                                    <View className='h-8 w-[1px] bg-border/40 mx-2' />

                                    <View className='flex-1 items-start'>
                                        <Text className='text-[11px] font-semibold text-muted-foreground uppercase tracking-wider'>
                                            Offered Date
                                        </Text>
                                        <Text className='text-xs font-semibold text-foreground mt-0.5' numberOfLines={1}>
                                            {formatOfferDate(item.offeredAt)}
                                        </Text>
                                    </View>
                                </View>

                                {/* Expiration Info if available */}
                                {item.expiresAt ? (
                                    <View className='flex-row items-center gap-1.5 mb-3 px-1'>
                                        <Feather
                                            name={expirationInfo.isExpired ? "alert-circle" : "clock"}
                                            size={12}
                                            color={expirationInfo.isExpired ? "#EF4444" : "#9CA3AF"}
                                        />
                                        <Text
                                            className={`text-xs ${
                                                expirationInfo.isExpired
                                                    ? 'text-red-500 font-semibold'
                                                    : 'text-muted-foreground'
                                            }`}
                                        >
                                            {expirationInfo.text}
                                        </Text>
                                    </View>
                                ) : null}

                                {/* Bottom Metadata & Action Buttons */}
                                {isPending ? (
                                    <View className='flex-row items-center justify-between pt-1'>
                                        <Pressable
                                            onPress={() => openRejectModal(item)}
                                            className='px-3.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 active:opacity-75'
                                        >
                                            <Text className='text-xs font-bold text-[#EF4444]'>
                                                Reject
                                            </Text>
                                        </Pressable>

                                        <Pressable
                                            onPress={() => openOfferModal(item.id)}
                                            className='px-3.5 py-1.5 rounded-lg bg-card border border-border/80 active:bg-secondary shadow-sm'
                                        >
                                            <Text className='text-xs font-bold text-foreground'>
                                                Details
                                            </Text>
                                        </Pressable>

                                        <Pressable
                                            onPress={() => openApproveModal(item)}
                                            className='px-3.5 py-1.5 rounded-lg bg-primary border border-primary/40 active:opacity-80 shadow-sm'
                                        >
                                            <Text className='text-xs font-bold text-primary-foreground'>
                                                Approve
                                            </Text>
                                        </Pressable>
                                    </View>
                                ) : isApproved ? (
                                    <View className='flex-row items-center justify-between pt-1'>
                                        <Pressable
                                            onPress={() => openOfferModal(item.id)}
                                            className='px-3.5 py-1.5 rounded-lg bg-card border border-border/80 active:bg-secondary shadow-sm'
                                        >
                                            <Text className='text-xs font-bold text-foreground'>
                                                Details
                                            </Text>
                                        </Pressable>

                                        {isDispatchable ? (
                                            <Pressable
                                                onPress={() => handleSelectOfferForDispatch(item)}
                                                className={`flex-row items-center gap-1.5 px-3.5 py-1.5 rounded-lg border shadow-sm active:opacity-80 ${
                                                    isSelectedForDispatch
                                                        ? 'bg-emerald-500 border-emerald-600'
                                                        : 'bg-primary border-primary/40'
                                                }`}
                                            >
                                                <Feather
                                                    name={isSelectedForDispatch ? "check" : "sun"}
                                                    size={12}
                                                    color={isSelectedForDispatch ? "#FFFFFF" : "#000000"}
                                                />
                                                <Text
                                                    className={`text-xs font-bold ${
                                                        isSelectedForDispatch
                                                            ? 'text-white'
                                                            : 'text-primary-foreground'
                                                    }`}
                                                >
                                                    {isSelectedForDispatch ? 'Selected for Dispatch' : 'Select for Dispatch'}
                                                </Text>
                                            </Pressable>
                                        ) : (
                                            <Text className='text-xs font-semibold text-red-500'>
                                                Offer expired
                                            </Text>
                                        )}
                                    </View>
                                ) : isCompleted ? (
                                    <View className='flex-row items-center justify-between pt-1'>
                                        <Text className='text-xs font-semibold text-[#3B82F6]'>
                                            Solar dispatch completed ({formattedKwh} kWh)
                                        </Text>
                                        <Pressable
                                            onPress={() => openOfferModal(item.id)}
                                            className='px-3.5 py-1.5 rounded-lg bg-card border border-border/80 active:bg-secondary shadow-sm'
                                        >
                                            <Text className='text-xs font-bold text-foreground'>
                                                Details
                                            </Text>
                                        </Pressable>
                                    </View>
                                ) : isCancelled ? (
                                    <View className='flex-row items-center justify-between pt-1'>
                                        <Text className='text-xs font-semibold text-muted-foreground'>
                                            Offer cancelled by owner
                                        </Text>
                                        <Pressable
                                            onPress={() => openOfferModal(item.id)}
                                            className='px-3.5 py-1.5 rounded-lg bg-secondary border border-border/60 active:opacity-75'
                                        >
                                            <Text className='text-xs font-bold text-foreground'>
                                                Details
                                            </Text>
                                        </Pressable>
                                    </View>
                                ) : (
                                    <View className='flex-row items-center justify-between pt-1'>
                                        <Text className='text-xs font-semibold text-[#EF4444]'>
                                            Solar offer rejected
                                        </Text>
                                        <Pressable
                                            onPress={() => openOfferModal(item.id)}
                                            className='px-3.5 py-1.5 rounded-lg bg-secondary border border-border/60 active:opacity-75'
                                        >
                                            <Text className='text-xs font-bold text-foreground'>
                                                Details
                                            </Text>
                                        </Pressable>
                                    </View>
                                )}
                            </View>
                        );
                    })}

                    {/* Empty State */}
                    {filteredOffers.length === 0 && (
                        <View className='items-center justify-center py-12 px-4'>
                            <Feather name="sun" size={32} color="#9CA3AF" />
                            <Text className='text-base font-bold text-foreground mt-3'>
                                No solar offers found
                            </Text>
                            <Text className='text-xs text-muted-foreground text-center mt-1'>
                                {searchQuery
                                    ? `No offers match "${searchQuery}"`
                                    : 'There are currently no solar offers in this category.'}
                            </Text>
                        </View>
                    )}
                </View>
            )}

            {/* 1. Individual Solar Offer Details Modal */}
            <Modal
                visible={offerModalVisible}
                transparent
                animationType="fade"
                onRequestClose={closeOfferModal}
            >
                <View className='flex-1 bg-black/60 items-center justify-center p-4'>
                    <View className='w-full max-w-sm rounded-2xl border border-border/60 bg-card p-5 shadow-lg'>
                        {/* Header */}
                        <View className='flex-row items-center justify-between mb-4'>
                            <View className='flex-1 mr-2'>
                                <Text className='text-lg font-bold text-foreground' numberOfLines={1}>
                                    {detailLoading
                                        ? 'Loading Details...'
                                        : detailNotFound
                                            ? 'Offer Not Found'
                                            : detailOffer?.ownerName || 'Solar Offer Details'}
                                </Text>
                                <Text className='text-xs text-muted-foreground'>
                                    {detailOffer ? formatOfferDate(detailOffer.offeredAt) : selectedOfferId ? `ID: ${selectedOfferId}` : ''}
                                </Text>
                            </View>
                            <Pressable
                                onPress={closeOfferModal}
                                className='h-8 w-8 items-center justify-center rounded-full bg-secondary active:opacity-70'
                            >
                                <Feather name="x" size={18} color="#9CA3AF" />
                            </Pressable>
                        </View>

                        {/* Loading State */}
                        {detailLoading && (
                            <View className='items-center justify-center py-10'>
                                <ActivityIndicator size="small" color="#F59E0B" />
                                <Text className='text-xs font-semibold text-muted-foreground mt-3'>
                                    Retrieving solar offer details...
                                </Text>
                            </View>
                        )}

                        {/* Not Found State (404) */}
                        {!detailLoading && detailNotFound && (
                            <View className='items-center justify-center py-6 px-2'>
                                <View className='h-12 w-12 rounded-full bg-yellow-500/15 border border-yellow-500/30 items-center justify-center mb-3'>
                                    <Feather name="alert-circle" size={24} color="#F59E0B" />
                                </View>
                                <Text className='text-sm font-bold text-foreground mb-1 text-center'>
                                    Solar Offer Not Found
                                </Text>
                                <Text className='text-xs text-muted-foreground text-center mb-5 leading-relaxed'>
                                    This offer (ID: {selectedOfferId}) does not exist in the database or has been deleted.
                                </Text>
                                <Pressable
                                    onPress={closeOfferModal}
                                    className='w-full py-2.5 items-center justify-center rounded-xl bg-secondary border border-border/60 active:opacity-75'
                                >
                                    <Text className='text-xs font-bold text-foreground'>
                                        Close
                                    </Text>
                                </Pressable>
                            </View>
                        )}

                        {/* Error State */}
                        {!detailLoading && !detailNotFound && detailError && (
                            <View className='items-center justify-center py-6 px-2'>
                                <View className='h-12 w-12 rounded-full bg-red-500/15 border border-red-500/30 items-center justify-center mb-3'>
                                    <Feather name="alert-triangle" size={24} color="#EF4444" />
                                </View>
                                <Text className='text-sm font-bold text-[#EF4444] mb-1 text-center'>
                                    Failed to load offer
                                </Text>
                                <Text className='text-xs text-muted-foreground text-center mb-5 leading-relaxed'>
                                    {detailError}
                                </Text>
                                <View className='flex-row gap-2 w-full'>
                                    <Pressable
                                        onPress={closeOfferModal}
                                        className='flex-1 py-2.5 items-center justify-center rounded-xl bg-secondary border border-border/60 active:opacity-75'
                                    >
                                        <Text className='text-xs font-bold text-foreground'>
                                            Close
                                        </Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={refetchDetail}
                                        className='flex-1 py-2.5 items-center justify-center rounded-xl bg-primary active:opacity-80'
                                    >
                                        <Text className='text-xs font-bold text-primary-foreground'>
                                            Retry
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>
                        )}

                        {/* Offer Details Content */}
                        {!detailLoading && !detailNotFound && !detailError && detailOffer && (
                            <>
                                {/* Power Offered Highlight */}
                                <View className='rounded-xl bg-secondary/60 border border-border/40 p-4 mb-4 items-center'>
                                    <Text className='text-xs font-semibold text-muted-foreground'>
                                        Offered Clean Solar Energy
                                    </Text>
                                    <Text className='text-3xl font-extrabold text-foreground mt-1'>
                                        {parseFloat(detailOffer.energyAmountKwh).toFixed(1)}{' '}
                                        <Text className='text-base font-bold text-muted-foreground'>kWh</Text>
                                    </Text>
                                </View>

                                {/* Solar Owner Information Card */}
                                <View className='rounded-xl bg-secondary/40 border border-border/30 p-3 mb-4'>
                                    <Text className='text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1'>
                                        Solar Producer
                                    </Text>
                                    <Text className='text-sm font-bold text-foreground'>
                                        {detailOffer.ownerName || 'Solar Producer'}
                                    </Text>
                                    <Text className='text-xs text-muted-foreground mt-0.5'>
                                        {detailOffer.ownerEmail || 'No email on record'}
                                    </Text>
                                    {detailOffer.ownerPhone && (
                                        <Text className='text-xs text-muted-foreground mt-0.5'>
                                            Tel: {detailOffer.ownerPhone}
                                        </Text>
                                    )}

                                    {/* Grid & Solar Capacity Row */}
                                    <View className='border-t border-border/30 pt-2.5 mt-2.5 flex-row items-center justify-between'>
                                        <View>
                                            <Text className='text-[11px] font-semibold text-muted-foreground'>
                                                Microgrid
                                            </Text>
                                            <Text className='text-xs font-bold text-foreground mt-0.5'>
                                                {detailOffer.ownerGrid || 'Co-Op Main Grid'}
                                            </Text>
                                        </View>
                                        <View className='items-end'>
                                            <Text className='text-[11px] font-semibold text-muted-foreground'>
                                                Solar Capacity
                                            </Text>
                                            <Text className='text-xs font-bold text-foreground mt-0.5'>
                                                {detailOffer.ownerSolarCapacityKw ? `${detailOffer.ownerSolarCapacityKw} kW` : 'N/A'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Offer Constraints & Timing */}
                                <View className='rounded-xl bg-secondary/30 border border-border/30 p-3 mb-4'>
                                    <View className='flex-row items-center justify-between mb-2'>
                                        <Text className='text-xs font-semibold text-muted-foreground'>
                                            Min Battery Reserve
                                        </Text>
                                        <View className='flex-row items-center gap-1'>
                                            <Feather name="battery-charging" size={13} color="#10B981" />
                                            <Text className='text-xs font-extrabold text-foreground'>
                                                {detailOffer.minimumBatteryPercent ? `${parseFloat(detailOffer.minimumBatteryPercent).toFixed(0)}%` : '0%'}
                                            </Text>
                                        </View>
                                    </View>

                                    <View className='flex-row items-center justify-between pt-2 border-t border-border/30'>
                                        <Text className='text-xs font-semibold text-muted-foreground'>
                                            Offer Expiration
                                        </Text>
                                        <Text className='text-xs font-medium text-foreground'>
                                            {detailOffer.expiresAt ? formatOfferDate(detailOffer.expiresAt) : 'No expiration date'}
                                        </Text>
                                    </View>
                                </View>

                                {/* Status Pill Banner */}
                                <View className='flex-row items-center justify-between mb-4 px-1'>
                                    <Text className='text-xs font-semibold text-muted-foreground'>
                                        Offer Status
                                    </Text>
                                    <View className={`flex-row items-center gap-1.5 px-2.5 py-1 rounded-full border ${getStatusBadge(detailOffer.status).bg} ${getStatusBadge(detailOffer.status).border}`}>
                                        <Feather name={getStatusBadge(detailOffer.status).icon} size={11} color={getStatusBadge(detailOffer.status).text.includes('10B981') ? '#10B981' : getStatusBadge(detailOffer.status).text.includes('EF4444') ? '#EF4444' : '#F59E0B'} />
                                        <Text className={`text-[11px] font-bold ${getStatusBadge(detailOffer.status).text}`}>
                                            {getStatusBadge(detailOffer.status).label}
                                        </Text>
                                    </View>
                                </View>

                                {/* Modal Actions: If pending, allow Approve/Reject */}
                                {detailOffer.status === 'pending' ? (
                                    <View className='flex-row gap-2.5'>
                                        <Pressable
                                            onPress={() => {
                                                const itemToReject: ManagerSolarOffer = {
                                                    id: detailOffer.id,
                                                    ownerId: detailOffer.ownerId,
                                                    ownerName: detailOffer.ownerName,
                                                    ownerEmail: detailOffer.ownerEmail,
                                                    energyAmountKwh: detailOffer.energyAmountKwh,
                                                    minimumBatteryPercent: detailOffer.minimumBatteryPercent,
                                                    status: detailOffer.status,
                                                    offeredAt: detailOffer.offeredAt,
                                                    expiresAt: detailOffer.expiresAt,
                                                    createdAt: detailOffer.createdAt,
                                                };
                                                closeOfferModal();
                                                openRejectModal(itemToReject);
                                            }}
                                            className='flex-1 py-2.5 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/30 active:opacity-75'
                                        >
                                            <Text className='text-xs font-bold text-[#EF4444]'>
                                                Reject Offer
                                            </Text>
                                        </Pressable>

                                        <Pressable
                                            onPress={() => {
                                                const itemToApprove: ManagerSolarOffer = {
                                                    id: detailOffer.id,
                                                    ownerId: detailOffer.ownerId,
                                                    ownerName: detailOffer.ownerName,
                                                    ownerEmail: detailOffer.ownerEmail,
                                                    energyAmountKwh: detailOffer.energyAmountKwh,
                                                    minimumBatteryPercent: detailOffer.minimumBatteryPercent,
                                                    status: detailOffer.status,
                                                    offeredAt: detailOffer.offeredAt,
                                                    expiresAt: detailOffer.expiresAt,
                                                    createdAt: detailOffer.createdAt,
                                                };
                                                closeOfferModal();
                                                openApproveModal(itemToApprove);
                                            }}
                                            className='flex-1 py-2.5 items-center justify-center rounded-xl bg-primary border border-primary/40 active:opacity-80 shadow-sm'
                                        >
                                            <Text className='text-xs font-bold text-primary-foreground'>
                                                Approve
                                            </Text>
                                        </Pressable>
                                    </View>
                                ) : detailOffer.status === 'approved' ? (
                                    <View className='flex-row gap-2.5'>
                                        <Pressable
                                            onPress={closeOfferModal}
                                            className='flex-1 py-2.5 items-center justify-center rounded-xl bg-secondary border border-border/60 active:opacity-75'
                                        >
                                            <Text className='text-xs font-bold text-foreground'>
                                                Close
                                            </Text>
                                        </Pressable>

                                        {isOfferDispatchable(detailOffer) ? (
                                            <Pressable
                                                onPress={() => {
                                                    const offerItem = offers.find((o) => o.id === detailOffer.id);
                                                    if (offerItem) {
                                                        handleSelectOfferForDispatch(offerItem);
                                                    }
                                                    closeOfferModal();
                                                }}
                                                className={`flex-1 py-2.5 flex-row items-center justify-center gap-1.5 rounded-xl border shadow-sm active:opacity-80 ${
                                                    selectedDispatchOfferId === detailOffer.id
                                                        ? 'bg-emerald-500 border-emerald-600'
                                                        : 'bg-primary border-primary/40'
                                                }`}
                                            >
                                                <Feather
                                                    name={selectedDispatchOfferId === detailOffer.id ? "check" : "sun"}
                                                    size={13}
                                                    color={selectedDispatchOfferId === detailOffer.id ? "#FFFFFF" : "#000000"}
                                                />
                                                <Text
                                                    className={`text-xs font-bold ${
                                                        selectedDispatchOfferId === detailOffer.id
                                                            ? 'text-white'
                                                            : 'text-primary-foreground'
                                                    }`}
                                                >
                                                    {selectedDispatchOfferId === detailOffer.id
                                                        ? 'Deselect'
                                                        : 'Select for Dispatch'}
                                                </Text>
                                            </Pressable>
                                        ) : (
                                            <View className='flex-1 py-2.5 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/30'>
                                                <Text className='text-xs font-bold text-red-500'>
                                                    Offer Expired
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                ) : (
                                    <Pressable
                                        onPress={closeOfferModal}
                                        className='w-full py-3 rounded-xl bg-secondary border border-border/60 items-center justify-center active:opacity-75 shadow-sm'
                                    >
                                        <Text className='text-xs font-bold text-foreground'>
                                            Close
                                        </Text>
                                    </Pressable>
                                )}
                            </>
                        )}
                    </View>
                </View>
            </Modal>

            {/* 2. Approve Confirmation Modal */}
            <Modal
                visible={approveModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => !isApproving && setApproveModalVisible(false)}
            >
                <View className='flex-1 bg-black/60 items-center justify-center p-4'>
                    <View className='w-full max-w-sm rounded-2xl border border-border/60 bg-card p-5 shadow-lg'>
                        {/* Header */}
                        <View className='flex-row items-center justify-between mb-3'>
                            <Text className='text-lg font-bold text-foreground'>
                                Approve Solar Offer
                            </Text>
                            <Pressable
                                disabled={isApproving}
                                onPress={() => {
                                    setApproveModalVisible(false);
                                    setApproveError(null);
                                }}
                                className='h-8 w-8 items-center justify-center rounded-full bg-secondary active:opacity-70'
                            >
                                <Feather name="x" size={18} color="#9CA3AF" />
                            </Pressable>
                        </View>

                        <Text className='text-xs text-muted-foreground mb-4 leading-relaxed'>
                            You are approving the solar power offer from{' '}
                            <Text className='font-bold text-foreground'>
                                {selectedApproveItem?.ownerName || 'Solar Producer'}
                            </Text>
                            :
                        </Text>

                        {/* Impact Overview Box */}
                        <View className='rounded-xl bg-secondary/60 border border-border/40 p-3.5 mb-4'>
                            <View className='flex-row items-center justify-between mb-2'>
                                <Text className='text-xs text-muted-foreground'>
                                    Offered Generation
                                </Text>
                                <Text className='text-xs font-bold text-foreground'>
                                    {selectedApproveItem ? parseFloat(selectedApproveItem.energyAmountKwh).toFixed(1) : 0} kWh
                                </Text>
                            </View>
                            <View className='flex-row items-center justify-between'>
                                <Text className='text-xs text-muted-foreground'>
                                    Battery Threshold
                                </Text>
                                <Text className='text-xs font-bold text-[#10B981]'>
                                    {selectedApproveItem?.minimumBatteryPercent ? `${parseFloat(selectedApproveItem.minimumBatteryPercent).toFixed(0)}%` : '0%'}
                                </Text>
                            </View>
                        </View>

                        {/* Inline Error in Modal if any */}
                        {approveError && (
                            <View className='p-3 rounded-xl bg-red-500/10 border border-red-500/30 mb-4'>
                                <Text className='text-xs font-semibold text-[#EF4444] text-center'>
                                    {approveError}
                                </Text>
                            </View>
                        )}

                        {/* Action Buttons */}
                        <View className='flex-row gap-3'>
                            <Pressable
                                disabled={isApproving}
                                onPress={() => {
                                    setApproveModalVisible(false);
                                    setApproveError(null);
                                }}
                                className='flex-1 py-2.5 items-center justify-center rounded-xl bg-secondary border border-border/60 active:opacity-75'
                            >
                                <Text className='text-xs font-bold text-foreground'>
                                    Cancel
                                </Text>
                            </Pressable>

                            <Pressable
                                disabled={isApproving}
                                onPress={handleConfirmApprove}
                                className='flex-1 py-2.5 items-center justify-center rounded-xl bg-primary border border-primary/40 active:opacity-80 shadow-sm flex-row items-center justify-center gap-2'
                            >
                                {isApproving ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text className='text-xs font-bold text-primary-foreground'>
                                        Confirm Approval
                                    </Text>
                                )}
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* 3. Reject Confirmation Modal */}
            <Modal
                visible={rejectModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => !isRejecting && setRejectModalVisible(false)}
            >
                <View className='flex-1 bg-black/60 items-center justify-center p-4'>
                    <View className='w-full max-w-sm rounded-2xl border border-border/60 bg-card p-5 shadow-lg'>
                        {/* Header */}
                        <View className='flex-row items-center justify-between mb-3'>
                            <Text className='text-lg font-bold text-foreground'>
                                Decline Solar Offer
                            </Text>
                            <Pressable
                                disabled={isRejecting}
                                onPress={() => {
                                    setRejectModalVisible(false);
                                    setRejectError(null);
                                }}
                                className='h-8 w-8 items-center justify-center rounded-full bg-secondary active:opacity-70'
                            >
                                <Feather name="x" size={18} color="#9CA3AF" />
                            </Pressable>
                        </View>

                        <Text className='text-xs text-muted-foreground mb-4 leading-relaxed'>
                            Are you sure you want to decline the solar energy offer from{' '}
                            <Text className='font-bold text-foreground'>
                                {selectedRejectItem?.ownerName || 'Solar Producer'}
                            </Text>
                            ?
                        </Text>

                        {/* Offer Summary */}
                        <View className='rounded-xl bg-secondary/60 border border-border/40 p-3.5 mb-4'>
                            <View className='flex-row items-center justify-between mb-2'>
                                <Text className='text-xs text-muted-foreground'>
                                    Offered Power
                                </Text>
                                <Text className='text-xs font-bold text-foreground'>
                                    {selectedRejectItem ? parseFloat(selectedRejectItem.energyAmountKwh).toFixed(1) : 0} kWh
                                </Text>
                            </View>
                            <View className='flex-row items-center justify-between'>
                                <Text className='text-xs text-muted-foreground'>
                                    Status Change
                                </Text>
                                <Text className='text-xs font-bold text-[#EF4444]'>
                                    pending → rejected
                                </Text>
                            </View>
                        </View>

                        {/* Inline Error in Modal if any */}
                        {rejectError && (
                            <View className='p-3 rounded-xl bg-red-500/10 border border-red-500/30 mb-4'>
                                <Text className='text-xs font-semibold text-[#EF4444] text-center'>
                                    {rejectError}
                                </Text>
                            </View>
                        )}

                        {/* Action Buttons */}
                        <View className='flex-row gap-3'>
                            <Pressable
                                disabled={isRejecting}
                                onPress={() => {
                                    setRejectModalVisible(false);
                                    setRejectError(null);
                                }}
                                className='flex-1 py-2.5 items-center justify-center rounded-xl bg-secondary border border-border/60 active:opacity-75'
                            >
                                <Text className='text-xs font-bold text-foreground'>
                                    Cancel
                                </Text>
                            </Pressable>

                            <Pressable
                                disabled={isRejecting}
                                onPress={handleConfirmReject}
                                className='flex-1 py-2.5 items-center justify-center rounded-xl bg-red-500 active:opacity-80 shadow-sm flex-row items-center justify-center gap-2'
                            >
                                {isRejecting ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text className='text-xs font-bold text-white'>
                                        Confirm Reject
                                    </Text>
                                )}
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default ManagerSolarOffers;
