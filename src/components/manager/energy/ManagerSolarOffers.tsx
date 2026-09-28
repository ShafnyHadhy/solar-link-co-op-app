import React, { useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
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

interface ManagerSolarOffersProps {
    onRefreshTrigger?: () => void;
}

export const ManagerSolarOffers: React.FC<ManagerSolarOffersProps> = () => {
    const { offers, loading, error, refetch } = useSolarOffers();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

    // Individual Offer Detail Modal State
    const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null);
    const [offerModalVisible, setOfferModalVisible] = useState(false);

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

            {/* Solar Offers List */}
            {!loading && !error && (
                <View className='flex-col gap-4'>
                    {filteredOffers.map((item) => {
                        const badge = getStatusBadge(item.status);
                        const formattedKwh = parseFloat(item.energyAmountKwh).toFixed(1);
                        const minBattery = item.minimumBatteryPercent
                            ? `${parseFloat(item.minimumBatteryPercent).toFixed(0)}%`
                            : 'N/A';

                        return (
                            <Pressable
                                key={item.id}
                                onPress={() => openOfferModal(item.id)}
                                className='rounded-xl border border-border/40 bg-secondary/60 p-4 shadow-sm active:opacity-90'
                            >
                                {/* Header Row: Owner info & Status Badge */}
                                <View className='flex-row items-center justify-between mb-3'>
                                    <View className='flex-row items-center gap-3 flex-1 mr-2'>
                                        <View className='h-10 w-10 items-center justify-center rounded-xl bg-card border border-border/60'>
                                            <Feather name="sun" size={18} color="#F59E0B" />
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

                                    {/* Status Badge */}
                                    <View className={`flex-row items-center gap-1.5 px-2.5 py-1 rounded-full border ${badge.bg} ${badge.border}`}>
                                        <Feather name={badge.icon} size={11} color={badge.text.includes('10B981') ? '#10B981' : badge.text.includes('EF4444') ? '#EF4444' : '#F59E0B'} />
                                        <Text className={`text-[11px] font-bold ${badge.text}`}>
                                            {badge.label}
                                        </Text>
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

                                {/* Bottom Metadata & Details Button */}
                                <View className='flex-row items-center justify-between pt-1'>
                                    <View className='flex-row items-center gap-1.5 flex-1'>
                                        <Feather
                                            name="clock"
                                            size={12}
                                            color="#9CA3AF"
                                        />
                                        <Text className='text-xs text-muted-foreground' numberOfLines={1}>
                                            {item.expiresAt
                                                ? `Expires ${formatOfferDate(item.expiresAt)}`
                                                : 'Open availability'}
                                        </Text>
                                    </View>

                                    <Pressable
                                        onPress={() => openOfferModal(item.id)}
                                        className='px-3.5 py-1.5 rounded-lg bg-card border border-border/80 active:bg-secondary shadow-sm'
                                    >
                                        <Text className='text-xs font-bold text-foreground'>
                                            Details
                                        </Text>
                                    </Pressable>
                                </View>
                            </Pressable>
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

            {/* Individual Solar Offer Details Modal */}
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

                                {/* Close Action */}
                                <Pressable
                                    onPress={closeOfferModal}
                                    className='w-full py-3 rounded-xl bg-secondary border border-border/60 items-center justify-center active:opacity-75 shadow-sm'
                                >
                                    <Text className='text-xs font-bold text-foreground'>
                                        Close
                                    </Text>
                                </Pressable>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default ManagerSolarOffers;
