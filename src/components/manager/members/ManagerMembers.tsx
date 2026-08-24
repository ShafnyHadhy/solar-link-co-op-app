import TabScreenBackground from '@/components/shared/TabScreenBackground';
import { INITIAL_MEMBERS, calculateMemberAnalytics } from '@/lib/memberService';
import { CommunityMember, MemberStatus } from '@/types/member';
import { UserRole } from '@/types/role';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    Pressable,
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
    const [members, setMembers] = useState<CommunityMember[]>(INITIAL_MEMBERS);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState<'all' | UserRole | 'pending'>('all');

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
            m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.email.toLowerCase().includes(searchQuery.toLowerCase());

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
                        <Text className='text-3xl font-extrabold text-foreground'>
                            {analytics.totalMembers}
                        </Text>
                        <Text className='text-xs font-semibold text-muted-foreground mt-1'>
                            Total Members
                        </Text>
                    </View>

                    {/* Active Members */}
                    <View className='flex-1 flex-col justify-between rounded-xl border border-border/40 bg-secondary/60 p-4 shadow-sm'>
                        <Text className='text-3xl font-extrabold text-foreground'>
                            {analytics.activeMembers}
                        </Text>
                        <Text className='text-xs font-semibold text-muted-foreground mt-1'>
                            Active Co-op
                        </Text>
                    </View>

                    {/* Pending Members */}
                    <View className='flex-1 flex-col justify-between rounded-xl border border-border/40 bg-secondary/60 p-4 shadow-sm'>
                        <Text className='text-3xl font-extrabold text-foreground'>
                            {analytics.pendingMembers}
                        </Text>
                        <Text className='text-xs font-semibold text-muted-foreground mt-1'>
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
                            All ({members.length})
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={() => setSelectedFilter('solar_owner')}
                        className={`px-4 py-2 rounded-full border ${selectedFilter === 'solar_owner'
                                ? 'bg-primary border-primary shadow-sm'
                                : 'bg-secondary/60 border-border/60 active:bg-secondary'
                            }`}
                    >
                        <Text
                            className={`text-xs font-bold ${selectedFilter === 'solar_owner'
                                    ? 'text-primary-foreground'
                                    : 'text-muted-foreground'
                                }`}
                        >
                            Solar Owners ({analytics.solarOwnerCount})
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={() => setSelectedFilter('household')}
                        className={`px-4 py-2 rounded-full border ${selectedFilter === 'household'
                                ? 'bg-primary border-primary shadow-sm'
                                : 'bg-secondary/60 border-border/60 active:bg-secondary'
                            }`}
                    >
                        <Text
                            className={`text-xs font-bold ${selectedFilter === 'household'
                                    ? 'text-primary-foreground'
                                    : 'text-muted-foreground'
                                }`}
                        >
                            Households ({analytics.householdCount})
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={() => setSelectedFilter('technician')}
                        className={`px-4 py-2 rounded-full border ${selectedFilter === 'technician'
                                ? 'bg-primary border-primary shadow-sm'
                                : 'bg-secondary/60 border-border/60 active:bg-secondary'
                            }`}
                    >
                        <Text
                            className={`text-xs font-bold ${selectedFilter === 'technician'
                                    ? 'text-primary-foreground'
                                    : 'text-muted-foreground'
                                }`}
                        >
                            Technicians ({analytics.technicianCount})
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
                            Pending ({analytics.pendingMembers})
                        </Text>
                    </Pressable>
                </ScrollView>

                {/* Member Cards List */}
                <View className='flex-col gap-4'>
                    {filteredMembers.map((member) => {
                        const roleInfo = ROLE_LABELS[member.role];
                        const isPending = member.status === 'pending';
                        const isActive = member.status === 'active';

                        return (
                            <View
                                key={member.id}
                                className='rounded-xl border border-border/40 bg-secondary/60 p-4 shadow-sm'
                            >
                                {/* Member Header */}
                                <View className='flex-row items-center justify-between mb-3'>
                                    <View className='flex-row items-center gap-3 flex-1 mr-2'>
                                        {/* Avatar Initials */}
                                        <View className='h-10 w-10 items-center justify-center rounded-xl bg-card border border-border/60'>
                                            <Text className='text-sm font-extrabold text-foreground'>
                                                {member.name
                                                    .split(' ')
                                                    .map((n) => n[0])
                                                    .join('')
                                                    .substring(0, 2)
                                                    .toUpperCase()}
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
                                </View>

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
                        );
                    })}

                    {/* Empty State */}
                    {filteredMembers.length === 0 && (
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
                    )}
                </View>
            </ScrollView>

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
