import TabScreenBackground from '@/components/shared/TabScreenBackground';
import { fetchMemberDetails, useMembers } from '@/hooks/manager/useMembers';
import { calculateMemberAnalytics } from '@/lib/memberService';
import { CommunityMember, MemberDetailedProfile, MemberStatus } from '@/types/member';
import { UserRole } from '@/types/role';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native';

const ROLE_LABELS: Record<
    UserRole,
    { label: string; desc: string; badgeBg: string; textColor: string }
> = {
    household: {
        label: 'Household',
        desc: 'Consumes community solar allocation',
        badgeBg: 'bg-sky-500/15 border-sky-500/30',
        textColor: 'text-sky-500',
    },
    solar_owner: {
        label: 'Solar Owner',
        desc: 'Contributes solar power & rooftop capacity',
        badgeBg: 'bg-amber-500/15 border-amber-500/30',
        textColor: 'text-[#F59E0B]',
    },
    technician: {
        label: 'Technician',
        desc: 'Maintains inverters, meters & grid hardware',
        badgeBg: 'bg-emerald-500/15 border-emerald-500/30',
        textColor: 'text-[#10B981]',
    },
    manager: {
        label: 'Grid Manager',
        desc: 'Full administration & energy quota control',
        badgeBg: 'bg-purple-500/15 border-purple-500/30',
        textColor: 'text-purple-500',
    },
};

const ManagerMembers = () => {
    const router = useRouter();
    const { members, setMembers, loading, error, refetch } = useMembers();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState<'all' | UserRole | 'pending'>('all');

    // Auto-refresh when screen gains focus
    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch])
    );

    // Member Details Modal State
    const [selectedMemberForDetails, setSelectedMemberForDetails] = useState<CommunityMember | null>(null);
    const [detailedProfile, setDetailedProfile] = useState<MemberDetailedProfile | null>(null);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [detailsError, setDetailsError] = useState<string | null>(null);
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);

    const handleOpenMemberDetails = async (member: CommunityMember) => {
        setSelectedMemberForDetails(member);
        setDetailedProfile(null);
        setDetailsLoading(true);
        setDetailsError(null);
        setDetailsModalVisible(true);

        try {
            const details = await fetchMemberDetails(member.id);
            setDetailedProfile(details);
        } catch (err: any) {
            console.error('[Member Details Error]', err);
            setDetailsError(err?.message || 'Failed to load member details');
        } finally {
            setDetailsLoading(false);
        }
    };

    // Role Edit Modal State
    const [selectedMember, setSelectedMember] = useState<CommunityMember | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [newRole, setNewRole] = useState<UserRole>('household');
    const [newStatus, setNewStatus] = useState<MemberStatus>('active');

    const analytics = calculateMemberAnalytics(members);

    const openRoleModal = (member: CommunityMember) => {
        setSelectedMember(member);
        setNewRole(member.role);
        setNewStatus(member.status);
        setModalVisible(true);
    };

    const handleSaveRole = () => {
        if (!selectedMember) return;

        setMembers((prev) =>
            prev.map((m) =>
                m.id === selectedMember.id ? { ...m, role: newRole, status: newStatus } : m
            )
        );

        setModalVisible(false);
        Alert.alert(
            'Role Updated',
            `${selectedMember.name} is now assigned as "${ROLE_LABELS[newRole].label}".`
        );
    };

    const filteredMembers = members.filter((m) => {
        const matchesSearch =
            (m.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (m.email || '').toLowerCase().includes(searchQuery.toLowerCase());

        if (selectedFilter === 'all') return matchesSearch;
        if (selectedFilter === 'pending') return matchesSearch && m.status === 'pending';
        return matchesSearch && m.role === selectedFilter;
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
                        refreshing={loading && members.length > 0}
                        onRefresh={refetch}
                        tintColor="#F59E0B"
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
                                Community Members
                            </Text>
                            <Text className='text-xs text-muted-foreground mt-0.5'>
                                Manage roles, permissions & status
                            </Text>
                        </View>
                    </View>

                    <View className='h-10 w-10 items-center justify-center rounded-2xl bg-secondary border border-border/60 shadow-sm'>
                        <Feather name="bell" size={20} color="#F59E0B" />
                    </View>
                </View>

                {/* Top KPI Analytics Overview */}
                <View className='flex-row gap-3 mb-5 w-full'>
                    {/* Total Members */}
                    <View className='flex-1 flex-col justify-between rounded-xl border border-border/40 bg-secondary/60 p-4 shadow-sm'>
                        <View className='flex-row items-center justify-between'>
                            <Text className='text-3xl font-extrabold text-foreground'>
                                {analytics.totalMembers}
                            </Text>
                            <View className='h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/15 border border-yellow-500/30'>
                                <Feather name="users" size={16} color="#F59E0B" />
                            </View>
                        </View>
                        <Text className='text-xs font-semibold text-muted-foreground mt-2'>
                            Total Members
                        </Text>
                    </View>

                    {/* Active Members */}
                    <View className='flex-1 flex-col justify-between rounded-xl border border-border/40 bg-secondary/60 p-4 shadow-sm'>
                        <View className='flex-row items-center justify-between'>
                            <Text className='text-3xl font-extrabold text-foreground'>
                                {analytics.activeMembers}
                            </Text>
                            <View className='h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/30'>
                                <Feather name="zap" size={16} color="#10B981" />
                            </View>
                        </View>
                        <Text className='text-xs font-semibold text-muted-foreground mt-2'>
                            Active Co-op
                        </Text>
                    </View>

                    {/* Pending Members */}
                    <View className='flex-1 flex-col justify-between rounded-xl border border-border/40 bg-secondary/60 p-4 shadow-sm'>
                        <View className='flex-row items-center justify-between'>
                            <Text className='text-3xl font-extrabold text-foreground'>
                                {analytics.pendingMembers}
                            </Text>
                            <View className='h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/15 border border-yellow-500/30'>
                                <Feather name="clock" size={16} color="#F59E0B" />
                            </View>
                        </View>
                        <Text className='text-xs font-semibold text-muted-foreground mt-2'>
                            Pending Roles
                        </Text>
                    </View>
                </View>

                {/* Search Bar */}
                <View className='flex-row items-center bg-secondary/60 border border-border/60 rounded-full px-4 py-2.5 mb-4 shadow-sm'>
                    <Feather name="search" size={18} color="#9CA3AF" />
                    <TextInput
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholder="Search by name or email..."
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
                        {[
                            { id: 'all', label: 'All', count: members.length },
                            { id: 'pending', label: 'Pending', count: analytics.pendingMembers },
                            { id: 'manager', label: 'Managers', count: analytics.managerCount },
                            { id: 'solar_owner', label: 'Solar Owners', count: analytics.solarOwnerCount },
                            { id: 'household', label: 'Households', count: analytics.householdCount },
                            { id: 'technician', label: 'Technicians', count: analytics.technicianCount },
                        ].map((tab) => {
                            const isSelected = selectedFilter === tab.id;
                            return (
                                <Pressable
                                    key={tab.id}
                                    onPress={() => setSelectedFilter(tab.id as 'all' | UserRole | 'pending')}
                                    className={`px-4 py-2 rounded-full border items-center justify-center ${isSelected
                                        ? 'bg-primary border-primary shadow-sm'
                                        : 'bg-secondary/60 border-border/60 active:bg-secondary'
                                        }`}
                                >
                                    <Text
                                        className={`text-xs font-bold ${isSelected
                                            ? 'text-primary-foreground'
                                            : 'text-muted-foreground'
                                            }`}
                                    >
                                        {tab.label} ({tab.count})
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Member Cards List */}
                <View className='flex-col gap-4'>
                    {loading && members.length === 0 ? (
                        <View className='items-center justify-center py-16 px-4'>
                            <ActivityIndicator size="large" color="#F59E0B" />
                            <Text className='text-sm font-semibold text-muted-foreground mt-3'>
                                Loading community members...
                            </Text>
                        </View>
                    ) : error && members.length === 0 ? (
                        <View className='items-center justify-center py-12 px-4'>
                            <Feather name="alert-circle" size={32} color="#EF4444" />
                            <Text className='text-base font-bold text-foreground mt-2'>
                                Failed to load members
                            </Text>
                            <Text className='text-xs text-muted-foreground text-center mt-1 mb-4'>
                                {error}
                            </Text>
                            <Pressable
                                onPress={() => refetch()}
                                className='px-4 py-2 rounded-xl bg-secondary border border-border/60 active:opacity-75'
                            >
                                <Text className='text-xs font-semibold text-[#F59E0B]'>
                                    Tap to Retry
                                </Text>
                            </Pressable>
                        </View>
                    ) : filteredMembers.length === 0 ? (
                        <View className='items-center justify-center py-12 px-4'>
                            <Text className='text-base font-bold text-foreground'>
                                No members found
                            </Text>
                            <Text className='text-xs text-muted-foreground text-center mt-1'>
                                {searchQuery
                                    ? `No members match "${searchQuery}"`
                                    : 'There are no members matching the selected filter.'}
                            </Text>
                        </View>
                    ) : (
                        filteredMembers.map((member) => {
                            const roleInfo = ROLE_LABELS[member.role] || ROLE_LABELS.household;
                            const isPending = member.status === 'pending';
                            const isActive = member.status === 'active';

                            return (
                                <View
                                    key={member.id}
                                    className='rounded-xl border border-border/40 bg-secondary/60 p-4 shadow-sm'
                                >
                                    {/* Member Header (Clickable for Details) */}
                                    <Pressable
                                        onPress={() => handleOpenMemberDetails(member)}
                                        className='flex-row items-center justify-between mb-3 active:opacity-75'
                                    >
                                        <View className='flex-row items-center gap-3 flex-1 mr-2'>
                                            {/* Avatar Initials */}
                                            <View className='h-10 w-10 items-center justify-center rounded-xl bg-card border border-border/60'>
                                                <Text className='text-sm font-extrabold text-foreground'>
                                                    {(member.name || 'User')
                                                        .split(' ')
                                                        .map((n) => n[0])
                                                        .filter(Boolean)
                                                        .join('')
                                                        .substring(0, 2)
                                                        .toUpperCase() || 'U'}
                                                </Text>
                                            </View>

                                            <View className='flex-1'>
                                                <Text
                                                    className='text-base font-bold text-foreground'
                                                    numberOfLines={1}
                                                >
                                                    {member.name}
                                                </Text>
                                                <Text
                                                    className='text-xs text-muted-foreground'
                                                    numberOfLines={1}
                                                >
                                                    {member.email}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Status Badge */}
                                        <View
                                            className={`px-2.5 py-0.5 rounded-full border ${isActive
                                                ? 'bg-emerald-500/15 border-emerald-500/40'
                                                : isPending
                                                    ? 'bg-yellow-500/15 border-yellow-500/40'
                                                    : 'bg-zinc-500/15 border-zinc-500/40'
                                                }`}
                                        >
                                            <Text
                                                className={`text-[10px] font-bold uppercase ${isActive
                                                    ? 'text-[#10B981]'
                                                    : isPending
                                                        ? 'text-[#F59E0B]'
                                                        : 'text-[#6B7280]'
                                                    }`}
                                            >
                                                {member.status}
                                            </Text>
                                        </View>
                                    </Pressable>

                                    {/* Co-op Details Block */}
                                    <View className='flex-row items-center justify-between rounded-xl bg-card/70 border border-border/30 p-3 mb-3'>
                                        {member.role === 'solar_owner' && (
                                            <>
                                                <View className='flex-1'>
                                                    <Text className='text-[11px] font-semibold text-muted-foreground'>
                                                        Rooftop Capacity
                                                    </Text>
                                                    <Text className='text-sm font-extrabold text-foreground mt-0.5'>
                                                        {member.solarCapacityKw ?? 0} kW System
                                                    </Text>
                                                </View>
                                                <View className='h-7 w-[1px] bg-border/60 mx-2' />
                                                <View className='flex-1 pl-2'>
                                                    <Text className='text-[11px] font-semibold text-muted-foreground'>
                                                        Member Since
                                                    </Text>
                                                    <Text className='text-sm font-extrabold text-foreground mt-0.5'>
                                                        {member.joinedAt}
                                                    </Text>
                                                </View>
                                            </>
                                        )}

                                        {member.role === 'household' && (
                                            <>
                                                <View className='flex-1'>
                                                    <Text className='text-[11px] font-semibold text-muted-foreground'>
                                                        Monthly Allocation
                                                    </Text>
                                                    <Text className='text-sm font-extrabold text-foreground mt-0.5'>
                                                        {member.monthlyAllocationKwh ?? 30} kWh / mo
                                                    </Text>
                                                </View>
                                                <View className='h-7 w-[1px] bg-border/60 mx-2' />
                                                <View className='flex-1 pl-2'>
                                                    <Text className='text-[11px] font-semibold text-muted-foreground'>
                                                        Inverter Link
                                                    </Text>
                                                    <Text className='text-sm font-extrabold text-[#10B981] mt-0.5'>
                                                        Active Feed
                                                    </Text>
                                                </View>
                                            </>
                                        )}

                                        {member.role === 'technician' && (
                                            <>
                                                <View className='flex-1'>
                                                    <Text className='text-[11px] font-semibold text-muted-foreground'>
                                                        Assigned Grid Zone
                                                    </Text>
                                                    <Text
                                                        className='text-sm font-extrabold text-foreground mt-0.5'
                                                        numberOfLines={1}
                                                    >
                                                        {member.assignedGrid ?? 'Main Substation'}
                                                    </Text>
                                                </View>
                                                <View className='h-7 w-[1px] bg-border/60 mx-2' />
                                                <View className='flex-1 pl-2'>
                                                    <Text className='text-[11px] font-semibold text-muted-foreground'>
                                                        Field Role
                                                    </Text>
                                                    <Text className='text-sm font-extrabold text-foreground mt-0.5'>
                                                        Hardware & IoT
                                                    </Text>
                                                </View>
                                            </>
                                        )}

                                        {member.role === 'manager' && (
                                            <>
                                                <View className='flex-1'>
                                                    <Text className='text-[11px] font-semibold text-muted-foreground'>
                                                        Access Level
                                                    </Text>
                                                    <Text className='text-sm font-extrabold text-foreground mt-0.5'>
                                                        Full Grid Admin
                                                    </Text>
                                                </View>
                                                <View className='h-7 w-[1px] bg-border/60 mx-2' />
                                                <View className='flex-1 pl-2'>
                                                    <Text className='text-[11px] font-semibold text-muted-foreground'>
                                                        Permissions
                                                    </Text>
                                                    <Text className='text-sm font-extrabold text-foreground mt-0.5'>
                                                        All Zones
                                                    </Text>
                                                </View>
                                            </>
                                        )}
                                    </View>

                                    {/* Card Footer & Role Action */}
                                    <View className='flex-row items-center justify-between pt-1'>
                                        {/* Role Pill */}
                                        <View
                                            className={`px-3 py-1 rounded-lg border ${roleInfo.badgeBg}`}
                                        >
                                            <Text className={`text-xs font-bold ${roleInfo.textColor}`}>
                                                {roleInfo.label}
                                            </Text>
                                        </View>

                                        <View className='flex-row items-center gap-2'>
                                            {/* View Details Button */}
                                            <Pressable
                                                onPress={() => handleOpenMemberDetails(member)}
                                                className='px-3 py-1.5 rounded-lg bg-card border border-border/80 active:bg-secondary shadow-sm'
                                            >
                                                <Text className='text-xs font-bold text-foreground'>
                                                    Details
                                                </Text>
                                            </Pressable>

                                            {/* Change Role Button */}
                                            <Pressable
                                                onPress={() => openRoleModal(member)}
                                                className='px-3.5 py-1.5 rounded-lg bg-primary border border-primary/40 active:opacity-80 shadow-sm'
                                            >
                                                <Text className='text-xs font-bold text-primary-foreground'>
                                                    Change Role
                                                </Text>
                                            </Pressable>
                                        </View>
                                    </View>
                                </View>
                            );
                        })
                    )}
                </View>
            </ScrollView>

            {/* Member Details Modal */}
            <Modal
                visible={detailsModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setDetailsModalVisible(false)}
            >
                <View className='flex-1 bg-black/70 items-center justify-center p-4'>
                    <View className='w-full max-w-md max-h-[85%] rounded-3xl border border-border/60 bg-card p-5 shadow-2xl flex-col'>
                        {/* Header */}
                        <View className='flex-row items-center justify-between pb-3 border-b border-border/40 mb-3'>
                            <View className='flex-row items-center gap-3 flex-1 mr-2'>
                                <View className='h-12 w-12 items-center justify-center rounded-2xl bg-secondary border border-border/60'>
                                    <Text className='text-base font-extrabold text-foreground'>
                                        {(selectedMemberForDetails?.name || 'User')
                                            .split(' ')
                                            .map((n) => n[0])
                                            .filter(Boolean)
                                            .join('')
                                            .substring(0, 2)
                                            .toUpperCase() || 'U'}
                                    </Text>
                                </View>
                                <View className='flex-1'>
                                    <Text className='text-lg font-bold text-foreground' numberOfLines={1}>
                                        {selectedMemberForDetails?.name}
                                    </Text>
                                    <Text className='text-xs text-muted-foreground' numberOfLines={1}>
                                        {selectedMemberForDetails?.email}
                                    </Text>
                                </View>
                            </View>
                            <Pressable
                                onPress={() => setDetailsModalVisible(false)}
                                className='h-8 w-8 items-center justify-center rounded-full bg-secondary active:opacity-70'
                            >
                                <Feather name="x" size={18} color="#9CA3AF" />
                            </Pressable>
                        </View>

                        {/* Content */}
                        {detailsLoading ? (
                            <View className='items-center justify-center py-12'>
                                <ActivityIndicator size="large" color="#F59E0B" />
                                <Text className='text-xs font-semibold text-muted-foreground mt-3'>
                                    Loading member details & energy context...
                                </Text>
                            </View>
                        ) : detailsError ? (
                            <View className='items-center justify-center py-8'>
                                <Feather name="alert-circle" size={28} color="#EF4444" />
                                <Text className='text-sm font-bold text-foreground mt-2'>
                                    Failed to load details
                                </Text>
                                <Text className='text-xs text-muted-foreground text-center mt-1 mb-3'>
                                    {detailsError}
                                </Text>
                                <Pressable
                                    onPress={() => selectedMemberForDetails && handleOpenMemberDetails(selectedMemberForDetails)}
                                    className='px-3.5 py-1.5 rounded-lg bg-secondary border border-border/60'
                                >
                                    <Text className='text-xs font-semibold text-[#F59E0B]'>Retry</Text>
                                </Pressable>
                            </View>
                        ) : detailedProfile ? (
                            <ScrollView showsVerticalScrollIndicator={false} className='flex-1'>
                                {/* Badges Row */}
                                <View className='flex-row items-center gap-2 mb-4'>
                                    <View className={`px-2.5 py-1 rounded-lg border ${ROLE_LABELS[detailedProfile.role]?.badgeBg || 'bg-secondary'}`}>
                                        <Text className={`text-xs font-bold ${ROLE_LABELS[detailedProfile.role]?.textColor || 'text-foreground'}`}>
                                            {ROLE_LABELS[detailedProfile.role]?.label || detailedProfile.role}
                                        </Text>
                                    </View>
                                    <View className={`px-2.5 py-1 rounded-lg border ${
                                        detailedProfile.status === 'active'
                                            ? 'bg-emerald-500/15 border-emerald-500/40'
                                            : detailedProfile.status === 'pending'
                                            ? 'bg-yellow-500/15 border-yellow-500/40'
                                            : 'bg-zinc-500/15 border-zinc-500/40'
                                    }`}>
                                        <Text className={`text-xs font-bold uppercase ${
                                            detailedProfile.status === 'active'
                                                ? 'text-[#10B981]'
                                                : detailedProfile.status === 'pending'
                                                ? 'text-[#F59E0B]'
                                                : 'text-muted-foreground'
                                        }`}>
                                            {detailedProfile.status}
                                        </Text>
                                    </View>
                                </View>

                                {/* Member Information Card */}
                                <View className='rounded-xl bg-secondary/50 border border-border/40 p-3.5 mb-4'>
                                    <Text className='text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5'>
                                        Account & Profile
                                    </Text>
                                    <View className='gap-2'>
                                        <View className='flex-row justify-between items-center'>
                                            <Text className='text-xs text-muted-foreground'>Email</Text>
                                            <Text className='text-xs font-semibold text-foreground'>{detailedProfile.email}</Text>
                                        </View>
                                        <View className='flex-row justify-between items-center'>
                                            <Text className='text-xs text-muted-foreground'>Phone</Text>
                                            <Text className='text-xs font-semibold text-foreground'>{detailedProfile.phone || 'Not provided'}</Text>
                                        </View>
                                        <View className='flex-row justify-between items-center'>
                                            <Text className='text-xs text-muted-foreground'>Assigned Grid</Text>
                                            <Text className='text-xs font-semibold text-foreground'>{detailedProfile.assignedGrid || 'Unassigned'}</Text>
                                        </View>
                                        <View className='flex-row justify-between items-center'>
                                            <Text className='text-xs text-muted-foreground'>Member Since</Text>
                                            <Text className='text-xs font-semibold text-foreground'>{detailedProfile.createdDate || detailedProfile.joinedAt}</Text>
                                        </View>
                                        {detailedProfile.solarCapacityKw !== undefined && (
                                            <View className='flex-row justify-between items-center'>
                                                <Text className='text-xs text-muted-foreground'>Solar Capacity</Text>
                                                <Text className='text-xs font-bold text-[#F59E0B]'>{detailedProfile.solarCapacityKw} kW</Text>
                                            </View>
                                        )}
                                        {detailedProfile.monthlyAllocationKwh !== undefined && (
                                            <View className='flex-row justify-between items-center'>
                                                <Text className='text-xs text-muted-foreground'>Monthly Allocation</Text>
                                                <Text className='text-xs font-bold text-sky-500'>{detailedProfile.monthlyAllocationKwh} kWh / mo</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>

                                {/* Energy Context Section based on role */}
                                {detailedProfile.role === 'solar_owner' && (
                                    <>
                                        <Text className='text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2'>
                                            Solar Assets & Offers
                                        </Text>

                                        {/* Metrics Row */}
                                        <View className='flex-row gap-2 mb-3'>
                                            <View className='flex-1 rounded-xl bg-secondary/50 border border-border/40 p-2.5 items-center'>
                                                <Text className='text-[10px] text-muted-foreground font-semibold'>Total Capacity</Text>
                                                <Text className='text-sm font-extrabold text-foreground mt-0.5'>
                                                    {detailedProfile.energyDetails?.metrics?.totalCapacityKw ?? detailedProfile.solarCapacityKw ?? 0} kW
                                                </Text>
                                            </View>
                                            <View className='flex-1 rounded-xl bg-secondary/50 border border-border/40 p-2.5 items-center'>
                                                <Text className='text-[10px] text-muted-foreground font-semibold'>Energy Offered</Text>
                                                <Text className='text-sm font-extrabold text-[#F59E0B] mt-0.5'>
                                                    {detailedProfile.energyDetails?.metrics?.totalOfferedKwh ?? 0} kWh
                                                </Text>
                                            </View>
                                            <View className='flex-1 rounded-xl bg-secondary/50 border border-border/40 p-2.5 items-center'>
                                                <Text className='text-[10px] text-muted-foreground font-semibold'>Active Offers</Text>
                                                <Text className='text-sm font-extrabold text-foreground mt-0.5'>
                                                    {detailedProfile.energyDetails?.metrics?.activeOffersCount ?? 0}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Assets List */}
                                        <View className='rounded-xl bg-secondary/50 border border-border/40 p-3 mb-3'>
                                            <Text className='text-[11px] font-bold text-foreground mb-2'>
                                                Registered Hardware ({detailedProfile.energyDetails?.solarAssets?.length ?? 0})
                                            </Text>
                                            {detailedProfile.energyDetails?.solarAssets && detailedProfile.energyDetails.solarAssets.length > 0 ? (
                                                detailedProfile.energyDetails.solarAssets.map((asset) => (
                                                    <View key={asset.id} className='flex-row items-center justify-between py-1.5 border-b border-border/20 last:border-b-0'>
                                                        <View>
                                                            <Text className='text-xs font-semibold text-foreground'>{asset.name}</Text>
                                                            <Text className='text-[10px] text-muted-foreground uppercase'>{asset.assetType} {asset.location ? `• ${asset.location}` : ''}</Text>
                                                        </View>
                                                        <Text className='text-xs font-bold text-[#F59E0B]'>{asset.capacityKw} kW</Text>
                                                    </View>
                                                ))
                                            ) : (
                                                <Text className='text-xs text-muted-foreground italic py-1'>No hardware assets registered.</Text>
                                            )}
                                        </View>

                                        {/* Offers List */}
                                        <View className='rounded-xl bg-secondary/50 border border-border/40 p-3 mb-3'>
                                            <Text className='text-[11px] font-bold text-foreground mb-2'>
                                                Recent Solar Offers ({detailedProfile.energyDetails?.solarOffers?.length ?? 0})
                                            </Text>
                                            {detailedProfile.energyDetails?.solarOffers && detailedProfile.energyDetails.solarOffers.length > 0 ? (
                                                detailedProfile.energyDetails.solarOffers.map((offer) => (
                                                    <View key={offer.id} className='flex-row items-center justify-between py-1.5 border-b border-border/20 last:border-b-0'>
                                                        <View>
                                                            <Text className='text-xs font-semibold text-foreground'>{offer.energyAmountKwh} kWh</Text>
                                                            <Text className='text-[10px] text-muted-foreground'>
                                                                {new Date(offer.offeredAt).toLocaleDateString()}
                                                            </Text>
                                                        </View>
                                                        <View className={`px-2 py-0.5 rounded-full border ${
                                                            offer.status === 'approved' ? 'bg-emerald-500/15 border-emerald-500/30' :
                                                            offer.status === 'pending' ? 'bg-yellow-500/15 border-yellow-500/30' :
                                                            'bg-zinc-500/15 border-zinc-500/30'
                                                        }`}>
                                                            <Text className={`text-[10px] font-bold uppercase ${
                                                                offer.status === 'approved' ? 'text-[#10B981]' :
                                                                offer.status === 'pending' ? 'text-[#F59E0B]' :
                                                                'text-muted-foreground'
                                                            }`}>
                                                                {offer.status}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                ))
                                            ) : (
                                                <Text className='text-xs text-muted-foreground italic py-1'>No solar offers submitted yet.</Text>
                                            )}
                                        </View>
                                    </>
                                )}

                                {detailedProfile.role === 'household' && (
                                    <>
                                        <Text className='text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2'>
                                            Energy Consumption & Requests
                                        </Text>

                                        {/* Metrics Row */}
                                        <View className='flex-row gap-2 mb-3'>
                                            <View className='flex-1 rounded-xl bg-secondary/50 border border-border/40 p-2.5 items-center'>
                                                <Text className='text-[10px] text-muted-foreground font-semibold'>Allocation</Text>
                                                <Text className='text-sm font-extrabold text-foreground mt-0.5'>
                                                    {detailedProfile.monthlyAllocationKwh ?? 30} kWh
                                                </Text>
                                            </View>
                                            <View className='flex-1 rounded-xl bg-secondary/50 border border-border/40 p-2.5 items-center'>
                                                <Text className='text-[10px] text-muted-foreground font-semibold'>Total Req</Text>
                                                <Text className='text-sm font-extrabold text-sky-500 mt-0.5'>
                                                    {detailedProfile.energyDetails?.metrics?.totalRequestedKwh ?? 0} kWh
                                                </Text>
                                            </View>
                                            <View className='flex-1 rounded-xl bg-secondary/50 border border-border/40 p-2.5 items-center'>
                                                <Text className='text-[10px] text-muted-foreground font-semibold'>Dispatched</Text>
                                                <Text className='text-sm font-extrabold text-[#10B981] mt-0.5'>
                                                    {detailedProfile.energyDetails?.metrics?.totalDispatchedKwh ?? 0} kWh
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Energy Requests List */}
                                        <View className='rounded-xl bg-secondary/50 border border-border/40 p-3 mb-3'>
                                            <Text className='text-[11px] font-bold text-foreground mb-2'>
                                                Energy Requests ({detailedProfile.energyDetails?.energyRequests?.length ?? 0})
                                            </Text>
                                            {detailedProfile.energyDetails?.energyRequests && detailedProfile.energyDetails.energyRequests.length > 0 ? (
                                                detailedProfile.energyDetails.energyRequests.map((req) => (
                                                    <View key={req.id} className='py-2 border-b border-border/20 last:border-b-0'>
                                                        <View className='flex-row items-center justify-between'>
                                                            <Text className='text-xs font-bold text-foreground'>{req.requestedEnergyKwh} kWh</Text>
                                                            <View className={`px-2 py-0.5 rounded-full border ${
                                                                req.status === 'fulfilled' || req.status === 'approved'
                                                                    ? 'bg-emerald-500/15 border-emerald-500/30'
                                                                    : req.status === 'pending'
                                                                    ? 'bg-yellow-500/15 border-yellow-500/30'
                                                                    : 'bg-zinc-500/15 border-zinc-500/30'
                                                            }`}>
                                                                <Text className={`text-[10px] font-bold uppercase ${
                                                                    req.status === 'fulfilled' || req.status === 'approved'
                                                                        ? 'text-[#10B981]'
                                                                        : req.status === 'pending'
                                                                        ? 'text-[#F59E0B]'
                                                                        : 'text-muted-foreground'
                                                                }`}>
                                                                    {req.status}
                                                                </Text>
                                                            </View>
                                                        </View>
                                                        {req.reason && (
                                                            <Text className='text-[11px] text-muted-foreground mt-0.5' numberOfLines={1}>
                                                                {req.reason}
                                                            </Text>
                                                        )}
                                                        <Text className='text-[9px] text-muted-foreground mt-0.5'>
                                                            Requested: {new Date(req.requestedAt).toLocaleDateString()}
                                                        </Text>
                                                    </View>
                                                ))
                                            ) : (
                                                <Text className='text-xs text-muted-foreground italic py-1'>No energy requests submitted.</Text>
                                            )}
                                        </View>

                                        {/* Dispatches Received */}
                                        {detailedProfile.energyDetails?.dispatches && detailedProfile.energyDetails.dispatches.length > 0 && (
                                            <View className='rounded-xl bg-secondary/50 border border-border/40 p-3 mb-3'>
                                                <Text className='text-[11px] font-bold text-foreground mb-2'>
                                                    Dispatched Energy History ({detailedProfile.energyDetails.dispatches.length})
                                                </Text>
                                                {detailedProfile.energyDetails.dispatches.map((dsp) => (
                                                    <View key={dsp.id} className='flex-row items-center justify-between py-1.5 border-b border-border/20 last:border-b-0'>
                                                        <View>
                                                            <Text className='text-xs font-semibold text-[#10B981]'>+{dsp.dispatchedEnergyKwh} kWh Dispatched</Text>
                                                            <Text className='text-[10px] text-muted-foreground'>
                                                                {new Date(dsp.dispatchedAt).toLocaleDateString()} {dsp.notes ? `• ${dsp.notes}` : ''}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                ))}
                                            </View>
                                        )}
                                    </>
                                )}

                                {detailedProfile.role === 'technician' && (
                                    <>
                                        <Text className='text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2'>
                                            Field & Maintenance Details
                                        </Text>
                                        <View className='rounded-xl bg-secondary/50 border border-border/40 p-3 mb-3'>
                                            <View className='flex-row justify-between items-center mb-2'>
                                                <Text className='text-xs text-muted-foreground'>Assigned Grid Substation</Text>
                                                <Text className='text-xs font-bold text-foreground'>{detailedProfile.assignedGrid ?? 'Main Substation'}</Text>
                                            </View>
                                            <View className='flex-row justify-between items-center'>
                                                <Text className='text-xs text-muted-foreground'>Tickets Assigned</Text>
                                                <Text className='text-xs font-bold text-emerald-500'>
                                                    {detailedProfile.energyDetails?.metrics?.ticketsCount ?? 0}
                                                </Text>
                                            </View>
                                        </View>
                                    </>
                                )}

                                {detailedProfile.role === 'manager' && (
                                    <>
                                        <Text className='text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2'>
                                            Management Overview
                                        </Text>
                                        <View className='rounded-xl bg-secondary/50 border border-border/40 p-3 mb-3'>
                                            <View className='flex-row justify-between items-center mb-2'>
                                                <Text className='text-xs text-muted-foreground'>Access Level</Text>
                                                <Text className='text-xs font-bold text-purple-400'>Full Grid Administrator</Text>
                                            </View>
                                            <View className='flex-row justify-between items-center mb-2'>
                                                <Text className='text-xs text-muted-foreground'>Dispatches Executed</Text>
                                                <Text className='text-xs font-bold text-foreground'>
                                                    {detailedProfile.energyDetails?.metrics?.dispatchesManagedCount ?? 0}
                                                </Text>
                                            </View>
                                            <View className='flex-row justify-between items-center'>
                                                <Text className='text-xs text-muted-foreground'>Total Dispatched</Text>
                                                <Text className='text-xs font-bold text-[#F59E0B]'>
                                                    {detailedProfile.energyDetails?.metrics?.totalKwhDispatched ?? 0} kWh
                                                </Text>
                                            </View>
                                        </View>
                                    </>
                                )}
                            </ScrollView>
                        ) : null}

                        {/* Modal Action Buttons */}
                        <View className='flex-row gap-3 pt-3 border-t border-border/40 mt-2'>
                            <Pressable
                                onPress={() => setDetailsModalVisible(false)}
                                className='flex-1 py-2.5 items-center justify-center rounded-xl bg-secondary border border-border/60 active:opacity-75'
                            >
                                <Text className='text-xs font-bold text-foreground'>
                                    Close
                                </Text>
                            </Pressable>
                            <Pressable
                                onPress={() => {
                                    setDetailsModalVisible(false);
                                    if (selectedMemberForDetails) {
                                        openRoleModal(selectedMemberForDetails);
                                    }
                                }}
                                className='flex-1 py-2.5 items-center justify-center rounded-xl bg-primary border border-primary/40 active:opacity-80 shadow-sm'
                            >
                                <Text className='text-xs font-bold text-primary-foreground'>
                                    Change Role
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Role Assignment Modal */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View className='flex-1 bg-black/60 items-center justify-center p-4'>
                    <View className='w-full max-w-sm rounded-2xl border border-border/60 bg-card p-5 shadow-lg'>
                        {/* Modal Header */}
                        <View className='flex-row items-center justify-between mb-4'>
                            <View>
                                <Text className='text-lg font-bold text-foreground'>
                                    Change Member Role
                                </Text>
                                <Text className='text-xs text-muted-foreground'>
                                    {selectedMember?.name}
                                </Text>
                            </View>
                            <Pressable
                                onPress={() => setModalVisible(false)}
                                className='h-8 w-8 items-center justify-center rounded-full bg-secondary active:opacity-70'
                            >
                                <Feather name="x" size={18} color="#9CA3AF" />
                            </Pressable>
                        </View>

                        <Text className='text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2.5'>
                            Select Co-op Role
                        </Text>

                        {/* Role Options */}
                        <View className='flex-col gap-2 mb-4'>
                            {(
                                [
                                    'household',
                                    'solar_owner',
                                    'technician',
                                    'manager',
                                ] as UserRole[]
                            ).map((roleKey) => {
                                const config = ROLE_LABELS[roleKey];
                                const isSelected = newRole === roleKey;

                                return (
                                    <Pressable
                                        key={roleKey}
                                        onPress={() => setNewRole(roleKey)}
                                        className={`flex-row items-center justify-between p-3 rounded-xl border ${isSelected
                                            ? 'bg-primary/15 border-primary shadow-sm'
                                            : 'bg-secondary/40 border-border/40 active:bg-secondary'
                                            }`}
                                    >
                                        <View className='flex-1'>
                                            <Text className='text-sm font-bold text-foreground'>
                                                {config.label}
                                            </Text>
                                            <Text
                                                className='text-[10px] text-muted-foreground mt-0.5'
                                                numberOfLines={1}
                                            >
                                                {config.desc}
                                            </Text>
                                        </View>

                                        {isSelected && (
                                            <View className='h-5 w-5 rounded-full bg-primary items-center justify-center'>
                                                <Feather name="check" size={12} color="#1F1B18" />
                                            </View>
                                        )}
                                    </Pressable>
                                );
                            })}
                        </View>

                        {/* Status Toggle */}
                        <Text className='text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2'>
                            Membership Status
                        </Text>
                        <View className='flex-row gap-2 mb-5'>
                            {(['active', 'pending', 'inactive'] as MemberStatus[]).map(
                                (st) => {
                                    const isSel = newStatus === st;
                                    return (
                                        <Pressable
                                            key={st}
                                            onPress={() => setNewStatus(st)}
                                            className={`flex-1 py-2 items-center justify-center rounded-xl border ${isSel
                                                ? 'bg-primary border-primary shadow-sm'
                                                : 'bg-secondary/40 border-border/40 active:bg-secondary'
                                                }`}
                                        >
                                            <Text
                                                className={`text-xs font-bold capitalize ${isSel
                                                    ? 'text-primary-foreground'
                                                    : 'text-muted-foreground'
                                                    }`}
                                            >
                                                {st}
                                            </Text>
                                        </Pressable>
                                    );
                                }
                            )}
                        </View>

                        {/* Modal Action Buttons */}
                        <View className='flex-row gap-3'>
                            <Pressable
                                onPress={() => setModalVisible(false)}
                                className='flex-1 py-2.5 items-center justify-center rounded-xl bg-secondary border border-border/60 active:opacity-75'
                            >
                                <Text className='text-sm font-bold text-foreground'>
                                    Cancel
                                </Text>
                            </Pressable>

                            <Pressable
                                onPress={handleSaveRole}
                                className='flex-1 py-2.5 items-center justify-center rounded-xl bg-primary border border-primary/40 active:opacity-80 shadow-sm'
                            >
                                <Text className='text-sm font-bold text-primary-foreground'>
                                    Save Changes
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default ManagerMembers;
