import HouseholdConsumerMenu from '@/components/household/menu/HouseholdConsumerMenu';
import TabScreenBackground from '@/components/shared/TabScreenBackground';
import SolarOwnerMenu from '@/components/solar-owner/menu/SolarOwnerMenu';
import { getUserRole } from '@/lib/getUserRole';
import { useAuth, useUser } from '@clerk/expo';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

interface MenuItemProps {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    badge?: string;
    isDestructive?: boolean;
}

const MenuItem = ({ icon, title, subtitle, onPress, badge, isDestructive }: MenuItemProps) => (
    <Pressable
        onPress={onPress}
        className='flex-row items-center justify-between p-3.5 active:bg-secondary/40'
    >
        <View className='flex-row items-center flex-1 mr-3'>
            <View className={`h-10 w-10 items-center justify-center rounded-xl mr-3 ${isDestructive ? 'bg-destructive/15' : 'bg-secondary border border-border/40'
                }`}>
                {icon}
            </View>

            <View className='flex-1'>
                <Text className={`text-base font-semibold ${isDestructive ? 'text-destructive font-bold' : 'text-foreground'
                    }`}>
                    {title}
                </Text>
                {subtitle && (
                    <Text className='text-xs text-muted-foreground mt-0.5'>
                        {subtitle}
                    </Text>
                )}
            </View>
        </View>

        <View className='flex-row items-center'>
            {badge && (
                <View className='rounded-full bg-primary/20 px-2.5 py-0.5 mr-2'>
                    <Text className='text-xs font-bold text-primary'>
                        {badge}
                    </Text>
                </View>
            )}
            <Feather
                name="chevron-right"
                size={18}
                color={isDestructive ? '#EF4444' : '#9CA3AF'}
            />
        </View>
    </Pressable>
);

const MenuScreen = () => {
    const { signOut } = useAuth();
    const { user } = useUser();

    const role = getUserRole(user?.publicMetadata?.role as string | undefined);

    if (role === 'solar_owner') {
        return <SolarOwnerMenu />;
    }

    if (role === 'household') {
        return <HouseholdConsumerMenu />;
    }

    const getRoleTitle = (r?: string | null) => {
        switch (r) {
            case 'solar_owner': return 'Solar Owner';
            case 'manager': return 'Grid Manager';
            case 'technician': return 'Solar Technician';
            case 'household': return 'Household Member';
            default: return 'Member';
        }
    };

    return (
        <View className='flex-1 bg-background'>
            <TabScreenBackground />

            <ScrollView
                className='flex-1'
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40 }}
            >
                {/* Screen Title */}
                <View className='flex-row items-center justify-between mb-6'>
                    <View>
                        <Text className='text-2xl font-extrabold text-foreground'>
                            Menu & Settings
                        </Text>
                        <Text className='text-xs text-muted-foreground mt-0.5'>
                            Preferences, solar community & account
                        </Text>
                    </View>

                    <View className='h-10 w-10 items-center justify-center rounded-2xl bg-secondary border border-border/60'>
                        <Feather name="grid" size={20} color="#F59E0B" />
                    </View>
                </View>

                {/* User Profile Card */}
                <View className='rounded-[24px] border border-border/70 bg-card/80 dark:bg-card/40 p-4 mb-6 shadow-sm'>
                    <View className='flex-row items-center'>
                        <View className='h-14 w-14 items-center justify-center rounded-2xl bg-primary border border-border/50 shadow-sm'>
                            <Text className='text-xl font-extrabold text-primary-foreground'>
                                {(user?.firstName?.[0] || 'U').toUpperCase()}
                            </Text>
                        </View>

                        <View className='ml-3.5 flex-1'>
                            <Text className='text-lg font-bold text-foreground'>
                                {user?.fullName || user?.firstName || 'Community User'}
                            </Text>
                            <Text className='text-xs text-muted-foreground'>
                                {user?.primaryEmailAddress?.emailAddress || 'user@solarlink.local'}
                            </Text>

                            <View className='self-start rounded-full bg-secondary px-2.5 py-0.5 mt-1.5'>
                                <Text className='text-[10px] font-bold uppercase tracking-wider text-secondary-foreground'>
                                    {getRoleTitle(role)}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Section 1: Account & Profile */}
                <Text className='text-xs font-bold uppercase tracking-wider text-muted-foreground ml-2 mb-2'>
                    Account & Profile
                </Text>
                <View className='rounded-[24px] border border-border/70 bg-card/80 dark:bg-card/40 overflow-hidden mb-6 shadow-sm divide-y divide-border/40'>
                    <MenuItem
                        icon={<Feather name="user" size={18} color="#F59E0B" />}
                        title="Account Settings"
                        subtitle="Manage personal info and credentials"
                    />
                    <MenuItem
                        icon={<MaterialCommunityIcons name="solar-power-variant" size={20} color="#F59E0B" />}
                        title="Community Solar Profile"
                        subtitle="Sharing quota and inverter link"
                        badge="Active"
                    />
                    <MenuItem
                        icon={<Feather name="bell" size={18} color="#F59E0B" />}
                        title="Notifications & Alerts"
                        subtitle="Grid alerts, maintenance and quota notices"
                    />
                </View>

                {/* Section 2: Energy, Reports & Credits */}
                <Text className='text-xs font-bold uppercase tracking-wider text-muted-foreground ml-2 mb-2'>
                    Energy & Analytics
                </Text>
                <View className='rounded-[24px] border border-border/70 bg-card/80 dark:bg-card/40 overflow-hidden mb-6 shadow-sm divide-y divide-border/40'>
                    <MenuItem
                        icon={<Feather name="bar-chart-2" size={18} color="#10B981" />}
                        title="Energy Reports & Logs"
                        subtitle="Export daily, weekly, and monthly stats"
                    />
                    <MenuItem
                        icon={<Feather name="dollar-sign" size={18} color="#10B981" />}
                        title="Billing & Green Credits"
                        subtitle="View energy traded & community rewards"
                    />
                    <MenuItem
                        icon={<Feather name="cpu" size={18} color="#10B981" />}
                        title="Solar Inverters & IoT"
                        subtitle="Hardware status and telemetry"
                    />
                </View>

                {/* Section 3: Support & Legal */}
                <Text className='text-xs font-bold uppercase tracking-wider text-muted-foreground ml-2 mb-2'>
                    Support & About
                </Text>
                <View className='rounded-[24px] border border-border/70 bg-card/80 dark:bg-card/40 overflow-hidden mb-6 shadow-sm divide-y divide-border/40'>
                    <MenuItem
                        icon={<Feather name="help-circle" size={18} color="#6B7280" />}
                        title="Help Desk & FAQs"
                        subtitle="Contact support or community guides"
                    />
                    <MenuItem
                        icon={<Feather name="shield" size={18} color="#6B7280" />}
                        title="Privacy & Legal Terms"
                        subtitle="Data policies and sharing terms"
                    />
                </View>

                {/* Sign Out Button */}
                <Pressable
                    onPress={() => signOut()}
                    className='rounded-2xl border border-destructive/30 bg-destructive/10 p-4 flex-row items-center justify-center active:opacity-80 mb-6'
                >
                    <Feather name="log-out" size={18} color="#DC2626" style={{ marginRight: 8 }} />
                    <Text className='text-base font-bold text-destructive'>
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

export default MenuScreen;