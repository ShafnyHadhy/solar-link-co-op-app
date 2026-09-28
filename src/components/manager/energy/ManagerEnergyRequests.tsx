import TabScreenBackground from '@/components/shared/TabScreenBackground';
import {
    useEnergyRequests,
    useEnergyRequestDetail,
    type ManagerEnergyRequest,
} from '@/hooks/manager/useEnergyRequests';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native';

function formatRequestDate(dateStr: string) {
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

const ManagerEnergyRequests = () => {
    const router = useRouter();
    const { requests, loading, error, refetch } = useEnergyRequests();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

    // Modals & Selection State
    const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
    const [selectedApproveItem, setSelectedApproveItem] = useState<ManagerEnergyRequest | null>(null);
    const [reviewModalVisible, setReviewModalVisible] = useState(false);
    const [approveModalVisible, setApproveModalVisible] = useState(false);

    // Fetch individual request details on demand when review modal is open
    const {
        request: detailRequest,
        loading: detailLoading,
        error: detailError,
        notFound: detailNotFound,
        refetch: refetchDetail,
    } = useEnergyRequestDetail(reviewModalVisible ? selectedRequestId : null);

    const pendingCount = requests.filter((r) => r.status === 'pending').length;
    const approvedCount = requests.filter((r) => r.status === 'approved').length;
    const rejectedCount = requests.filter((r) => r.status === 'rejected').length;
    const availableEnergy = 45;

    const openReviewModal = (id: string) => {
        setSelectedRequestId(id);
        setReviewModalVisible(true);
    };

    const closeReviewModal = () => {
        setReviewModalVisible(false);
        setSelectedRequestId(null);
    };

    const openApproveModal = (item: ManagerEnergyRequest) => {
        setSelectedApproveItem(item);
        setApproveModalVisible(true);
    };

    const filteredRequests = requests.filter((req) => {
        const household = (req.householdName || '').toLowerCase();
        const reason = (req.reason || '').toLowerCase();
        const query = searchQuery.toLowerCase();
        const matchesSearch = household.includes(query) || reason.includes(query);

        if (selectedFilter === 'all') return matchesSearch;
        return matchesSearch && req.status === selectedFilter;
    });

    return (
        <View className='flex-1 bg-background'>
            <TabScreenBackground />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1, padding: 20, paddingVertical: 60 }}
                className='flex-1'
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={refetch}
                        tintColor="#F59E0B"
                        colors={['#F59E0B']}
                    />
                }
            >
                {/* Header */}
                <View className='flex-row items-center justify-between mb-6'>
                    <View className='flex-row items-center gap-2'>
                        <Pressable
                            onPress={() => router.canGoBack() && router.back()}
                            className='h-10 w-10 items-center justify-center rounded-xl bg-secondary/80 border border-border/60 active:opacity-70 mr-1'
                        >
                            <Feather name="chevron-left" size={22} color="#F59E0B" />
                        </Pressable>

                        <View>
                            <Text className='text-2xl font-extrabold text-foreground tracking-tight'>
                                Energy Requests
                            </Text>
                            <Text className='text-xs text-muted-foreground mt-0.5'>
                                Review & allocate community solar power
                            </Text>
                        </View>
                    </View>

                    <Pressable
                        onPress={refetch}
                        className='h-10 w-10 items-center justify-center rounded-2xl bg-secondary border border-border/60 shadow-sm active:opacity-75'
                    >
                        <Feather name="refresh-cw" size={18} color="#F59E0B" />
                    </Pressable>
                </View>

                {/* Top KPI Analytics Overview */}
                <View className='flex-row gap-3 mb-5 w-full'>
                    {/* Pending Requests */}
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
                            Pending Requests
                        </Text>
                    </View>

                    {/* Available Energy */}
                    <View className='flex-1 flex-col justify-between rounded-xl border border-border/40 bg-secondary/60 p-4 shadow-sm'>
                        <View className='flex-row items-center justify-between'>
                            <Text className='text-3xl font-extrabold text-foreground'>
                                {availableEnergy} <Text className='text-base font-bold text-muted-foreground'>kWh</Text>
                            </Text>
                            <View className='h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/30'>
                                <Feather name="zap" size={16} color="#10B981" />
                            </View>
                        </View>
                        <Text className='text-xs font-semibold text-muted-foreground mt-2'>
                            Available Energy
                        </Text>
                    </View>
                </View>

                {/* Search Bar */}
                <View className='flex-row items-center bg-secondary/60 border border-border/60 rounded-full px-4 py-2.5 mb-4 shadow-sm'>
                    <Feather name="search" size={18} color="#9CA3AF" />
                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search household or reason..."
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
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 8 }}
                    className='mb-5'
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
                            All ({requests.length})
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

                {/* Loading State */}
                {loading && (
                    <View className='items-center justify-center py-16'>
                        <ActivityIndicator size="large" color="#F59E0B" />
                        <Text className='text-xs font-semibold text-muted-foreground mt-3'>
                            Loading energy requests from grid...
                        </Text>
                    </View>
                )}

                {/* API Error State */}
                {!loading && error && (
                    <View className='items-center justify-center py-8 px-4 rounded-xl border border-red-500/30 bg-red-500/10 mb-4'>
                        <Feather name="alert-triangle" size={24} color="#EF4444" />
                        <Text className='text-sm font-bold text-[#EF4444] mt-2'>
                            Failed to load energy requests
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

                {/* Household Requests List */}
                {!loading && !error && (
                    <View className='flex-col gap-4'>
                        {filteredRequests.map((item) => {
                            const isPending = item.status === 'pending';
                            const isApproved = item.status === 'approved';
                            const formattedKwh = parseFloat(item.requestedEnergyKwh).toFixed(1);

                            return (
                                <View
                                    key={item.id}
                                    className='rounded-xl border border-border/40 bg-secondary/60 p-4 shadow-sm'
                                >
                                    {/* Household Header & Status Pill */}
                                    <View className='flex-row items-center justify-between mb-3'>
                                        <View className='flex-row items-center gap-3 flex-1 mr-2'>
                                            <View className='h-10 w-10 items-center justify-center rounded-xl bg-card border border-border/60'>
                                                <Feather name="home" size={16} color="#F59E0B" />
                                            </View>
                                            <View className='flex-1'>
                                                <Text className='text-base font-bold text-foreground' numberOfLines={1}>
                                                    {item.householdName || 'Household Member'}
                                                </Text>
                                                <Text className='text-xs text-muted-foreground' numberOfLines={1}>
                                                    {formatRequestDate(item.requestedAt)}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Status Badge */}
                                        <View
                                            className={`px-2.5 py-0.5 rounded-full border ${isPending
                                                ? 'bg-yellow-500/15 border-yellow-500/40'
                                                : isApproved
                                                    ? 'bg-emerald-500/15 border-emerald-500/40'
                                                    : 'bg-zinc-500/15 border-zinc-500/40'
                                                }`}
                                        >
                                            <Text
                                                className={`text-[10px] font-bold uppercase ${isPending
                                                    ? 'text-[#F59E0B]'
                                                    : isApproved
                                                        ? 'text-[#10B981]'
                                                        : 'text-[#6B7280]'
                                                    }`}
                                            >
                                                {item.status}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Request Details Section (Requested Amount & Reason) */}
                                    <View className='rounded-xl bg-card/70 border border-border/30 p-3 mb-3'>
                                        <View className='flex-row items-center justify-between mb-1.5'>
                                            <Text className='text-[11px] font-semibold text-muted-foreground'>
                                                Requested Energy
                                            </Text>
                                            <Text className='text-base font-extrabold text-foreground'>
                                                {formattedKwh} <Text className='text-[11px] font-bold text-muted-foreground'>kWh</Text>
                                            </Text>
                                        </View>

                                        {item.reason && (
                                            <View className='border-t border-border/30 pt-2 mt-1'>
                                                <Text className='text-xs text-muted-foreground font-medium' numberOfLines={2}>
                                                    "{item.reason}"
                                                </Text>
                                            </View>
                                        )}
                                    </View>

                                    {/* Action Buttons */}
                                    {isPending ? (
                                        <View className='flex-row items-center justify-end gap-2.5 pt-1'>
                                            <Pressable
                                                onPress={() => openReviewModal(item.id)}
                                                className='px-3.5 py-1.5 rounded-lg bg-card border border-border/80 active:bg-secondary shadow-sm'
                                            >
                                                <Text className='text-xs font-bold text-foreground'>
                                                    Review
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
                                            <Text className='text-xs font-semibold text-[#10B981]'>
                                                Allocation approved ({formattedKwh} kWh)
                                            </Text>
                                            <Pressable
                                                onPress={() => openReviewModal(item.id)}
                                                className='px-3.5 py-1.5 rounded-lg bg-card border border-border/80 active:bg-secondary shadow-sm'
                                            >
                                                <Text className='text-xs font-bold text-foreground'>
                                                    Details
                                                </Text>
                                            </Pressable>
                                        </View>
                                    ) : (
                                        <View className='flex-row items-center justify-between pt-1'>
                                            <Text className='text-xs font-semibold text-[#EF4444]'>
                                                Request rejected
                                            </Text>
                                            <Pressable
                                                onPress={() => openReviewModal(item.id)}
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
                        {filteredRequests.length === 0 && (
                            <View className='items-center justify-center py-12 px-4'>
                                <Text className='text-base font-bold text-foreground'>
                                    No requests found
                                </Text>
                                <Text className='text-xs text-muted-foreground text-center mt-1'>
                                    {searchQuery
                                        ? `No requests match "${searchQuery}"`
                                        : 'There are currently no requests in this category.'}
                                </Text>
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>

            {/* 1. Review Details Modal */}
            <Modal
                visible={reviewModalVisible}
                transparent
                animationType="fade"
                onRequestClose={closeReviewModal}
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
                                            ? 'Request Not Found'
                                            : detailRequest?.householdName || 'Household Details'}
                                </Text>
                                <Text className='text-xs text-muted-foreground'>
                                    {detailRequest ? formatRequestDate(detailRequest.requestedAt) : selectedRequestId ? `ID: ${selectedRequestId}` : ''}
                                </Text>
                            </View>
                            <Pressable
                                onPress={closeReviewModal}
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
                                    Retrieving request details...
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
                                    Energy Request Not Found
                                </Text>
                                <Text className='text-xs text-muted-foreground text-center mb-5 leading-relaxed'>
                                    This request (ID: {selectedRequestId}) does not exist in the database or has been deleted.
                                </Text>
                                <Pressable
                                    onPress={closeReviewModal}
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
                                    Failed to load request
                                </Text>
                                <Text className='text-xs text-muted-foreground text-center mb-5 leading-relaxed'>
                                    {detailError}
                                </Text>
                                <View className='flex-row gap-2 w-full'>
                                    <Pressable
                                        onPress={closeReviewModal}
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

                        {/* Request Details Content */}
                        {!detailLoading && !detailNotFound && !detailError && detailRequest && (
                            <>
                                {/* Power Requested Highlight */}
                                <View className='rounded-xl bg-secondary/60 border border-border/40 p-4 mb-4 items-center'>
                                    <Text className='text-xs font-semibold text-muted-foreground'>
                                        Requested Solar Allocation
                                    </Text>
                                    <Text className='text-3xl font-extrabold text-foreground mt-1'>
                                        {parseFloat(detailRequest.requestedEnergyKwh).toFixed(1)}{' '}
                                        <Text className='text-base font-bold text-muted-foreground'>kWh</Text>
                                    </Text>
                                </View>

                                {/* Request Reason & Household Information */}
                                <View className='rounded-xl bg-secondary/40 border border-border/30 p-3 mb-4'>
                                    <Text className='text-[11px] font-semibold text-muted-foreground mb-1'>
                                        Purpose / Reason
                                    </Text>
                                    <Text className='text-xs font-medium text-foreground leading-relaxed'>
                                        {detailRequest.reason || 'No specific reason provided.'}
                                    </Text>

                                    {/* Household Contact Info */}
                                    <View className='border-t border-border/30 pt-2 mt-2.5'>
                                        <Text className='text-[11px] font-semibold text-muted-foreground'>
                                            Household Contact
                                        </Text>
                                        <Text className='text-xs text-foreground mt-0.5'>
                                            {detailRequest.householdEmail || 'No email on record'}
                                        </Text>
                                        {detailRequest.householdPhone && (
                                            <Text className='text-xs text-muted-foreground mt-0.5'>
                                                Tel: {detailRequest.householdPhone}
                                            </Text>
                                        )}
                                        {detailRequest.householdGrid && (
                                            <Text className='text-[11px] text-muted-foreground mt-0.5'>
                                                Grid: {detailRequest.householdGrid}
                                            </Text>
                                        )}
                                    </View>

                                    {/* Reviewed Information if available */}
                                    {(detailRequest.reviewedAt || detailRequest.reviewedBy) && (
                                        <View className='border-t border-border/30 pt-2 mt-2.5'>
                                            <Text className='text-[11px] font-semibold text-muted-foreground'>
                                                Review Audit
                                            </Text>
                                            {detailRequest.reviewedAt && (
                                                <Text className='text-xs text-muted-foreground mt-0.5'>
                                                    Reviewed on: {formatRequestDate(detailRequest.reviewedAt)}
                                                </Text>
                                            )}
                                            {detailRequest.reviewedBy && (
                                                <Text className='text-xs text-muted-foreground mt-0.5'>
                                                    By: {detailRequest.reviewedBy}
                                                </Text>
                                            )}
                                        </View>
                                    )}
                                </View>

                                {/* Status Line */}
                                <View className='flex-row items-center justify-between mb-5 px-1'>
                                    <Text className='text-xs font-semibold text-muted-foreground'>
                                        Current Status
                                    </Text>
                                    <View
                                        className={`px-2.5 py-0.5 rounded-full border ${
                                            detailRequest.status === 'pending'
                                                ? 'bg-yellow-500/15 border-yellow-500/40'
                                                : detailRequest.status === 'approved'
                                                    ? 'bg-emerald-500/15 border-emerald-500/40'
                                                    : 'bg-zinc-500/15 border-zinc-500/40'
                                            }`}
                                    >
                                        <Text
                                            className={`text-[10px] font-bold uppercase ${
                                                detailRequest.status === 'pending'
                                                    ? 'text-[#F59E0B]'
                                                    : detailRequest.status === 'approved'
                                                        ? 'text-[#10B981]'
                                                        : 'text-[#6B7280]'
                                                }`}
                                        >
                                            {detailRequest.status}
                                        </Text>
                                    </View>
                                </View>

                                {/* Modal Close Button */}
                                <Pressable
                                    onPress={closeReviewModal}
                                    className='w-full py-2.5 items-center justify-center rounded-xl bg-secondary border border-border/60 active:opacity-75'
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

            {/* 2. Approve Confirmation Modal (Preview only for Task 2) */}
            <Modal
                visible={approveModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setApproveModalVisible(false)}
            >
                <View className='flex-1 bg-black/60 items-center justify-center p-4'>
                    <View className='w-full max-w-sm rounded-2xl border border-border/60 bg-card p-5 shadow-lg'>
                        {/* Header */}
                        <View className='flex-row items-center justify-between mb-3'>
                            <Text className='text-lg font-bold text-foreground'>
                                Review Allocation
                            </Text>
                            <Pressable
                                onPress={() => setApproveModalVisible(false)}
                                className='h-8 w-8 items-center justify-center rounded-full bg-secondary active:opacity-70'
                            >
                                <Feather name="x" size={18} color="#9CA3AF" />
                            </Pressable>
                        </View>

                        <Text className='text-xs text-muted-foreground mb-4 leading-relaxed'>
                            Energy allocation review for{' '}
                            <Text className='font-bold text-foreground'>
                                {selectedApproveItem?.householdName}
                            </Text>
                            :
                        </Text>

                        {/* Impact Overview Box */}
                        <View className='rounded-xl bg-secondary/60 border border-border/40 p-3.5 mb-5'>
                            <View className='flex-row items-center justify-between mb-2'>
                                <Text className='text-xs text-muted-foreground'>
                                    Requested Amount
                                </Text>
                                <Text className='text-xs font-bold text-foreground'>
                                    {selectedApproveItem ? parseFloat(selectedApproveItem.requestedEnergyKwh).toFixed(1) : 0} kWh
                                </Text>
                            </View>
                            <View className='flex-row items-center justify-between'>
                                <Text className='text-xs text-muted-foreground'>
                                    Available Pool Energy
                                </Text>
                                <Text className='text-xs font-bold text-[#10B981]'>
                                    {availableEnergy} kWh
                                </Text>
                            </View>
                        </View>

                        {/* Action Buttons */}
                        <View className='flex-row gap-3'>
                            <Pressable
                                onPress={() => setApproveModalVisible(false)}
                                className='flex-1 py-2.5 items-center justify-center rounded-xl bg-secondary border border-border/60 active:opacity-75'
                            >
                                <Text className='text-xs font-bold text-foreground'>
                                    Cancel
                                </Text>
                            </Pressable>

                            <Pressable
                                onPress={() => setApproveModalVisible(false)}
                                className='flex-1 py-2.5 items-center justify-center rounded-xl bg-primary border border-primary/40 active:opacity-80 shadow-sm'
                            >
                                <Text className='text-xs font-bold text-primary-foreground'>
                                    Close Preview
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default ManagerEnergyRequests;
