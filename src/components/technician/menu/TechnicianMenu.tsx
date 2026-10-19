import TabScreenBackground from '@/components/shared/TabScreenBackground';
import { useClerk, useUser } from '@clerk/expo';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

interface MenuItemProps {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    badge?: { label: string; type?: 'success' | 'warning' | 'neutral' };
    isDestructive?: boolean;
}

const MenuItem = ({
    icon,
    title,
    subtitle,
    onPress,
    badge,
    isDestructive,
}: MenuItemProps) => (
    <Pressable
        onPress={onPress}
        className='flex-row items-center justify-between p-3.5 active:bg-secondary/40'
    >
        <View className='flex-row items-center flex-1 mr-3'>
            <View
                className={`h-10 w-10 items-center justify-center rounded-xl mr-3 ${
                    isDestructive
                        ? 'bg-destructive/15'
                        : 'bg-card border border-border/60'
                }`}
            >
                {icon}
            </View>

            <View className='flex-1'>
                <Text
                    className={`text-sm font-bold ${
                        isDestructive ? 'text-destructive' : 'text-foreground'
                    }`}
                >
                    {title}
                </Text>
                {subtitle && (
                    <Text className='text-xs text-muted-foreground mt-0.5' numberOfLines={1}>
                        {subtitle}
                    </Text>
                )}
            </View>
        </View>

        <View className='flex-row items-center gap-2'>
            {badge && (
                <View
                    className={`px-2.5 py-0.5 rounded-full border ${
                        badge.type === 'success'
                            ? 'bg-emerald-500/15 border-emerald-500/40'
                            : badge.type === 'warning'
                            ? 'bg-yellow-500/15 border-yellow-500/40'
                            : 'bg-zinc-500/15 border-zinc-500/40'
                    }`}
                >
                    <Text
                        className={`text-[10px] font-bold uppercase ${
                            badge.type === 'success'
                                ? 'text-[#10B981]'
                                : badge.type === 'warning'
                                ? 'text-[#F59E0B]'
                                : 'text-[#6B7280]'
                        }`}
                    >
                        {badge.label}
                    </Text>
                </View>
            )}
            <Feather
                name="chevron-right"
                size={16}
                color={isDestructive ? '#EF4444' : '#9CA3AF'}
            />
        </View>
    </Pressable>
);

export const TechnicianMenu = () => {
    const { signOut } = useClerk();
    const { user } = useUser();
    const router = useRouter();

    const [signOutModalVisible, setSignOutModalVisible] = useState(false);
    const [isSigningOut, setIsSigningOut] = useState(false);

    const handleConfirmSignOut = async () => {
        try {
            setIsSigningOut(true);
            await signOut();
            setSignOutModalVisible(false);
            router.replace('/(auth)/sign-in');
        } catch (error) {
            console.error('Error during sign out:', error);
            setIsSigningOut(false);
        }
    };

    return (
        <View className='flex-1 bg-background'>
            <TabScreenBackground />

            <ScrollView
                className='flex-1'
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1, padding: 20, paddingVertical: 60 }}
            >
                {/* Header */}
                <View className='flex-row items-center justify-between mb-6'>
                    <View>
                        <Text className='text-2xl font-extrabold text-foreground tracking-tight'>
                            Menu & Settings
                        </Text>
                        <Text className='text-xs text-muted-foreground mt-0.5'>
                            Field operations, diagnostics & preferences
                        </Text>
                    </View>

                    <Pressable
                        onPress={() => router.push('/(tabs)/alerts')}
                        className='h-10 w-10 items-center justify-center rounded-2xl bg-secondary border border-border/60 shadow-sm active:opacity-70'
                    >
                        <Feather name="bell" size={20} color="#F59E0B" />
                    </Pressable>
                </View>

                {/* Technician Profile Card */}
                <View className='rounded-xl border border-border/40 bg-secondary/60 p-4 mb-6 shadow-sm'>
                    <View className='flex-row items-center'>
                        <View className='h-12 w-12 items-center justify-center rounded-xl bg-card border border-border/60 shadow-sm'>
                            <Text className='text-lg font-extrabold text-foreground'>
                                {(user?.firstName?.[0] || 'T').toUpperCase()}
                                {(user?.lastName?.[0] || '').toUpperCase()}
                            </Text>
                        </View>

                        <View className='ml-3 flex-1'>
                            <Text className='text-base font-bold text-foreground' numberOfLines={1}>
                                {user?.fullName || user?.firstName || 'Field Technician'}
                            </Text>
                            <Text className='text-xs text-muted-foreground' numberOfLines={1}>
                                {user?.primaryEmailAddress?.emailAddress || 'technician@solarlink.org'}
                            </Text>

                            <View className='self-start px-2.5 py-0.5 rounded-full border bg-cyan-500/15 border-cyan-500/30 mt-1.5'>
                                <Text className='text-[10px] font-bold uppercase text-cyan-500'>
                                    Certified Field Technician
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Section 1: Field Operations */}
                <Text className='text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 mb-2'>
                    Field Operations
                </Text>
                <View className='rounded-xl border border-border/40 bg-secondary/60 overflow-hidden mb-6 shadow-sm divide-y divide-border/40'>
                    <MenuItem
                        icon={<Feather name="tool" size={16} color="#06B6D4" />}
                        title="Service Requests"
                        subtitle="Assigned maintenance tickets & inspections"
                        onPress={() => router.push('/(tabs)/requests')}
                    />
                    <MenuItem
                        icon={<Feather name="activity" size={16} color="#10B981" />}
                        title="System Diagnostics"
                        subtitle="Inverter telemetry, fault logs & readings"
                        onPress={() => router.push('/(tabs)/energy')}
                    />
                    <MenuItem
                        icon={<Feather name="calendar" size={16} color="#F59E0B" />}
                        title="Maintenance Schedule"
                        subtitle="Upcoming field visits & routine checkups"
                        onPress={() => router.push('/(tabs)/schedule')}
                    />
                </View>

                {/* Section 2: Alerts & System */}
                <Text className='text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 mb-2'>
                    Monitoring & Alerts
                </Text>
                <View className='rounded-xl border border-border/40 bg-secondary/60 overflow-hidden mb-6 shadow-sm divide-y divide-border/40'>
                    <MenuItem
                        icon={<Feather name="bell" size={16} color="#F59E0B" />}
                        title="Alerts & Fault Notices"
                        subtitle="Real-time notification feeds and critical events"
                        onPress={() => router.push('/(tabs)/alerts')}
                    />
                    <MenuItem
                        icon={<Feather name="check-circle" size={16} color="#10B981" />}
                        title="Diagnostics Link Status"
                        subtitle="Connected to Co-Op smart grid telemetry"
                        badge={{ label: 'Online', type: 'success' }}
                    />
                </View>

                {/* Section 3: Account */}
                <Text className='text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 mb-2'>
                    Session
                </Text>
                <View className='rounded-xl border border-border/40 bg-secondary/60 overflow-hidden mb-8 shadow-sm'>
                    <MenuItem
                        icon={<Feather name="log-out" size={16} color="#EF4444" />}
                        title="Sign Out"
                        subtitle="Log out of this technician account"
                        isDestructive
                        onPress={() => setSignOutModalVisible(true)}
                    />
                </View>
            </ScrollView>

            {/* Sign Out Confirmation Modal */}
            <Modal
                transparent
                visible={signOutModalVisible}
                animationType="fade"
                onRequestClose={() => !isSigningOut && setSignOutModalVisible(false)}
            >
                <View className='flex-1 justify-center items-center bg-black/60 px-6'>
                    <View className='w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl'>
                        <View className='h-12 w-12 rounded-full bg-destructive/15 items-center justify-center mb-4 self-center'>
                            <Feather name="log-out" size={24} color="#EF4444" />
                        </View>

                        <Text className='text-lg font-bold text-foreground text-center mb-2'>
                            Sign Out?
                        </Text>
                        <Text className='text-xs text-muted-foreground text-center mb-6 leading-relaxed'>
                            Are you sure you want to sign out of SolarLink Technician Portal?
                        </Text>

                        <View className='flex-row gap-3'>
                            <Pressable
                                disabled={isSigningOut}
                                onPress={() => setSignOutModalVisible(false)}
                                className='flex-1 py-3 rounded-xl border border-border bg-secondary items-center active:opacity-70'
                            >
                                <Text className='text-sm font-semibold text-foreground'>
                                    Cancel
                                </Text>
                            </Pressable>
                            <Pressable
                                disabled={isSigningOut}
                                onPress={handleConfirmSignOut}
                                className='flex-1 py-3 rounded-xl bg-destructive items-center active:opacity-80'
                            >
                                <Text className='text-sm font-semibold text-white'>
                                    {isSigningOut ? 'Signing out...' : 'Sign Out'}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default TechnicianMenu;
