import TabScreenBackground from '@/components/shared/TabScreenBackground';
import { getApiUrl } from '@/lib/api';
import {
    useEnergyRequests,
    useEnergyRequestDetail,
    type ManagerEnergyRequest,
} from '@/hooks/manager/useEnergyRequests';
import { useSolarOffers, type ManagerSolarOffer } from '@/hooks/manager/useSolarOffers';
import { useCommunityReserve } from '@/hooks/manager/useCommunityReserve';
import { useDispatches } from '@/hooks/manager/useDispatches';
import ManagerSolarOffers, { getOfferRemainingKwh, isOfferDispatchable } from './ManagerSolarOffers';
import ManagerDispatchHistory from './ManagerDispatchHistory';
import { useUser } from '@clerk/expo';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
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

export interface AllocationValidationResult {
    isValid: boolean;
    error: string | null;
}

export function validateAllocationAmount(
    amountStr: string,
    requestedKwh: number,
    availableOfferKwh: number
): AllocationValidationResult {
    const trimmed = amountStr.trim();
    if (!trimmed) {
        return { isValid: false, error: 'Allocation amount is required' };
    }

    const num = parseFloat(trimmed);
    if (isNaN(num)) {
        return { isValid: false, error: 'Allocation amount must be a numeric value' };
    }

    if (num <= 0) {
        return { isValid: false, error: 'Allocation amount must be greater than zero kWh' };
    }

    if (num > requestedKwh) {
        return {
            isValid: false,
            error: `Allocation amount (${num.toFixed(1)} kWh) cannot exceed remaining requested energy (${requestedKwh.toFixed(1)} kWh)`,
        };
    }

    if (num > availableOfferKwh) {
        return {
            isValid: false,
            error: `Allocation amount (${num.toFixed(1)} kWh) cannot exceed remaining available solar offer (${availableOfferKwh.toFixed(1)} kWh)`,
        };
    }

    return { isValid: true, error: null };
}

export interface ManagerEnergyRequestsProps {
    selectedDispatchRequestId?: string | null;
    selectedDispatchOfferId?: string | null;
    allocationAmount?: string;
    onSelectRequestForDispatch?: (request: ManagerEnergyRequest | null) => void;
    onSelectOfferForDispatch?: (offer: ManagerSolarOffer | null) => void;
    onAllocationAmountChange?: (amount: string) => void;
}

export const ManagerEnergyRequests: React.FC<ManagerEnergyRequestsProps> = ({
    selectedDispatchRequestId: propSelectedDispatchRequestId,
    selectedDispatchOfferId: propSelectedDispatchOfferId,
    allocationAmount: propAllocationAmount,
    onSelectRequestForDispatch,
    onSelectOfferForDispatch,
    onAllocationAmountChange,
}) => {
    const router = useRouter();
    const { user } = useUser();
    const { requests, loading, error, refetch, approveRequest, rejectRequest } = useEnergyRequests({ managerId: user?.id });
    const {
        offers,
        loading: offersLoading,
        error: offersError,
        refetch: refetchOffers,
        approveOffer: approveSolarOffer,
        rejectOffer: rejectSolarOffer,
    } = useSolarOffers({ managerId: user?.id });
    const {
        dispatches,
        loading: dispatchesLoading,
        error: dispatchesError,
        refetch: refetchDispatches,
    } = useDispatches({ managerId: user?.id });
    const {
        data: reserveData,
        loading: reserveLoading,
        error: reserveError,
        refetch: refetchReserve,
    } = useCommunityReserve({ managerId: user?.id });

    // Automatically synchronize live data when screen regains focus
    useFocusEffect(
        useCallback(() => {
            refetch();
            refetchOffers();
            refetchReserve();
        }, [refetch, refetchOffers, refetchReserve])
    );

    const [activeSection, setActiveSection] = useState<'requests' | 'offers' | 'dispatches'>('requests');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

    // Modals & Selection State
    const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
    const [selectedApproveItem, setSelectedApproveItem] = useState<ManagerEnergyRequest | null>(null);
    const [selectedRejectItem, setSelectedRejectItem] = useState<ManagerEnergyRequest | null>(null);
    const [reviewModalVisible, setReviewModalVisible] = useState(false);
    const [approveModalVisible, setApproveModalVisible] = useState(false);
    const [rejectModalVisible, setRejectModalVisible] = useState(false);

    // Action state (approval & rejection)
    const [isApproving, setIsApproving] = useState(false);
    const [approveError, setApproveError] = useState<string | null>(null);
    const [isRejecting, setIsRejecting] = useState(false);
    const [rejectError, setRejectError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Dispatch Selection State (US-12)
    const [selectedDispatchRequestId, setSelectedDispatchRequestId] = useState<string | null>(
        propSelectedDispatchRequestId ?? null
    );
    const [selectedDispatchOfferId, setSelectedDispatchOfferId] = useState<string | null>(
        propSelectedDispatchOfferId ?? null
    );

    // Dispatch Allocation State (US-12)
    const [allocationAmount, setAllocationAmount] = useState<string>(propAllocationAmount ?? '');
    const [allocationTouched, setAllocationTouched] = useState(false);
    const [allocationModalVisible, setAllocationModalVisible] = useState(false);
    const [confirmedAllocation, setConfirmedAllocation] = useState<number | null>(null);

    // Server Validation & Dispatch Execution State (US-12)
    const [isValidatingServer, setIsValidatingServer] = useState(false);
    const [isDispatching, setIsDispatching] = useState(false);
    const [serverValidationError, setServerValidationError] = useState<string | null>(null);
    const [serverValidatedData, setServerValidatedData] = useState<{
        dispatchAmount: number;
        request: {
            id: string;
            householdName: string | null;
            requestedEnergyKwh: string;
            remainingRequestedKwh: number;
            status: string;
        };
        offer: {
            id: string;
            ownerName: string | null;
            energyAmountKwh: string;
            availableOfferKwh: number;
            status: string;
        };
    } | null>(null);

    const openAllocationModal = () => {
        setServerValidationError(null);
        setAllocationModalVisible(true);
    };

    useEffect(() => {
        if (propSelectedDispatchRequestId !== undefined) {
            setSelectedDispatchRequestId(propSelectedDispatchRequestId);
        }
    }, [propSelectedDispatchRequestId]);

    useEffect(() => {
        if (propSelectedDispatchOfferId !== undefined) {
            setSelectedDispatchOfferId(propSelectedDispatchOfferId);
        }
    }, [propSelectedDispatchOfferId]);

    useEffect(() => {
        if (propAllocationAmount !== undefined) {
            setAllocationAmount(propAllocationAmount);
        }
    }, [propAllocationAmount]);

    const handleSelectRequestForDispatch = (request: ManagerEnergyRequest) => {
        // Enforce: Only approved requests with remaining needed energy can be selected for dispatch
        if (request.status !== 'approved') return;
        const totalReq = parseFloat(request.requestedEnergyKwh) || 0;
        const rem = request.remainingEnergyKwh !== undefined
            ? request.remainingEnergyKwh
            : Math.max(0, totalReq - (request.totalDispatchedKwh || 0));
        if (rem <= 0.001) return;

        const nextSelectedId = selectedDispatchRequestId === request.id ? null : request.id;
        const nextItem = nextSelectedId ? request : null;

        setSelectedDispatchRequestId(nextSelectedId);
        onSelectRequestForDispatch?.(nextItem);
    };

    const handleSelectOfferForDispatch = (offer: ManagerSolarOffer | null) => {
        setSelectedDispatchOfferId(offer ? offer.id : null);
        onSelectOfferForDispatch?.(offer);
    };

    const handleAllocationChange = (val: string) => {
        setAllocationAmount(val);
        setAllocationTouched(true);
        setServerValidationError(null);
        onAllocationAmountChange?.(val);
    };

    const handleExecuteDispatch = async (amount: number) => {
        if (!selectedDispatchRequestId || !selectedDispatchOfferId || amount <= 0) {
            return;
        }

        setIsDispatching(true);
        setServerValidationError(null);

        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };
            if (user?.id) {
                headers['x-user-id'] = user.id;
            }

            const response = await fetch(getApiUrl('/api/dispatches'), {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    offerId: selectedDispatchOfferId,
                    requestId: selectedDispatchRequestId,
                    dispatchedEnergyKwh: amount,
                    notes: `Dispatched via Manager Console`,
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok || !data.success) {
                const errorMessage =
                    data.error ||
                    data.message ||
                    'Failed to create energy dispatch. Selected offer or request may have changed.';
                setServerValidationError(errorMessage);
                // Stale UI prevention: refresh requests and offers immediately
                refetch();
                refetchOffers();
                return;
            }

            // Real backend dispatch was created successfully!
            const createdDispatch = data.dispatch || data.data;
            const householdName = selectedDispatchItem?.householdName || 'Household';
            const producerName = selectedDispatchOffer?.ownerName || 'Solar Producer';
            const reqStatus = createdDispatch?.request?.status || 'updated';
            const offStatus = createdDispatch?.offer?.status || 'updated';

            // Clear dispatch selection
            setSelectedDispatchRequestId(null);
            setSelectedDispatchOfferId(null);
            setAllocationAmount('');
            setConfirmedAllocation(null);
            setServerValidatedData(null);
            setAllocationModalVisible(false);
            onSelectRequestForDispatch?.(null);
            onSelectOfferForDispatch?.(null);
            onAllocationAmountChange?.('');

            // Synchronize with database
            await Promise.all([refetch(), refetchOffers(), refetchDispatches(), refetchReserve()]);

            setSuccessMessage(
                `Successfully dispatched ${amount.toFixed(1)} kWh from ${producerName} to ${householdName}! (Request status: ${reqStatus}, Offer status: ${offStatus})`
            );
            setTimeout(() => setSuccessMessage(null), 6000);
        } catch (err: any) {
            console.error('[Energy Dispatch Execution Error]', err);
            setServerValidationError(
                err?.message || 'Network error while executing dispatch'
            );
            refetch();
            refetchOffers();
        } finally {
            setIsDispatching(false);
        }
    };

    const selectedDispatchItem = requests.find((r) => r.id === selectedDispatchRequestId) || null;
    const selectedDispatchOffer = offers.find((o) => o.id === selectedDispatchOfferId) || null;

    const totalRequestedKwh = selectedDispatchItem ? parseFloat(selectedDispatchItem.requestedEnergyKwh) : 0;
    const requestedKwh = selectedDispatchItem
        ? (selectedDispatchItem.remainingEnergyKwh !== undefined
            ? selectedDispatchItem.remainingEnergyKwh
            : Math.max(0, totalRequestedKwh - (selectedDispatchItem.totalDispatchedKwh || 0)))
        : 0;

    const totalOfferKwh = selectedDispatchOffer ? parseFloat(selectedDispatchOffer.energyAmountKwh) : 0;
    const availableOfferKwh = selectedDispatchOffer
        ? (selectedDispatchOffer.remainingEnergyKwh !== undefined
            ? selectedDispatchOffer.remainingEnergyKwh
            : Math.max(0, totalOfferKwh - (selectedDispatchOffer.totalDispatchedKwh || 0)))
        : 0;

    const maxAllocatableKwh = Math.min(requestedKwh, availableOfferKwh);
    const enteredAmountNumeric = parseFloat(allocationAmount) || 0;

    const allocationValidation = validateAllocationAmount(
        allocationAmount,
        requestedKwh,
        availableOfferKwh
    );

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

    // Calculate live available community solar energy from approved, non-expired offers
    const calculatedAvailableEnergy = parseFloat(
        offers
            .filter(isOfferDispatchable)
            .reduce((sum, o) => sum + getOfferRemainingKwh(o), 0)
            .toFixed(1)
    );

    const availableEnergy =
        reserveData?.availableReserveKwh !== undefined
            ? reserveData.availableReserveKwh
            : (!isNaN(calculatedAvailableEnergy) ? calculatedAvailableEnergy : 0);

    const isAvailableLoading =
        reserveLoading && !reserveData && offersLoading && offers.length === 0;

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
        setApproveError(null);
        setApproveModalVisible(true);
    };

    const openRejectModal = (item: ManagerEnergyRequest) => {
        setSelectedRejectItem(item);
        setRejectError(null);
        setRejectModalVisible(true);
    };

    const handleConfirmApprove = async () => {
        if (!selectedApproveItem) return;
        setIsApproving(true);
        setApproveError(null);

        try {
            await approveRequest(selectedApproveItem.id, user?.id);
            const householdName = selectedApproveItem.householdName || 'Household';
            setApproveModalVisible(false);
            setSelectedApproveItem(null);
            setSuccessMessage(`Energy request for ${householdName} approved successfully.`);
            setTimeout(() => setSuccessMessage(null), 4000);
        } catch (err: any) {
            setApproveError(err?.message || 'Failed to approve request');
        } finally {
            setIsApproving(false);
        }
    };

    const handleConfirmReject = async () => {
        if (!selectedRejectItem) return;
        setIsRejecting(true);
        setRejectError(null);

        try {
            await rejectRequest(selectedRejectItem.id, user?.id);
            const householdName = selectedRejectItem.householdName || 'Household';
            setRejectModalVisible(false);
            setSelectedRejectItem(null);
            setSuccessMessage(`Energy request for ${householdName} was rejected.`);
            setTimeout(() => setSuccessMessage(null), 4000);
        } catch (err: any) {
            setRejectError(err?.message || 'Failed to reject request');
        } finally {
            setIsRejecting(false);
        }
    };

    const filteredRequests = requests.filter((req) => {
        const household = (req.householdName || '').toLowerCase();
        const reason = (req.reason || '').toLowerCase();
        const query = searchQuery.toLowerCase();
        const matchesSearch = household.includes(query) || reason.includes(query);

        if (selectedFilter === 'all') return matchesSearch;
        return matchesSearch && req.status === selectedFilter;
    });

    const isRefreshing =
        loading || offersLoading || dispatchesLoading || reserveLoading;

    const handleRefresh = useCallback(async () => {
        if (activeSection === 'requests') {
            await Promise.all([refetch(), refetchOffers(), refetchReserve()]);
            return;
        }
        if (activeSection === 'offers') {
            await Promise.all([refetchOffers(), refetchReserve(), refetch()]);
            return;
        }
        await Promise.all([refetchDispatches(), refetchReserve()]);
    }, [activeSection, refetch, refetchOffers, refetchDispatches, refetchReserve]);

    const handleRefetchOffers = useCallback(async () => {
        await Promise.all([refetchOffers(), refetchReserve()]);
    }, [refetchOffers, refetchReserve]);

    return (
        <View className='flex-1 bg-background'>
            <TabScreenBackground />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1, padding: 20, paddingVertical: 60 }}
                className='flex-1'
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        tintColor="#F59E0B"
                        colors={['#F59E0B']}
                    />
                }
            >
                {/* Header */}
                <View className='flex-row items-center justify-between mb-5'>
                    <View className='flex-row items-center gap-2'>
                        <Pressable
                            onPress={() => router.canGoBack() && router.back()}
                            className='h-10 w-10 items-center justify-center rounded-xl bg-secondary/80 border border-border/60 active:opacity-70 mr-1'
                        >
                            <Feather name="chevron-left" size={22} color="#F59E0B" />
                        </Pressable>

                        <View>
                            <Text className='text-2xl font-extrabold text-foreground tracking-tight'>
                                {activeSection === 'requests'
                                    ? 'Energy Requests'
                                    : activeSection === 'offers'
                                        ? 'Solar Offers'
                                        : 'Dispatch History'}
                            </Text>
                            <Text className='text-xs text-muted-foreground mt-0.5'>
                                {activeSection === 'requests'
                                    ? 'Review & allocate community solar power'
                                    : activeSection === 'offers'
                                        ? 'Review energy shared by solar owners'
                                        : 'Audit & track community energy dispatches'}
                            </Text>
                        </View>
                    </View>

                    <Pressable
                        onPress={handleRefresh}
                        className='h-10 w-10 items-center justify-center rounded-2xl bg-secondary border border-border/60 shadow-sm active:opacity-75'
                    >
                        <Feather name="refresh-cw" size={18} color="#F59E0B" />
                    </Pressable>
                </View>

                {/* Section Switcher: Household Requests vs Solar Offers vs Dispatches */}
                <View className='flex-row bg-secondary/80 p-1 rounded-2xl border border-border/60 mb-5 shadow-sm'>
                    <Pressable
                        onPress={() => setActiveSection('requests')}
                        className={`flex-1 flex-row items-center justify-center py-2.5 rounded-xl gap-1.5 ${
                            activeSection === 'requests'
                                ? 'bg-primary shadow-sm'
                                : 'active:opacity-75'
                        }`}
                    >
                        <Feather
                            name="download"
                            size={13}
                            color={activeSection === 'requests' ? '#000000' : '#9CA3AF'}
                        />
                        <Text
                            className={`text-[11px] font-bold ${
                                activeSection === 'requests'
                                    ? 'text-primary-foreground'
                                    : 'text-muted-foreground'
                            }`}
                            numberOfLines={1}
                        >
                            Requests ({requests.length})
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={() => setActiveSection('offers')}
                        className={`flex-1 flex-row items-center justify-center py-2.5 rounded-xl gap-1.5 ${
                            activeSection === 'offers'
                                ? 'bg-primary shadow-sm'
                                : 'active:opacity-75'
                        }`}
                    >
                        <Feather
                            name="sun"
                            size={13}
                            color={activeSection === 'offers' ? '#000000' : '#9CA3AF'}
                        />
                        <Text
                            className={`text-[11px] font-bold ${
                                activeSection === 'offers'
                                    ? 'text-primary-foreground'
                                    : 'text-muted-foreground'
                            }`}
                            numberOfLines={1}
                        >
                            Offers ({offers.length})
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={() => setActiveSection('dispatches')}
                        className={`flex-1 flex-row items-center justify-center py-2.5 rounded-xl gap-1.5 ${
                            activeSection === 'dispatches'
                                ? 'bg-primary shadow-sm'
                                : 'active:opacity-75'
                        }`}
                    >
                        <Feather
                            name="activity"
                            size={13}
                            color={activeSection === 'dispatches' ? '#000000' : '#9CA3AF'}
                        />
                        <Text
                            className={`text-[11px] font-bold ${
                                activeSection === 'dispatches'
                                    ? 'text-primary-foreground'
                                    : 'text-muted-foreground'
                            }`}
                            numberOfLines={1}
                        >
                            History ({dispatches.length})
                        </Text>
                    </Pressable>
                </View>

                {activeSection === 'offers' ? (
                    <ManagerSolarOffers
                        offers={offers}
                        loading={offersLoading}
                        error={offersError}
                        refetch={handleRefetchOffers}
                        approveOffer={approveSolarOffer}
                        rejectOffer={rejectSolarOffer}
                        selectedDispatchRequestId={selectedDispatchRequestId}
                        selectedRequest={selectedDispatchItem}
                        selectedDispatchOfferId={selectedDispatchOfferId}
                        confirmedAllocation={confirmedAllocation}
                        onSelectOfferForDispatch={handleSelectOfferForDispatch}
                        onOpenAllocation={() => setAllocationModalVisible(true)}
                    />
                ) : activeSection === 'dispatches' ? (
                    <ManagerDispatchHistory
                        dispatches={dispatches}
                        loading={dispatchesLoading}
                        error={dispatchesError}
                        refetch={refetchDispatches}
                    />
                ) : (
                    <>
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
                            {isAvailableLoading ? (
                                <View className='h-9 justify-center'>
                                    <ActivityIndicator size="small" color="#10B981" />
                                </View>
                            ) : (
                                <Text className='text-3xl font-extrabold text-foreground'>
                                    {availableEnergy} <Text className='text-base font-bold text-muted-foreground'>kWh</Text>
                                </Text>
                            )}
                            <View className='h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/30'>
                                <Feather name="zap" size={16} color="#10B981" />
                            </View>
                        </View>
                        <Text className='text-xs font-semibold text-muted-foreground mt-2'>
                            Available Energy
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
                </View>

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

                {/* Active Dispatch Selection Banner */}
                {selectedDispatchItem && (
                    <View className='mb-4 rounded-xl border border-emerald-500/50 bg-emerald-500/10 p-3.5 flex-row items-center justify-between shadow-sm'>
                        <View className='flex-1 mr-2'>
                            <View className='flex-row items-center gap-1.5 mb-0.5'>
                                <Feather name="check-circle" size={13} color="#10B981" />
                                <Text className='text-xs font-bold text-foreground'>
                                    Selected for Energy Dispatch
                                </Text>
                            </View>
                            <Text className='text-xs text-muted-foreground' numberOfLines={1}>
                                {selectedDispatchItem.householdName || 'Household Member'} • {requestedKwh.toFixed(1)} kWh remaining needed ({parseFloat(selectedDispatchItem.requestedEnergyKwh).toFixed(1)} kWh total request)
                            </Text>
                            {selectedDispatchOffer && (
                                <Text className='text-xs font-semibold text-emerald-500 mt-1' numberOfLines={1}>
                                    Paired Solar: {selectedDispatchOffer.ownerName || 'Solar Producer'} ({availableOfferKwh.toFixed(1)} kWh remaining available)
                                </Text>
                            )}
                            {confirmedAllocation !== null && (
                                <View className='flex-col gap-0.5 mt-1'>
                                    <Text className='text-xs font-bold text-[#F59E0B]' numberOfLines={1}>
                                        Allocated Amount: {confirmedAllocation.toFixed(1)} kWh (Verified)
                                    </Text>
                                    {serverValidatedData && (
                                        <Text className='text-[10px] text-muted-foreground' numberOfLines={1}>
                                            Remaining Req: {serverValidatedData.request.remainingRequestedKwh.toFixed(1)} kWh • Offer Available: {serverValidatedData.offer.availableOfferKwh.toFixed(1)} kWh
                                        </Text>
                                    )}
                                </View>
                            )}
                        </View>
                        <View className='flex-col items-end gap-1.5'>
                            {selectedDispatchOffer ? (
                                <View className='flex-row items-center gap-1.5'>
                                    {confirmedAllocation !== null && (
                                        <Pressable
                                            disabled={isDispatching}
                                            onPress={() => handleExecuteDispatch(confirmedAllocation)}
                                            className='px-2.5 py-1.5 rounded-lg bg-emerald-500 border border-emerald-600 active:opacity-80 flex-row items-center gap-1 shadow-sm'
                                        >
                                            {isDispatching ? (
                                                <ActivityIndicator size="small" color="#FFFFFF" />
                                            ) : (
                                                <Feather name="send" size={11} color="#FFFFFF" />
                                            )}
                                            <Text className='text-[11px] font-bold text-white'>
                                                {isDispatching ? 'Dispatching...' : 'Dispatch'}
                                            </Text>
                                        </Pressable>
                                    )}
                                    <Pressable
                                        onPress={openAllocationModal}
                                        className='px-2.5 py-1.5 rounded-lg bg-primary active:opacity-80'
                                    >
                                        <Text className='text-[11px] font-bold text-primary-foreground'>
                                            {confirmedAllocation !== null ? 'Edit' : 'Allocate Energy →'}
                                        </Text>
                                    </Pressable>
                                </View>
                            ) : (
                                <Pressable
                                    onPress={() => setActiveSection('offers')}
                                    className='px-2.5 py-1.5 rounded-lg bg-primary active:opacity-80'
                                >
                                    <Text className='text-[11px] font-bold text-primary-foreground'>
                                        Select Offer →
                                    </Text>
                                </Pressable>
                            )}
                            <Pressable
                                onPress={() => handleSelectRequestForDispatch(selectedDispatchItem)}
                                className='px-2.5 py-1.5 rounded-lg bg-card border border-border/60 active:opacity-75'
                            >
                                <Text className='text-[11px] font-bold text-muted-foreground'>
                                    Deselect
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                )}

                {/* Household Requests List */}
                {!loading && !error && (
                    <View className='flex-col gap-4'>
                        {filteredRequests.map((item) => {
                            const isPending = item.status === 'pending';
                            const isApproved = item.status === 'approved';
                            const isFulfilled = item.status === 'fulfilled';
                            const isSelectedForDispatch = selectedDispatchRequestId === item.id;
                            const totalReqKwh = parseFloat(item.requestedEnergyKwh) || 0;
                            const totalDispKwh = item.totalDispatchedKwh ?? 0;
                            const remainingKwh = item.remainingEnergyKwh !== undefined
                                ? item.remainingEnergyKwh
                                : Math.max(0, totalReqKwh - totalDispKwh);
                            const isPartiallyDispatched = isApproved && totalDispKwh > 0;
                            const isFullyFulfilled = (isApproved && remainingKwh <= 0.001) || isFulfilled;
                            const formattedKwh = totalReqKwh.toFixed(1);

                            return (
                                <View
                                    key={item.id}
                                    className={`rounded-xl border p-4 shadow-sm ${
                                        isSelectedForDispatch
                                            ? 'border-emerald-500/80 bg-emerald-500/10'
                                            : 'border-border/40 bg-secondary/60'
                                    }`}
                                >
                                    {/* Household Header & Status Pill */}
                                    <View className='flex-row items-center justify-between mb-3'>
                                        <View className='flex-row items-center gap-3 flex-1 mr-2'>
                                            <View className='h-10 w-10 items-center justify-center rounded-xl bg-card border border-border/60'>
                                                <Feather name="home" size={16} color={isSelectedForDispatch ? "#10B981" : "#F59E0B"} />
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

                                        {/* Status Badge & Dispatch Selection Pill */}
                                        <View className='flex-row items-center gap-1.5'>
                                            {isSelectedForDispatch && (
                                                <View className='flex-row items-center gap-1 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/40'>
                                                    <Feather name="check" size={10} color="#10B981" />
                                                    <Text className='text-[10px] font-bold text-[#10B981]'>Selected</Text>
                                                </View>
                                            )}
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
                                    </View>

                                    {/* Request Details Section (Requested Amount & Reason) */}
                                    <View className='rounded-xl bg-card/70 border border-border/30 p-3 mb-3'>
                                        <View className='flex-row items-center justify-between mb-1.5'>
                                            <Text className='text-[11px] font-semibold text-muted-foreground'>
                                                {isApproved ? 'Remaining Needed' : 'Requested Energy'}
                                            </Text>
                                            <Text className={`text-base font-extrabold ${isApproved ? (remainingKwh > 0 ? 'text-foreground' : 'text-zinc-400') : 'text-foreground'}`}>
                                                {isApproved ? remainingKwh.toFixed(1) : formattedKwh} <Text className='text-[11px] font-bold text-muted-foreground'>kWh</Text>
                                            </Text>
                                        </View>
                                        {isPartiallyDispatched && (
                                            <Text className='text-[10px] text-muted-foreground mb-1'>
                                                {totalDispKwh.toFixed(1)} / {formattedKwh} kWh fulfilled
                                            </Text>
                                        )}

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
                                        <View className='flex-row items-center justify-end gap-2 pt-1'>
                                            <Pressable
                                                onPress={() => openRejectModal(item)}
                                                className='px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 active:opacity-75'
                                            >
                                                <Text className='text-xs font-bold text-[#EF4444]'>
                                                    Reject
                                                </Text>
                                            </Pressable>

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
                                            <Pressable
                                                onPress={() => openReviewModal(item.id)}
                                                className='px-3.5 py-1.5 rounded-lg bg-card border border-border/80 active:bg-secondary shadow-sm'
                                            >
                                                <Text className='text-xs font-bold text-foreground'>
                                                    Details
                                                </Text>
                                            </Pressable>

                                            {!isFullyFulfilled ? (
                                                <Pressable
                                                    onPress={() => handleSelectRequestForDispatch(item)}
                                                    className={`flex-row items-center gap-1.5 px-3.5 py-1.5 rounded-lg border shadow-sm active:opacity-80 ${
                                                        isSelectedForDispatch
                                                            ? 'bg-emerald-500 border-emerald-600'
                                                            : 'bg-primary border-primary/40'
                                                    }`}
                                                >
                                                    <Feather
                                                        name={isSelectedForDispatch ? "check" : "send"}
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
                                                <View className='px-3 py-1.5 rounded-lg bg-secondary/80 border border-border/80'>
                                                    <Text className='text-xs font-bold text-muted-foreground'>
                                                        Fully Fulfilled
                                                    </Text>
                                                </View>
                                            )}
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
                    </>
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

                                {/* Modal Action Buttons */}
                                {detailRequest.status === 'pending' ? (
                                    <View className='flex-row gap-2.5'>
                                        <Pressable
                                            onPress={() => {
                                                const itemToReject: ManagerEnergyRequest = {
                                                    id: detailRequest.id,
                                                    householdId: detailRequest.householdId,
                                                    householdName: detailRequest.householdName,
                                                    householdEmail: detailRequest.householdEmail,
                                                    requestedEnergyKwh: detailRequest.requestedEnergyKwh,
                                                    reason: detailRequest.reason,
                                                    status: detailRequest.status,
                                                    requestedAt: detailRequest.requestedAt,
                                                    reviewedAt: detailRequest.reviewedAt,
                                                    reviewedBy: detailRequest.reviewedBy,
                                                };
                                                closeReviewModal();
                                                openRejectModal(itemToReject);
                                            }}
                                            className='flex-1 py-2.5 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/30 active:opacity-75'
                                        >
                                            <Text className='text-xs font-bold text-[#EF4444]'>
                                                Reject Request
                                            </Text>
                                        </Pressable>

                                        <Pressable
                                            onPress={() => {
                                                const itemToApprove: ManagerEnergyRequest = {
                                                    id: detailRequest.id,
                                                    householdId: detailRequest.householdId,
                                                    householdName: detailRequest.householdName,
                                                    householdEmail: detailRequest.householdEmail,
                                                    requestedEnergyKwh: detailRequest.requestedEnergyKwh,
                                                    reason: detailRequest.reason,
                                                    status: detailRequest.status,
                                                    requestedAt: detailRequest.requestedAt,
                                                    reviewedAt: detailRequest.reviewedAt,
                                                    reviewedBy: detailRequest.reviewedBy,
                                                };
                                                closeReviewModal();
                                                openApproveModal(itemToApprove);
                                            }}
                                            className='flex-1 py-2.5 items-center justify-center rounded-xl bg-primary border border-primary/40 active:opacity-80 shadow-sm'
                                        >
                                            <Text className='text-xs font-bold text-primary-foreground'>
                                                Approve
                                            </Text>
                                        </Pressable>
                                    </View>
                                ) : detailRequest.status === 'approved' ? (
                                    <View className='flex-row gap-2.5'>
                                        <Pressable
                                            onPress={closeReviewModal}
                                            className='flex-1 py-2.5 items-center justify-center rounded-xl bg-secondary border border-border/60 active:opacity-75'
                                        >
                                            <Text className='text-xs font-bold text-foreground'>
                                                Close
                                            </Text>
                                        </Pressable>

                                        <Pressable
                                            onPress={() => {
                                                const reqItem = requests.find((r) => r.id === detailRequest.id);
                                                if (reqItem) {
                                                    handleSelectRequestForDispatch(reqItem);
                                                }
                                                closeReviewModal();
                                            }}
                                            className={`flex-1 py-2.5 flex-row items-center justify-center gap-1.5 rounded-xl border shadow-sm active:opacity-80 ${
                                                selectedDispatchRequestId === detailRequest.id
                                                    ? 'bg-emerald-500 border-emerald-600'
                                                    : 'bg-primary border-primary/40'
                                            }`}
                                        >
                                            <Feather
                                                name={selectedDispatchRequestId === detailRequest.id ? "check" : "send"}
                                                size={13}
                                                color={selectedDispatchRequestId === detailRequest.id ? "#FFFFFF" : "#000000"}
                                            />
                                            <Text
                                                className={`text-xs font-bold ${
                                                    selectedDispatchRequestId === detailRequest.id
                                                        ? 'text-white'
                                                        : 'text-primary-foreground'
                                                }`}
                                            >
                                                {selectedDispatchRequestId === detailRequest.id
                                                    ? 'Deselect'
                                                    : 'Select for Dispatch'}
                                            </Text>
                                        </Pressable>
                                    </View>
                                ) : (
                                    <Pressable
                                        onPress={closeReviewModal}
                                        className='w-full py-2.5 items-center justify-center rounded-xl bg-secondary border border-border/60 active:opacity-75'
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
                                Approve Allocation
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
                            You are approving the energy allocation request for{' '}
                            <Text className='font-bold text-foreground'>
                                {selectedApproveItem?.householdName || 'Household'}
                            </Text>
                            :
                        </Text>

                        {/* Impact Overview Box */}
                        <View className='rounded-xl bg-secondary/60 border border-border/40 p-3.5 mb-4'>
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
                                Reject Request
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
                            Are you sure you want to reject the energy allocation request for{' '}
                            <Text className='font-bold text-foreground'>
                                {selectedRejectItem?.householdName || 'Household'}
                            </Text>
                            ?
                        </Text>

                        {/* Request Summary Box */}
                        <View className='rounded-xl bg-secondary/60 border border-border/40 p-3.5 mb-4'>
                            <View className='flex-row items-center justify-between mb-2'>
                                <Text className='text-xs text-muted-foreground'>
                                    Requested Amount
                                </Text>
                                <Text className='text-xs font-bold text-foreground'>
                                    {selectedRejectItem ? parseFloat(selectedRejectItem.requestedEnergyKwh).toFixed(1) : 0} kWh
                                </Text>
                            </View>
                            {selectedRejectItem?.reason && (
                                <View className='border-t border-border/30 pt-2'>
                                    <Text className='text-[11px] text-muted-foreground' numberOfLines={2}>
                                        Reason: "{selectedRejectItem.reason}"
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Inline Error if rejection failed */}
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
                                className='flex-1 py-2.5 items-center justify-center rounded-xl bg-red-600 border border-red-600/40 active:opacity-80 shadow-sm flex-row items-center justify-center gap-2'
                            >
                                {isRejecting ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                    <Text className='text-xs font-bold text-white'>
                                        Confirm Rejection
                                    </Text>
                                )}
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* 4. Energy Dispatch Allocation Modal (US-12) */}
            <Modal
                visible={allocationModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setAllocationModalVisible(false)}
            >
                <View className='flex-1 bg-black/60 items-center justify-center p-4'>
                    <View className='w-full max-w-sm rounded-2xl border border-border/60 bg-card p-5 shadow-lg'>
                        {/* Header */}
                        <View className='flex-row items-center justify-between mb-4'>
                            <View className='flex-row items-center gap-2'>
                                <View className='h-8 w-8 items-center justify-center rounded-lg bg-primary/20 border border-primary/40'>
                                    <Feather name="zap" size={16} color="#F59E0B" />
                                </View>
                                <View>
                                    <Text className='text-base font-bold text-foreground'>
                                        Enter Allocation Amount
                                    </Text>
                                    <Text className='text-[11px] text-muted-foreground'>
                                        Community Energy Sharing Dispatch
                                    </Text>
                                </View>
                            </View>
                            <Pressable
                                onPress={() => setAllocationModalVisible(false)}
                                className='h-8 w-8 items-center justify-center rounded-full bg-secondary active:opacity-70'
                            >
                                <Feather name="x" size={18} color="#9CA3AF" />
                            </Pressable>
                        </View>

                        {/* Pairing Context Summary */}
                        <View className='rounded-xl bg-secondary/60 border border-border/40 p-3 mb-4'>
                            <View className='flex-row items-center justify-between mb-2 pb-2 border-b border-border/30'>
                                <View className='flex-1 mr-2'>
                                    <Text className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider'>
                                        Recipient Household
                                    </Text>
                                    <Text className='text-xs font-bold text-foreground mt-0.5' numberOfLines={1}>
                                        {selectedDispatchItem?.householdName || 'Household Member'}
                                    </Text>
                                </View>
                                <View className='items-end'>
                                    <Text className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider'>
                                        Remaining Needed
                                    </Text>
                                    <Text className='text-xs font-extrabold text-foreground mt-0.5'>
                                        {requestedKwh.toFixed(1)} <Text className='text-[10px] font-semibold text-muted-foreground'>kWh</Text>
                                    </Text>
                                    {(selectedDispatchItem?.totalDispatchedKwh ?? 0) > 0 && (
                                        <Text className='text-[9px] text-muted-foreground'>
                                            ({(selectedDispatchItem?.totalDispatchedKwh ?? 0).toFixed(1)} / {totalRequestedKwh.toFixed(1)} kWh fulfilled)
                                        </Text>
                                    )}
                                </View>
                            </View>

                            <View className='flex-row items-center justify-between'>
                                <View className='flex-1 mr-2'>
                                    <Text className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider'>
                                        Solar Producer
                                    </Text>
                                    <Text className='text-xs font-bold text-foreground mt-0.5' numberOfLines={1}>
                                        {selectedDispatchOffer?.ownerName || 'Solar Producer'}
                                    </Text>
                                </View>
                                <View className='items-end'>
                                    <Text className='text-[10px] font-bold text-muted-foreground uppercase tracking-wider'>
                                        Available Remaining
                                    </Text>
                                    <Text className='text-xs font-extrabold text-[#10B981] mt-0.5'>
                                        {availableOfferKwh.toFixed(1)} <Text className='text-[10px] font-semibold text-muted-foreground'>kWh</Text>
                                    </Text>
                                    {(selectedDispatchOffer?.totalDispatchedKwh ?? 0) > 0 && (
                                        <Text className='text-[9px] text-muted-foreground'>
                                            ({(selectedDispatchOffer?.totalDispatchedKwh ?? 0).toFixed(1)} / {totalOfferKwh.toFixed(1)} kWh allocated)
                                        </Text>
                                    )}
                                </View>
                            </View>
                        </View>

                        {/* 3-Stat Comparison Grid: Needed vs Available vs Max Allowable */}
                        <View className='flex-row gap-2 mb-4'>
                            <View className='flex-1 bg-secondary/40 rounded-xl p-2.5 border border-border/30 items-center'>
                                <Text className='text-[10px] font-semibold text-muted-foreground'>
                                    Needed
                                </Text>
                                <Text className='text-sm font-extrabold text-foreground mt-1'>
                                    {requestedKwh.toFixed(1)}
                                </Text>
                                <Text className='text-[10px] font-bold text-muted-foreground'>kWh</Text>
                            </View>

                            <View className='flex-1 bg-secondary/40 rounded-xl p-2.5 border border-border/30 items-center'>
                                <Text className='text-[10px] font-semibold text-muted-foreground'>
                                    Available
                                </Text>
                                <Text className='text-sm font-extrabold text-[#10B981] mt-1'>
                                    {availableOfferKwh.toFixed(1)}
                                </Text>
                                <Text className='text-[10px] font-bold text-muted-foreground'>kWh</Text>
                            </View>

                            <View className='flex-1 bg-secondary/40 rounded-xl p-2.5 border border-border/30 items-center'>
                                <Text className='text-[10px] font-semibold text-muted-foreground'>
                                    Max Allocatable
                                </Text>
                                <Text className='text-sm font-extrabold text-[#F59E0B] mt-1'>
                                    {maxAllocatableKwh.toFixed(1)}
                                </Text>
                                <Text className='text-[10px] font-bold text-muted-foreground'>kWh</Text>
                            </View>
                        </View>

                        {/* Input Section */}
                        <View className='mb-3'>
                            <View className='flex-row items-center justify-between mb-1.5'>
                                <Text className='text-xs font-bold text-foreground'>
                                    Allocation Amount
                                </Text>
                                <Text className='text-[11px] font-semibold text-muted-foreground'>
                                    Unit: <Text className='font-bold text-foreground'>kWh</Text>
                                </Text>
                            </View>

                            <View className={`flex-row items-center bg-secondary/80 rounded-xl border px-3.5 py-2.5 shadow-sm ${
                                allocationTouched && !allocationValidation.isValid
                                    ? 'border-red-500/80 bg-red-500/5'
                                    : allocationTouched && allocationValidation.isValid
                                        ? 'border-emerald-500/80 bg-emerald-500/5'
                                        : 'border-border/60'
                            }`}>
                                <TextInput
                                    value={allocationAmount}
                                    onChangeText={handleAllocationChange}
                                    placeholder={`Enter amount (max ${maxAllocatableKwh.toFixed(1)})`}
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="decimal-pad"
                                    className='flex-1 text-base font-extrabold text-foreground py-0.5'
                                />
                                <View className='px-2 py-1 rounded-lg bg-card border border-border/60 ml-2'>
                                    <Text className='text-xs font-bold text-foreground'>
                                        kWh
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Quick Fill Buttons */}
                        <View className='flex-row gap-2 mb-3'>
                            <Pressable
                                onPress={() => handleAllocationChange(maxAllocatableKwh.toFixed(1))}
                                className='flex-1 py-1.5 rounded-lg bg-secondary/80 border border-border/60 items-center justify-center active:opacity-75'
                            >
                                <Text className='text-[11px] font-semibold text-foreground'>
                                    Max ({maxAllocatableKwh.toFixed(1)} kWh)
                                </Text>
                            </Pressable>
                            {maxAllocatableKwh > 1 && (
                                <Pressable
                                    onPress={() => handleAllocationChange((maxAllocatableKwh / 2).toFixed(1))}
                                    className='flex-1 py-1.5 rounded-lg bg-secondary/80 border border-border/60 items-center justify-center active:opacity-75'
                                >
                                    <Text className='text-[11px] font-semibold text-foreground'>
                                        50% ({(maxAllocatableKwh / 2).toFixed(1)} kWh)
                                    </Text>
                                </Pressable>
                            )}
                        </View>

                        {/* Live Entered Amount Display */}
                        <View className='flex-row items-center justify-between bg-card/80 rounded-xl border border-border/40 p-3 mb-3'>
                            <Text className='text-xs font-semibold text-muted-foreground'>
                                Entered Allocation Amount
                            </Text>
                            <Text className='text-sm font-extrabold text-foreground'>
                                {enteredAmountNumeric > 0 ? enteredAmountNumeric.toFixed(1) : '0.0'}{' '}
                                <Text className='text-xs font-bold text-muted-foreground'>kWh</Text>
                            </Text>
                        </View>

                        {/* Validation Feedback Message (Client-Side) */}
                        {allocationTouched && !allocationValidation.isValid && (
                            <View className='flex-row items-center gap-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 mb-3'>
                                <Feather name="alert-circle" size={14} color="#EF4444" />
                                <Text className='flex-1 text-xs font-semibold text-red-500'>
                                    {allocationValidation.error}
                                </Text>
                            </View>
                        )}

                        {/* Server-Side Validation Error Message */}
                        {serverValidationError && (
                            <View className='p-3 rounded-xl bg-red-500/10 border border-red-500/40 mb-3'>
                                <View className='flex-row items-center gap-1.5 mb-1'>
                                    <Feather name="alert-triangle" size={14} color="#EF4444" />
                                    <Text className='text-xs font-bold text-[#EF4444]'>
                                        Server Validation Failed
                                    </Text>
                                </View>
                                <Text className='text-xs text-red-400 font-medium leading-4'>
                                    {serverValidationError}
                                </Text>
                                <Text className='text-[10px] text-muted-foreground mt-1.5'>
                                    Energy requests and solar offers have been refreshed from the server to prevent stale dispatch.
                                </Text>
                            </View>
                        )}

                        {allocationTouched && allocationValidation.isValid && !serverValidationError && (
                            <View className='flex-row items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 mb-4'>
                                <Feather name="check-circle" size={14} color="#10B981" />
                                <Text className='flex-1 text-xs font-semibold text-[#10B981]'>
                                    Ready for server energy validation ({enteredAmountNumeric.toFixed(1)} kWh)
                                </Text>
                            </View>
                        )}

                        {/* Modal Action Buttons */}
                        <View className='flex-row gap-2.5 mt-1'>
                            <Pressable
                                disabled={isDispatching}
                                onPress={() => {
                                    setServerValidationError(null);
                                    setAllocationModalVisible(false);
                                }}
                                className='flex-1 py-3 items-center justify-center rounded-xl bg-secondary border border-border/60 active:opacity-75'
                            >
                                <Text className='text-xs font-bold text-foreground'>
                                    Cancel
                                </Text>
                            </Pressable>

                            <Pressable
                                disabled={!allocationValidation.isValid || isDispatching}
                                onPress={() => handleExecuteDispatch(enteredAmountNumeric)}
                                className={`flex-1 py-3 flex-row items-center justify-center gap-1.5 rounded-xl border shadow-sm ${
                                    allocationValidation.isValid && !isDispatching
                                        ? 'bg-primary border-primary/40 active:opacity-80'
                                        : 'bg-primary/40 border-primary/20 opacity-50'
                                }`}
                            >
                                {isDispatching ? (
                                    <>
                                        <ActivityIndicator size="small" color="#000000" />
                                        <Text className='text-xs font-bold text-primary-foreground ml-1.5'>
                                            Executing Dispatch...
                                        </Text>
                                    </>
                                ) : (
                                    <>
                                        <Feather
                                            name="send"
                                            size={14}
                                            color={allocationValidation.isValid ? "#000000" : "#6B7280"}
                                        />
                                        <Text
                                            className={`text-xs font-bold ${
                                                allocationValidation.isValid
                                                    ? 'text-primary-foreground'
                                                    : 'text-muted-foreground'
                                            }`}
                                        >
                                            Confirm & Dispatch
                                        </Text>
                                    </>
                                )}
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default ManagerEnergyRequests;
