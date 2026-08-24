import TabScreenBackground from '@/components/shared/TabScreenBackground';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

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

    const pendingCount = requests.filter((r) => r.status === 'pending').length;
    const approvedCount = requests.filter((r) => r.status === 'approved').length;
    const rejectedCount = requests.filter((r) => r.status === 'rejected').length;
    const availableEnergy = 45;

    const handleApprove = (id: string, householdName: string) => {
        Alert.alert(
            'Approve Energy Request',
            `Are you sure you want to approve energy allocation for ${householdName}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Approve',
                    onPress: () => {
                        setRequests((prev) =>
                            prev.map((item) =>
                                item.id === id ? { ...item, status: 'approved' } : item
                            )
                        );
                    },
                },
            ]
        );
    };

    const handleReject = (id: string, householdName: string) => {
        Alert.alert(
            'Reject Energy Request',
            `Are you sure you want to reject energy allocation for ${householdName}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reject',
                    style: 'destructive',
                    onPress: () => {
                        setRequests((prev) =>
                            prev.map((item) =>
                                item.id === id ? { ...item, status: 'rejected' } : item
                            )
                        );
                    },
                },
            ]
        );
    };

    const handleReview = (request: EnergyRequestItem) => {
        Alert.alert(
            `${request.household} - Request Details`,
            `Current Usage: ${request.currentUsage} kWh\nPrevious Allocation: ${request.previousAllocation} kWh\nRequested Energy: ${request.requestedAmount} kWh\nStatus: ${request.status.toUpperCase()}\nSubmitted: ${request.requestedAt}`,
            [
                { text: 'Close', style: 'default' },
                request.status === 'pending'
                    ? {
                        text: 'Reject Request',
                        style: 'destructive',
                        onPress: () => handleReject(request.id, request.household),
                    }
                    : { text: 'OK' },
            ]
        );
    };

    const filteredRequests = requests.filter((req) => {
        const matchesSearch = req.household.toLowerCase().includes(searchQuery.toLowerCase());
        if (selectedFilter === 'all') return matchesSearch;
        return matchesSearch && req.status === selectedFilter;
    });

    return (
        <View className='flex-1'>
            <TabScreenBackground />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1, padding: 20, paddingBottom: 60 }}
                className='flex-1'
            >
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

                <View className='flex-row gap-4 mb-5 w-full'>
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

                    <View className='flex-1 flex-col justify-between rounded-xl border border-border/40 bg-secondary/60 p-4 shadow-sm'>
                        <View className='flex-row items-center justify-between'>
                            <Text className='text-3xl font-extrabold text-foreground'>
                                {availableEnergy} <Text className='text-lg font-bold text-muted-foreground'>kWh</Text>
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

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ gap: 10 }}
                    className='mb-5'
                >
                    <Pressable
                        onPress={() => setSelectedFilter('all')}
                        className={`px-5 py-2.5 rounded-full border ${selectedFilter === 'all'
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
                        className={`px-5 py-2.5 rounded-full border ${selectedFilter === 'pending'
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
                        className={`px-5 py-2.5 rounded-full border ${selectedFilter === 'approved'
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
                        className={`px-5 py-2.5 rounded-full border ${selectedFilter === 'rejected'
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

                <View className='flex-col gap-4'>
                    {filteredRequests.map((item) => {
                        const isPending = item.status === 'pending';
                        const isApproved = item.status === 'approved';
                        const isRejected = item.status === 'rejected';

                        return (
                            <View
                                key={item.id}
                                className='rounded-xl border border-border/40 bg-secondary/60 p-4 shadow-sm'
                            >
                                <View className='flex-row items-center justify-between mb-3.5'>
                                    <View className='flex-row items-center gap-2'>
                                        <View className='h-8 w-8 items-center justify-center rounded-lg bg-card border border-border/50'>
                                            <Feather name="home" size={15} color="#F59E0B" />
                                        </View>
                                        <Text className='text-base font-bold text-foreground'>
                                            {item.household}
                                        </Text>
                                    </View>

                                    <View
                                        className={`px-3 py-1 rounded-full border ${isPending
                                            ? 'bg-yellow-500/15 border-yellow-500/40'
                                            : isApproved
                                                ? 'bg-emerald-500/15 border-emerald-500/40'
                                                : 'bg-red-500/15 border-red-500/40'
                                            }`}
                                    >
                                        <Text
                                            className={`text-[11px] font-bold capitalize ${isPending
                                                ? 'text-[#F59E0B]'
                                                : isApproved
                                                    ? 'text-[#10B981]'
                                                    : 'text-[#EF4444]'
                                                }`}
                                        >
                                            {item.status}
                                        </Text>
                                    </View>
                                </View>

                                <View className='flex-row items-center justify-between rounded-xl bg-card/70 border border-border/30 p-3 mb-4'>
                                    <View className='flex-1'>
                                        <Text className='text-xs font-semibold text-muted-foreground'>
                                            Current Usage
                                        </Text>
                                        <Text className='text-lg font-extrabold text-foreground mt-0.5'>
                                            {item.currentUsage} <Text className='text-xs font-bold text-muted-foreground'>kWh</Text>
                                        </Text>
                                    </View>

                                    {/* Divider */}
                                    <View className='h-8 w-[1px] bg-border/60 mx-2' />

                                    {/* Previous Allocation */}
                                    <View className='flex-1 pl-2'>
                                        <Text className='text-xs font-semibold text-muted-foreground'>
                                            Previous Allocation
                                        </Text>
                                        <Text className='text-lg font-extrabold text-foreground mt-0.5'>
                                            {item.previousAllocation} <Text className='text-xs font-bold text-muted-foreground'>kWh</Text>
                                        </Text>
                                    </View>
                                </View>

                                {isPending ? (
                                    <View className='flex-row gap-3 w-full'>
                                        <Pressable
                                            onPress={() => handleReview(item)}
                                            className='flex-1 items-center justify-center rounded-xl bg-card border border-border/80 py-2.5 active:bg-secondary/70 shadow-sm'
                                        >
                                            <Text className='text-sm font-bold text-foreground'>
                                                Review
                                            </Text>
                                        </Pressable>

                                        <Pressable
                                            onPress={() => handleApprove(item.id, item.household)}
                                            className='flex-1 items-center justify-center rounded-xl bg-primary border border-primary/40 py-2.5 active:opacity-80 shadow-sm'
                                        >
                                            <Text className='text-sm font-bold text-primary-foreground'>
                                                Approve
                                            </Text>
                                        </Pressable>
                                    </View>
                                ) : isApproved ? (
                                    <View className='flex-row items-center justify-between pt-1'>
                                        <View className='flex-row items-center gap-1.5'>
                                            <Feather name="check-circle" size={14} color="#10B981" />
                                            <Text className='text-xs font-semibold text-[#10B981]'>
                                                Allocation approved ({item.requestedAmount} kWh)
                                            </Text>
                                        </View>
                                        <Pressable
                                            onPress={() => handleReview(item)}
                                            className='px-3 py-1 rounded-lg bg-card border border-border/50 active:bg-secondary'
                                        >
                                            <Text className='text-xs font-bold text-foreground'>
                                                Details
                                            </Text>
                                        </Pressable>
                                    </View>
                                ) : (
                                    <View className='flex-row items-center justify-between pt-1'>
                                        <View className='flex-row items-center gap-1.5'>
                                            <Feather name="x-circle" size={14} color="#EF4444" />
                                            <Text className='text-xs font-semibold text-[#EF4444]'>
                                                Request rejected
                                            </Text>
                                        </View>
                                        <Pressable
                                            onPress={() => handleApprove(item.id, item.household)}
                                            className='px-3 py-1 rounded-lg bg-primary/20 border border-primary/40 active:opacity-75'
                                        >
                                            <Text className='text-xs font-bold text-foreground'>
                                                Reconsider
                                            </Text>
                                        </Pressable>
                                    </View>
                                )}
                            </View>
                        );
                    })}

                    {filteredRequests.length === 0 && (
                        <View className='items-center justify-center py-12 px-4'>
                            <View className='h-14 w-14 items-center justify-center rounded-full bg-secondary/80 border border-border/60 mb-3'>
                                <Feather name="inbox" size={24} color="#9CA3AF" />
                            </View>
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
        </View>
    );
};

export default ManagerEnergyRequests;
