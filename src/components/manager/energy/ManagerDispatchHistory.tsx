import { Feather } from '@expo/vector-icons';
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
import type { ManagerDispatchRecord } from '@/hooks/manager/useDispatches';

function formatDispatchDate(dateStr: string) {
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return dateStr;
    }
}

export interface ManagerDispatchHistoryProps {
    dispatches?: ManagerDispatchRecord[];
    loading?: boolean;
    error?: string | null;
    refetch?: () => Promise<void>;
}

export const ManagerDispatchHistory: React.FC<ManagerDispatchHistoryProps> = ({
    dispatches = [],
    loading = false,
    error = null,
    refetch,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDispatch, setSelectedDispatch] = useState<ManagerDispatchRecord | null>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);

    // Calculate Summary Stats
    const totalDispatchedKwh = dispatches.reduce(
        (sum, d) => sum + (parseFloat(d.dispatchedEnergyKwh) || 0),
        0
    );
    const avgDispatchKwh =
        dispatches.length > 0 ? (totalDispatchedKwh / dispatches.length) : 0;

    // Filter dispatches based on search query
    const filteredDispatches = dispatches.filter((d) => {
        const query = searchQuery.toLowerCase();
        const household = (d.request?.householdName || '').toLowerCase();
        const producer = (d.offer?.ownerName || '').toLowerCase();
        const manager = (d.manager?.name || '').toLowerCase();
        const notes = (d.notes || '').toLowerCase();
        const id = (d.id || '').toLowerCase();

        return (
            household.includes(query) ||
            producer.includes(query) ||
            manager.includes(query) ||
            notes.includes(query) ||
            id.includes(query)
        );
    });

    const openDetailModal = (dispatch: ManagerDispatchRecord) => {
        setSelectedDispatch(dispatch);
        setDetailModalVisible(true);
    };

    const closeDetailModal = () => {
        setSelectedDispatch(null);
        setDetailModalVisible(false);
    };

    return (
        <View className='w-full'>
            {/* Top KPI Analytics Overview */}
            <View className='flex-row gap-3 mb-5 w-full'>
                {/* Total Dispatches */}
                <View className='flex-1 flex-col justify-between rounded-xl border border-border/40 bg-secondary/60 p-4 shadow-sm'>
                    <View className='flex-row items-center justify-between'>
                        <Text className='text-3xl font-extrabold text-foreground'>
                            {dispatches.length}
                        </Text>
                        <View className='h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/30'>
                            <Feather name="send" size={16} color="#10B981" />
                        </View>
                    </View>
                    <Text className='text-xs font-semibold text-muted-foreground mt-2'>
                        Total Dispatches
                    </Text>
                </View>

                {/* Total Energy Dispatched */}
                <View className='flex-1 flex-col justify-between rounded-xl border border-border/40 bg-secondary/60 p-4 shadow-sm'>
                    <View className='flex-row items-center justify-between'>
                        <Text className='text-3xl font-extrabold text-[#F59E0B]'>
                            {totalDispatchedKwh.toFixed(1)}
                        </Text>
                        <View className='h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/15 border border-yellow-500/30'>
                            <Feather name="zap" size={16} color="#F59E0B" />
                        </View>
                    </View>
                    <Text className='text-xs font-semibold text-muted-foreground mt-2'>
                        Dispatched (kWh)
                    </Text>
                </View>

                {/* Avg Dispatch Size */}
                <View className='flex-1 flex-col justify-between rounded-xl border border-border/40 bg-secondary/60 p-4 shadow-sm'>
                    <View className='flex-row items-center justify-between'>
                        <Text className='text-3xl font-extrabold text-[#3B82F6]'>
                            {avgDispatchKwh.toFixed(1)}
                        </Text>
                        <View className='h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15 border border-blue-500/30'>
                            <Feather name="activity" size={16} color="#3B82F6" />
                        </View>
                    </View>
                    <Text className='text-xs font-semibold text-muted-foreground mt-2'>
                        Avg / Dispatch
                    </Text>
                </View>
            </View>

            {/* Search Input Bar */}
            <View className='flex-row items-center bg-secondary/80 rounded-2xl border border-border/60 px-4 py-2 mb-4 shadow-sm'>
                <Feather name="search" size={18} color="#9CA3AF" />
                <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search by household, solar producer, manager..."
                    placeholderTextColor="#9CA3AF"
                    className='flex-1 ml-3 text-sm text-foreground py-1'
                />
                {searchQuery.length > 0 && (
                    <Pressable onPress={() => setSearchQuery('')}>
                        <Feather name="x" size={16} color="#9CA3AF" />
                    </Pressable>
                )}
            </View>

            {/* Loading State */}
            {loading && (
                <View className='items-center justify-center py-16'>
                    <ActivityIndicator size="large" color="#F59E0B" />
                    <Text className='text-xs font-semibold text-muted-foreground mt-3'>
                        Loading energy dispatch history from grid...
                    </Text>
                </View>
            )}

            {/* Error State */}
            {!loading && error && (
                <View className='items-center justify-center py-8 px-4 rounded-xl border border-red-500/30 bg-red-500/10 mb-4'>
                    <Feather name="alert-triangle" size={24} color="#EF4444" />
                    <Text className='text-sm font-bold text-[#EF4444] mt-2'>
                        Failed to load dispatch history
                    </Text>
                    <Text className='text-xs text-muted-foreground text-center mt-1 mb-4'>
                        {error}
                    </Text>
                    {refetch && (
                        <Pressable
                            onPress={refetch}
                            className='px-4 py-2 rounded-lg bg-primary active:opacity-80'
                        >
                            <Text className='text-xs font-bold text-primary-foreground'>
                                Retry
                            </Text>
                        </Pressable>
                    )}
                </View>
            )}

            {/* Dispatches List */}
            {!loading && !error && (
                <View className='flex-col gap-4'>
                    {filteredDispatches.map((item) => {
                        const amountKwh = parseFloat(item.dispatchedEnergyKwh) || 0;
                        const householdName = item.request?.householdName || 'Household Member';
                        const producerName = item.offer?.ownerName || 'Solar Producer';
                        const managerName = item.manager?.name || 'Community Manager';
                        const requestStatus = item.request?.status || 'approved';
                        const offerStatus = item.offer?.status || 'approved';

                        return (
                            <View
                                key={item.id}
                                className='rounded-xl border border-border/40 bg-secondary/60 p-4 shadow-sm'
                            >
                                {/* Dispatch Header & Status */}
                                <View className='flex-row items-center justify-between mb-3'>
                                    <View className='flex-row items-center gap-3 flex-1 mr-2'>
                                        <View className='h-10 w-10 items-center justify-center rounded-xl bg-card border border-border/60'>
                                            <Feather name="send" size={16} color="#10B981" />
                                        </View>
                                        <View className='flex-1'>
                                            <Text className='text-base font-bold text-foreground' numberOfLines={1}>
                                                {householdName}
                                            </Text>
                                            <Text className='text-xs text-muted-foreground' numberOfLines={1}>
                                                {formatDispatchDate(item.dispatchedAt)}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Dispatched Badge */}
                                    <View className='flex-row items-center gap-1.5'>
                                        <View className='flex-row items-center gap-1 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/40'>
                                            <Feather name="check" size={10} color="#10B981" />
                                            <Text className='text-[10px] font-bold text-[#10B981] uppercase'>
                                                Dispatched
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Energy Transfer Route Diagram */}
                                <View className='rounded-xl bg-card/70 border border-border/30 p-3 mb-3'>
                                    {/* Producer Source */}
                                    <View className='flex-row items-center justify-between'>
                                        <View className='flex-row items-center gap-2 flex-1 mr-2'>
                                            <Feather name="sun" size={14} color="#F59E0B" />
                                            <View className='flex-1'>
                                                <Text className='text-[10px] font-bold text-muted-foreground uppercase'>
                                                    Source Producer
                                                </Text>
                                                <Text className='text-xs font-bold text-foreground' numberOfLines={1}>
                                                    {producerName}
                                                </Text>
                                            </View>
                                        </View>
                                        <View className='items-end'>
                                            <Text className='text-[10px] font-semibold text-muted-foreground'>
                                                Offer Status
                                            </Text>
                                            <Text className={`text-xs font-bold ${
                                                offerStatus === 'completed' ? 'text-blue-400' : 'text-emerald-400'
                                            }`}>
                                                {offerStatus}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Transfer Divider with Allocated Amount */}
                                    <View className='flex-row items-center my-2'>
                                        <View className='flex-1 h-[1px] bg-border/50' />
                                        <View className='mx-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex-row items-center gap-1'>
                                            <Feather name="arrow-down" size={11} color="#10B981" />
                                            <Text className='text-xs font-extrabold text-[#10B981]'>
                                                {amountKwh.toFixed(1)} kWh
                                            </Text>
                                        </View>
                                        <View className='flex-1 h-[1px] bg-border/50' />
                                    </View>

                                    {/* Household Destination */}
                                    <View className='flex-row items-center justify-between'>
                                        <View className='flex-row items-center gap-2 flex-1 mr-2'>
                                            <Feather name="home" size={14} color="#10B981" />
                                            <View className='flex-1'>
                                                <Text className='text-[10px] font-bold text-muted-foreground uppercase'>
                                                    Recipient Household
                                                </Text>
                                                <Text className='text-xs font-bold text-foreground' numberOfLines={1}>
                                                    {householdName}
                                                </Text>
                                            </View>
                                        </View>
                                        <View className='items-end'>
                                            <Text className='text-[10px] font-semibold text-muted-foreground'>
                                                Request Status
                                            </Text>
                                            <Text className={`text-xs font-bold ${
                                                requestStatus === 'fulfilled' ? 'text-purple-400' : 'text-emerald-400'
                                            }`}>
                                                {requestStatus}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Footer & Details Trigger */}
                                <View className='flex-row items-center justify-between pt-1'>
                                    <View className='flex-row items-center gap-1.5 flex-1 mr-2'>
                                        <Feather name="user-check" size={12} color="#9CA3AF" />
                                        <Text className='text-[11px] text-muted-foreground' numberOfLines={1}>
                                            Manager: <Text className='font-bold text-foreground'>{managerName}</Text>
                                        </Text>
                                    </View>

                                    <Pressable
                                        onPress={() => openDetailModal(item)}
                                        className='px-3.5 py-1.5 rounded-lg bg-card border border-border/80 active:bg-secondary shadow-sm'
                                    >
                                        <Text className='text-xs font-bold text-foreground'>
                                            Details
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>
                        );
                    })}

                    {/* Empty State */}
                    {filteredDispatches.length === 0 && (
                        <View className='items-center justify-center py-16 px-4 rounded-xl border border-dashed border-border/60 bg-secondary/30'>
                            <View className='h-14 w-14 rounded-full bg-secondary border border-border/60 items-center justify-center mb-3 shadow-sm'>
                                <Feather name="inbox" size={24} color="#9CA3AF" />
                            </View>
                            <Text className='text-base font-bold text-foreground'>
                                {searchQuery ? 'No matching dispatches' : 'No Dispatches Executed Yet'}
                            </Text>
                            <Text className='text-xs text-muted-foreground text-center mt-1 max-w-xs leading-4'>
                                {searchQuery
                                    ? `No dispatch records match "${searchQuery}". Try a different keyword.`
                                    : 'When energy is dispatched from community solar offers to household requests, the execution history will appear here.'}
                            </Text>
                        </View>
                    )}
                </View>
            )}

            {/* Dispatch Detail Modal */}
            <Modal
                visible={detailModalVisible}
                transparent
                animationType="fade"
                onRequestClose={closeDetailModal}
            >
                <View className='flex-1 bg-black/60 items-center justify-center p-4'>
                    <View className='w-full max-w-md bg-card border border-border/80 rounded-2xl p-5 shadow-2xl'>
                        {/* Modal Header */}
                        <View className='flex-row items-center justify-between border-b border-border/40 pb-3 mb-4'>
                            <View className='flex-row items-center gap-2'>
                                <View className='h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/30'>
                                    <Feather name="send" size={15} color="#10B981" />
                                </View>
                                <View>
                                    <Text className='text-base font-extrabold text-foreground'>
                                        Dispatch Audit Details
                                    </Text>
                                    <Text className='text-[10px] text-muted-foreground'>
                                        ID: {selectedDispatch?.id}
                                    </Text>
                                </View>
                            </View>

                            <Pressable
                                onPress={closeDetailModal}
                                className='h-8 w-8 items-center justify-center rounded-full bg-secondary active:opacity-75'
                            >
                                <Feather name="x" size={16} color="#9CA3AF" />
                            </Pressable>
                        </View>

                        {selectedDispatch && (
                            <ScrollView showsVerticalScrollIndicator={false} className='max-h-[460px]'>
                                {/* Allocated Energy Stat Banner */}
                                <View className='rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3.5 items-center mb-4'>
                                    <Text className='text-[11px] font-semibold text-emerald-500 uppercase tracking-wider'>
                                        Dispatched Clean Energy
                                    </Text>
                                    <Text className='text-3xl font-extrabold text-[#10B981] my-0.5'>
                                        {parseFloat(selectedDispatch.dispatchedEnergyKwh).toFixed(1)}{' '}
                                        <Text className='text-sm font-bold text-emerald-500'>kWh</Text>
                                    </Text>
                                    <Text className='text-xs text-muted-foreground'>
                                        {formatDispatchDate(selectedDispatch.dispatchedAt)}
                                    </Text>
                                </View>

                                {/* Household Request Section */}
                                <View className='rounded-xl bg-secondary/60 border border-border/40 p-3.5 mb-3'>
                                    <View className='flex-row items-center gap-2 mb-2'>
                                        <Feather name="home" size={14} color="#10B981" />
                                        <Text className='text-xs font-bold text-foreground'>
                                            Recipient Household
                                        </Text>
                                    </View>
                                    <View className='flex-row justify-between py-1 border-b border-border/30'>
                                        <Text className='text-xs text-muted-foreground'>Member Name</Text>
                                        <Text className='text-xs font-semibold text-foreground'>
                                            {selectedDispatch.request?.householdName || 'Household'}
                                        </Text>
                                    </View>
                                    <View className='flex-row justify-between py-1 border-b border-border/30'>
                                        <Text className='text-xs text-muted-foreground'>Email</Text>
                                        <Text className='text-xs font-semibold text-foreground'>
                                            {selectedDispatch.request?.householdEmail || 'Not specified'}
                                        </Text>
                                    </View>
                                    <View className='flex-row justify-between py-1 border-b border-border/30'>
                                        <Text className='text-xs text-muted-foreground'>Initial Request</Text>
                                        <Text className='text-xs font-semibold text-foreground'>
                                            {parseFloat(selectedDispatch.request?.requestedEnergyKwh || '0').toFixed(1)} kWh
                                        </Text>
                                    </View>
                                    <View className='flex-row justify-between py-1'>
                                        <Text className='text-xs text-muted-foreground'>Request Status</Text>
                                        <Text className={`text-xs font-extrabold uppercase ${
                                            selectedDispatch.request?.status === 'fulfilled'
                                                ? 'text-purple-400'
                                                : 'text-emerald-400'
                                        }`}>
                                            {selectedDispatch.request?.status}
                                        </Text>
                                    </View>
                                </View>

                                {/* Solar Producer Section */}
                                <View className='rounded-xl bg-secondary/60 border border-border/40 p-3.5 mb-3'>
                                    <View className='flex-row items-center gap-2 mb-2'>
                                        <Feather name="sun" size={14} color="#F59E0B" />
                                        <Text className='text-xs font-bold text-foreground'>
                                            Source Solar Producer
                                        </Text>
                                    </View>
                                    <View className='flex-row justify-between py-1 border-b border-border/30'>
                                        <Text className='text-xs text-muted-foreground'>Owner Name</Text>
                                        <Text className='text-xs font-semibold text-foreground'>
                                            {selectedDispatch.offer?.ownerName || 'Solar Producer'}
                                        </Text>
                                    </View>
                                    <View className='flex-row justify-between py-1 border-b border-border/30'>
                                        <Text className='text-xs text-muted-foreground'>Email</Text>
                                        <Text className='text-xs font-semibold text-foreground'>
                                            {selectedDispatch.offer?.ownerEmail || 'Not specified'}
                                        </Text>
                                    </View>
                                    <View className='flex-row justify-between py-1 border-b border-border/30'>
                                        <Text className='text-xs text-muted-foreground'>Total Offered</Text>
                                        <Text className='text-xs font-semibold text-foreground'>
                                            {parseFloat(selectedDispatch.offer?.energyAmountKwh || '0').toFixed(1)} kWh
                                        </Text>
                                    </View>
                                    <View className='flex-row justify-between py-1'>
                                        <Text className='text-xs text-muted-foreground'>Offer Status</Text>
                                        <Text className={`text-xs font-extrabold uppercase ${
                                            selectedDispatch.offer?.status === 'completed'
                                                ? 'text-blue-400'
                                                : 'text-emerald-400'
                                        }`}>
                                            {selectedDispatch.offer?.status}
                                        </Text>
                                    </View>
                                </View>

                                {/* Manager Authorization Section */}
                                <View className='rounded-xl bg-secondary/60 border border-border/40 p-3.5 mb-4'>
                                    <View className='flex-row items-center gap-2 mb-2'>
                                        <Feather name="shield" size={14} color="#3B82F6" />
                                        <Text className='text-xs font-bold text-foreground'>
                                            Authorization & Audit
                                        </Text>
                                    </View>
                                    <View className='flex-row justify-between py-1 border-b border-border/30'>
                                        <Text className='text-xs text-muted-foreground'>Authorized By</Text>
                                        <Text className='text-xs font-semibold text-foreground'>
                                            {selectedDispatch.manager?.name || 'Manager'}
                                        </Text>
                                    </View>
                                    <View className='flex-row justify-between py-1 border-b border-border/30'>
                                        <Text className='text-xs text-muted-foreground'>Manager Role</Text>
                                        <Text className='text-xs font-semibold text-foreground uppercase'>
                                            {selectedDispatch.manager?.role || 'manager'}
                                        </Text>
                                    </View>
                                    {selectedDispatch.notes && (
                                        <View className='pt-2'>
                                            <Text className='text-[11px] text-muted-foreground font-medium'>
                                                Notes: "{selectedDispatch.notes}"
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </ScrollView>
                        )}

                        {/* Close Modal Button */}
                        <Pressable
                            onPress={closeDetailModal}
                            className='w-full py-3 items-center justify-center rounded-xl bg-secondary border border-border/60 active:opacity-75'
                        >
                            <Text className='text-xs font-bold text-foreground'>
                                Close Details
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default ManagerDispatchHistory;
