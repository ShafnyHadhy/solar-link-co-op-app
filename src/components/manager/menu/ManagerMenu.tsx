import TabScreenBackground from '@/components/shared/TabScreenBackground';
import { useAuth, useUser } from '@clerk/expo';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

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

export const ManagerMenu = () => {
    const { signOut } = useAuth();
    const { user } = useUser();

    const handleSignOut = () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out of your account?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out',
                style: 'destructive',
                onPress: () => signOut(),
            },
        ]);
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
                            Grid preferences, community & admin tools
                        </Text>
                    </View>

                    <View className='h-10 w-10 items-center justify-center rounded-2xl bg-secondary border border-border/60 shadow-sm'>
                        <Feather name="bell" size={20} color="#F59E0B" />
                    </View>
                </View>

                {/* Manager Profile Card */}
                <View className='rounded-xl border border-border/40 bg-secondary/60 p-4 mb-6 shadow-sm'>
                    <View className='flex-row items-center'>
                        <View className='h-12 w-12 items-center justify-center rounded-xl bg-card border border-border/60 shadow-sm'>
                            <Text className='text-lg font-extrabold text-foreground'>
                                {(user?.firstName?.[0] || 'M').toUpperCase()}
                                {(user?.lastName?.[0] || '').toUpperCase()}
                            </Text>
                        </View>

                        <View className='ml-3 flex-1'>
                            <Text className='text-base font-bold text-foreground' numberOfLines={1}>
                                {user?.fullName || user?.firstName || 'Grid Manager'}
                            </Text>
                            <Text className='text-xs text-muted-foreground' numberOfLines={1}>
                                {user?.primaryEmailAddress?.emailAddress || 'manager@solarlink.org'}
                            </Text>

                            <View className='self-start px-2.5 py-0.5 rounded-full border bg-purple-500/15 border-purple-500/30 mt-1.5'>
                                <Text className='text-[10px] font-bold uppercase text-purple-500'>
                                    Grid Manager
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Section 1: Grid Administration */}
                <Text className='text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 mb-2'>
                    Grid Administration
                </Text>
                <View className='rounded-xl border border-border/40 bg-secondary/60 overflow-hidden mb-6 shadow-sm divide-y divide-border/40'>
                    <MenuItem
                        icon={<Feather name="sliders" size={16} color="#F59E0B" />}
                        title="Community Energy Allocation"
                        subtitle="Sharing quotas, reserve thresholds & pool cap"
                        badge={{ label: 'Active', type: 'success' }}
                        onPress={() =>
                            Alert.alert(
                                'Allocation Policy',
                                'Community solar sharing reserve is set to 45 kWh available.'
                            )
                        }
                    />
                    <MenuItem
                        icon={<MaterialCommunityIcons name="transmission-tower" size={18} color="#F59E0B" />}
                        title="Substations & Grid Topology"
                        subtitle="Sector 4B, North Grid & battery storage bank"
                    />
                    <MenuItem
                        icon={<Feather name="shield" size={16} color="#F59E0B" />}
                        title="Audit Logs & Access History"
                        subtitle="Review role updates & permission changes"
                    />
                </View>

                {/* Section 2: Energy Analytics & Billing */}
                <Text className='text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 mb-2'>
                    Energy & Billing
                </Text>
                <View className='rounded-xl border border-border/40 bg-secondary/60 overflow-hidden mb-6 shadow-sm divide-y divide-border/40'>
                    <MenuItem
                        icon={<Feather name="bar-chart-2" size={16} color="#10B981" />}
                        title="Community Energy Reports"
                        subtitle="Export solar generation, usage & battery logs"
                    />
                    <MenuItem
                        icon={<Feather name="dollar-sign" size={16} color="#10B981" />}
                        title="Tariff & Green Credit Rates"
                        subtitle="Configure peak, off-peak rates & trade pricing"
                        badge={{ label: 'Verified', type: 'success' }}
                    />
                    <MenuItem
                        icon={<Feather name="tool" size={16} color="#10B981" />}
                        title="Technician Dispatch & Tickets"
                        subtitle="Hardware maintenance & inverter telemetry"
                    />
                </View>

                {/* Section 3: Preferences & Support */}
                <Text className='text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1 mb-2'>
                    Preferences & Support
                </Text>
                <View className='rounded-xl border border-border/40 bg-secondary/60 overflow-hidden mb-6 shadow-sm divide-y divide-border/40'>
                    <MenuItem
                        icon={<Feather name="bell" size={16} color="#6B7280" />}
                        title="Notification Settings"
                        subtitle="Alert thresholds, push notifications & digest"
                    />
                    <MenuItem
                        icon={<Feather name="help-circle" size={16} color="#6B7280" />}
                        title="Help Desk & FAQs"
                        subtitle="Community operator documentation & support"
                    />
                    <MenuItem
                        icon={<Feather name="file-text" size={16} color="#6B7280" />}
                        title="Privacy & Co-op Terms"
                        subtitle="Data policies and power-sharing agreements"
                    />
                </View>

                {/* Sign Out Button */}
                <Pressable
                    onPress={handleSignOut}
                    className='rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 flex-row items-center justify-center active:opacity-80 mb-6 shadow-sm'
                >
                    <Feather name="log-out" size={16} color="#EF4444" style={{ marginRight: 8 }} />
                    <Text className='text-sm font-bold text-destructive'>
                        Sign Out
                    </Text>
                </Pressable>

                {/* App Version Info */}
                <View className='items-center justify-center py-2'>
                    <Text className='text-xs text-muted-foreground font-mono'>
                        Solar-Link v1.0.0 • Clean Community Energy
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

export default ManagerMenu;
