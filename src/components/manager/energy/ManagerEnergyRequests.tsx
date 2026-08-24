import TabScreenBackground from '@/components/shared/TabScreenBackground';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

interface EnergyRequestItem {
    id: string;
    household: string;
    currentUsage: number;
    previousAllocation: number;
    requestedAmount: number;
    status: 'pending' | 'approved' | 'rejected';
    requestedAt: string;
}

const INITIAL_REQUESTS: EnergyRequestItem[] = [
    {
        id: '1',
        household: 'Household A',
        currentUsage: 35,
        previousAllocation: 10,
        requestedAmount: 15,
        status: 'pending',
        requestedAt: '10 mins ago',
    },
    {
        id: '2',
        household: 'Household B',
        currentUsage: 42,
        previousAllocation: 5,
        requestedAmount: 12,
        status: 'pending',
        requestedAt: '35 mins ago',
    },
    {
        id: '3',
        household: 'Household C',
        currentUsage: 28,
        previousAllocation: 17,
        requestedAmount: 8,
        status: 'pending',
        requestedAt: '1 hour ago',
    },
    {
        id: '4',
        household: 'Household D',
        currentUsage: 20,
        previousAllocation: 12,
        requestedAmount: 10,
        status: 'approved',
        requestedAt: 'Yesterday',
    },
    {
        id: '5',
        household: 'Household E',
        currentUsage: 18,
        previousAllocation: 6,
        requestedAmount: 9,
        status: 'rejected',
        requestedAt: '2 days ago',
    },
    {
        id: '6',
        household: 'Household F',
        currentUsage: 45,
        previousAllocation: 18,
        requestedAmount: 14,
        status: 'approved',
        requestedAt: '1 hour ago',
    },
];

const ManagerEnergyRequests = () => {
    const router = useRouter();
    const [requests, setRequests] = useState<EnergyRequestItem[]>(INITIAL_REQUESTS);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

    // Modals State
    const [selectedRequest, setSelectedRequest] = useState<EnergyRequestItem | null>(null);
    const [reviewModalVisible, setReviewModalVisible] = useState(false);
    const [approveModalVisible, setApproveModalVisible] = useState(false);

    const pendingCount = requests.filter((r) => r.status === 'pending').length;
    const approvedCount = requests.filter((r) => r.status === 'approved').length;
    const rejectedCount = requests.filter((r) => r.status === 'rejected').length;
    const availableEnergy = 45;

    const openReviewModal = (item: EnergyRequestItem) => {
        setSelectedRequest(item);
        setReviewModalVisible(true);
    };

    const openApproveModal = (item: EnergyRequestItem) => {
        setSelectedRequest(item);
        setApproveModalVisible(true);
    };

    const confirmApproval = () => {
        if (!selectedRequest) return;
        setRequests((prev) =>
            prev.map((item) =>
                item.id === selectedRequest.id ? { ...item, status: 'approved' } : item
            )
        );
        setApproveModalVisible(false);
    };

    const confirmRejection = (id: string) => {
        setRequests((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, status: 'rejected' } : item
            )
        );
    };

    const filteredRequests = requests.filter((req) => {
        const matchesSearch = req.household.toLowerCase().includes(searchQuery.toLowerCase());
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

                    <View className='h-10 w-10 items-center justify-center rounded-2xl bg-secondary border border-border/60 shadow-sm'>
                        <Feather name="bell" size={20} color="#F59E0B" />
                    </View>
                </View>

                {/* Top KPI Analytics Overview */}
                <View className='flex-row gap-3 mb-5 w-full'>
                    {/* Pending Requests */}
                    <View className='flex-1 flex-col justify-between rounded-xl border border-border/40 bg-secondary/60 p-4 shadow-sm'>
                        <Text className='text-3xl font-extrabold text-foreground'>
                            {pendingCount}
                        </Text>
                        <Text className='text-xs font-semibold text-muted-foreground mt-1'>
                            Pending Requests
                        </Text>
                    </View>

                    {/* Available Energy */}
                    <View className='flex-1 flex-col justify-between rounded-xl border border-border/40 bg-secondary/60 p-4 shadow-sm'>
                        <Text className='text-3xl font-extrabold text-foreground'>
                            {availableEnergy} <Text className='text-base font-bold text-muted-foreground'>kWh</Text>
                        </Text>
                        <Text className='text-xs font-semibold text-muted-foreground mt-1'>
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
                        placeholder="Search Request..."
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

                {/* Household Requests List */}
                <View className='flex-col gap-4'>
                    {filteredRequests.map((item) => {
                        const isPending = item.status === 'pending';
                        const isApproved = item.status === 'approved';

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
                                                {item.household}
                                            </Text>
                                            <Text className='text-xs text-muted-foreground' numberOfLines={1}>
                                                {item.requestedAt}
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

                                {/* Metrics Section (Usage vs Previous Allocation) */}
                                <View className='flex-row items-center justify-between rounded-xl bg-card/70 border border-border/30 p-3 mb-3'>
                                    <View className='flex-1'>
                                        <Text className='text-[11px] font-semibold text-muted-foreground'>
                                            Current Usage
                                        </Text>
                                        <Text className='text-sm font-extrabold text-foreground mt-0.5'>
                                            {item.currentUsage} <Text className='text-[11px] font-bold text-muted-foreground'>kWh</Text>
                                        </Text>
                                    </View>

                                    {/* Divider */}
                                    <View className='h-7 w-[1px] bg-border/60 mx-2' />

                                    {/* Previous Allocation */}
                                    <View className='flex-1 pl-2'>
                                        <Text className='text-[11px] font-semibold text-muted-foreground'>
                                            Previous Allocation
                                        </Text>
                                        <Text className='text-sm font-extrabold text-foreground mt-0.5'>
                                            {item.previousAllocation} <Text className='text-[11px] font-bold text-muted-foreground'>kWh</Text>
                                        </Text>
                                    </View>
                                </View>

                                {/* Action Buttons */}
                                {isPending ? (
                                    <View className='flex-row items-center justify-end gap-2.5 pt-1'>
                                        <Pressable
                                            onPress={() => openReviewModal(item)}
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
                                            Allocation approved ({item.requestedAmount} kWh)
                                        </Text>
                                        <Pressable
                                            onPress={() => openReviewModal(item)}
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
                                            onPress={() => openApproveModal(item)}
                                            className='px-3.5 py-1.5 rounded-lg bg-primary border border-primary/40 active:opacity-80 shadow-sm'
                                        >
                                            <Text className='text-xs font-bold text-primary-foreground'>
                                                Reconsider
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
            </ScrollView>

            {/* 1. Review Details Modal */}
            <Modal
                visible={reviewModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setReviewModalVisible(false)}
            >
                <View className='flex-1 bg-black/60 items-center justify-center p-4'>
                    <View className='w-full max-w-sm rounded-2xl border border-border/60 bg-card p-5 shadow-lg'>
                        {/* Header */}
                        <View className='flex-row items-center justify-between mb-4'>
                            <View>
                                <Text className='text-lg font-bold text-foreground'>
                                    Request Details
                                </Text>
                                <Text className='text-xs text-muted-foreground'>
                                    {selectedRequest?.household} • {selectedRequest?.requestedAt}
                                </Text>
                            </View>
                            <Pressable
                                onPress={() => setReviewModalVisible(false)}
                                className='h-8 w-8 items-center justify-center rounded-full bg-secondary active:opacity-70'
                            >
                                <Feather name="x" size={18} color="#9CA3AF" />
                            </Pressable>
                        </View>

                        {/* Power Requested Highlight */}
                        <View className='rounded-xl bg-secondary/60 border border-border/40 p-4 mb-4 items-center'>
                            <Text className='text-xs font-semibold text-muted-foreground'>
                                Requested Solar Allocation
                            </Text>
                            <Text className='text-3xl font-extrabold text-foreground mt-1'>
                                {selectedRequest?.requestedAmount}{' '}
                                <Text className='text-base font-bold text-muted-foreground'>kWh</Text>
                            </Text>
                        </View>

                        {/* Usage Metrics Breakdown */}
                        <View className='flex-row items-center justify-between rounded-xl bg-secondary/40 border border-border/30 p-3 mb-4'>
                            <View className='flex-1'>
                                <Text className='text-[11px] font-semibold text-muted-foreground'>
                                    Current Usage
                                </Text>
                                <Text className='text-sm font-extrabold text-foreground mt-0.5'>
                                    {selectedRequest?.currentUsage} kWh
                                </Text>
                            </View>
                            <View className='h-7 w-[1px] bg-border/60 mx-2' />
                            <View className='flex-1 pl-2'>
                                <Text className='text-[11px] font-semibold text-muted-foreground'>
                                    Prev Allocation
                                </Text>
                                <Text className='text-sm font-extrabold text-foreground mt-0.5'>
                                    {selectedRequest?.previousAllocation} kWh
                                </Text>
                            </View>
                        </View>

                        {/* Status Line */}
                        <View className='flex-row items-center justify-between mb-5 px-1'>
                            <Text className='text-xs font-semibold text-muted-foreground'>
                                Current Status
                            </Text>
                            <View
                                className={`px-2.5 py-0.5 rounded-full border ${
                                    selectedRequest?.status === 'pending'
                                        ? 'bg-yellow-500/15 border-yellow-500/40'
                                        : selectedRequest?.status === 'approved'
                                        ? 'bg-emerald-500/15 border-emerald-500/40'
                                        : 'bg-zinc-500/15 border-zinc-500/40'
                                }`}
                            >
                                <Text
                                    className={`text-[10px] font-bold uppercase ${
                                        selectedRequest?.status === 'pending'
                                            ? 'text-[#F59E0B]'
                                            : selectedRequest?.status === 'approved'
                                            ? 'text-[#10B981]'
                                            : 'text-[#6B7280]'
                                    }`}
                                >
                                    {selectedRequest?.status}
                                </Text>
                            </View>
                        </View>

                        {/* Modal Action Buttons */}
                        {selectedRequest?.status === 'pending' ? (
                            <View className='flex-row gap-3'>
                                <Pressable
                                    onPress={() => {
                                        setReviewModalVisible(false);
                                        if (selectedRequest) confirmRejection(selectedRequest.id);
                                    }}
                                    className='flex-1 py-2.5 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/30 active:opacity-75'
                                >
                                    <Text className='text-xs font-bold text-[#EF4444]'>
                                        Reject Request
                                    </Text>
                                </Pressable>

                                <Pressable
                                    onPress={() => {
                                        setReviewModalVisible(false);
                                        setApproveModalVisible(true);
                                    }}
                                    className='flex-1 py-2.5 items-center justify-center rounded-xl bg-primary border border-primary/40 active:opacity-80 shadow-sm'
                                >
                                    <Text className='text-xs font-bold text-primary-foreground'>
                                        Approve
                                    </Text>
                                </Pressable>
                            </View>
                        ) : (
                            <Pressable
                                onPress={() => setReviewModalVisible(false)}
                                className='w-full py-2.5 items-center justify-center rounded-xl bg-secondary border border-border/60 active:opacity-75'
                            >
                                <Text className='text-xs font-bold text-foreground'>
                                    Close
                                </Text>
                            </Pressable>
                        )}
                    </View>
                </View>
            </Modal>

            {/* 2. Approve Confirmation Modal */}
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
                                Confirm Allocation
                            </Text>
                            <Pressable
                                onPress={() => setApproveModalVisible(false)}
                                className='h-8 w-8 items-center justify-center rounded-full bg-secondary active:opacity-70'
                            >
                                <Feather name="x" size={18} color="#9CA3AF" />
                            </Pressable>
                        </View>

                        <Text className='text-xs text-muted-foreground mb-4 leading-relaxed'>
                            Are you sure you want to approve energy allocation for{' '}
                            <Text className='font-bold text-foreground'>
                                {selectedRequest?.household}
                            </Text>
                            ?
                        </Text>

                        {/* Impact Overview Box */}
                        <View className='rounded-xl bg-secondary/60 border border-border/40 p-3.5 mb-5'>
                            <View className='flex-row items-center justify-between mb-2'>
                                <Text className='text-xs text-muted-foreground'>
                                    Allocation Amount
                                </Text>
                                <Text className='text-xs font-bold text-foreground'>
                                    +{selectedRequest?.requestedAmount} kWh
                                </Text>
                            </View>
                            <View className='flex-row items-center justify-between'>
                                <Text className='text-xs text-muted-foreground'>
                                    Remaining Pool
                                </Text>
                                <Text className='text-xs font-bold text-[#10B981]'>
                                    {availableEnergy - (selectedRequest?.requestedAmount ?? 0)} kWh
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
                                onPress={confirmApproval}
                                className='flex-1 py-2.5 items-center justify-center rounded-xl bg-primary border border-primary/40 active:opacity-80 shadow-sm'
                            >
                                <Text className='text-xs font-bold text-primary-foreground'>
                                    Confirm Approval
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
