import TabScreenBackground from '@/components/shared/TabScreenBackground';
import { useAuth, useUser } from '@clerk/expo';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { SolarToast } from '../shared/SolarToast';
import { ViewHeader } from '../shared/ViewHeader';
import { useSolarOwnerStore } from '../store/useSolarOwnerStore';

export const SolarOwnerMenu = () => {
    const { signOut } = useAuth();
    const { user } = useUser();
    const {
        hardware,
        suggestions,
        notificationsEnabled,
        toggleNotificationSetting,
        showToast,
    } = useSolarOwnerStore();

    const [tipsModalVisible, setTipsModalVisible] = useState(false);
    const [maintenanceModalVisible, setMaintenanceModalVisible] = useState(false);
    const [hardwareModalVisible, setHardwareModalVisible] = useState(false);

    return (
        <View className="flex-1 bg-background">
            <TabScreenBackground />
            <SolarToast />

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
            >
                {/* Header */}
                <ViewHeader
                    title="Menu & Settings"
                    subtitle="Solar system, profile & co-op preferences"
                    showBack={false}
                />

                {/* 1. USER PROFILE & HOUSEHOLD CARD */}
                <View className="rounded-[28px] border border-border/70 bg-card/85 dark:bg-card/50 p-5 mb-5 shadow-sm">
                    <View className="flex-row items-center">
                        <View className="h-14 w-14 rounded-2xl bg-amber-500 items-center justify-center shadow-md">
                            <Text className="text-2xl font-black text-amber-950">
                                {(user?.firstName?.[0] || 'D').toUpperCase()}
                            </Text>
                        </View>
                        <View className="ml-3.5 flex-1">
                            <Text className="text-base font-bold text-foreground">
                                {user?.fullName || 'Deshan Senanayake'}
                            </Text>
                            <Text className="text-xs text-muted-foreground">
                                {user?.primaryEmailAddress?.emailAddress || 'deshan.solar@solarlink.local'}
                            </Text>
                            <View className="flex-row items-center mt-1.5">
                                <View className="rounded-full bg-amber-500/20 px-2.5 py-0.5 border border-amber-500/30">
                                    <Text className="text-[10px] font-black uppercase text-amber-500">
                                        Solar Panel Owner
                                    </Text>
                                </View>
                                <Text className="text-[10px] text-muted-foreground ml-2">
                                    Colombo South Co-Op
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* 2. SOLAR SYSTEM & HARDWARE */}
                <Text className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-2 mb-2">
                    Solar Hardware & Maintenance
                </Text>
                <View className="rounded-[24px] border border-border/70 bg-card/85 dark:bg-card/50 overflow-hidden mb-5 shadow-sm divide-y divide-border/40">
                    <Pressable
                        onPress={() => setHardwareModalVisible(true)}
                        className="flex-row items-center justify-between p-4 active:bg-secondary/40"
                    >
                        <View className="flex-row items-center flex-1 mr-2">
                            <View className="h-9 w-9 rounded-xl bg-amber-500/15 items-center justify-center mr-3 border border-amber-500/30">
                                <MaterialCommunityIcons name="solar-panel" size={18} color="#F59E0B" />
                            </View>
                            <View>
                                <Text className="text-sm font-bold text-foreground">
                                    Solar Panels & Inverter Specs
                                </Text>
                                <Text className="text-xs text-muted-foreground">
                                    6.0 kWp • 12 SunPower panels • 98.4% Eff.
                                </Text>
                            </View>
                        </View>
                        <Feather name="chevron-right" size={18} color="#9CA3AF" />
                    </Pressable>

                    <Pressable
                        onPress={() => setMaintenanceModalVisible(true)}
                        className="flex-row items-center justify-between p-4 active:bg-secondary/40"
                    >
                        <View className="flex-row items-center flex-1 mr-2">
                            <View className="h-9 w-9 rounded-xl bg-emerald-500/15 items-center justify-center mr-3 border border-emerald-500/30">
                                <Feather name="tool" size={16} color="#10B981" />
                            </View>
                            <View>
                                <Text className="text-sm font-bold text-foreground">
                                    Maintenance & Health Check
                                </Text>
                                <Text className="text-xs text-muted-foreground">
                                    Next service due: Jul 15, 2026
                                </Text>
                            </View>
                        </View>
                        <Feather name="chevron-right" size={18} color="#9CA3AF" />
                    </Pressable>

                    <Pressable
                        onPress={() => setTipsModalVisible(true)}
                        className="flex-row items-center justify-between p-4 active:bg-secondary/40"
                    >
                        <View className="flex-row items-center flex-1 mr-2">
                            <View className="h-9 w-9 rounded-xl bg-purple-500/15 items-center justify-center mr-3 border border-purple-500/30">
                                <Feather name="zap" size={16} color="#A855F7" />
                            </View>
                            <View>
                                <Text className="text-sm font-bold text-foreground">
                                    Energy Efficiency Suggestions
                                </Text>
                                <Text className="text-xs text-muted-foreground">
                                    Actionable tips to maximize solar savings
                                </Text>
                            </View>
                        </View>
                        <Feather name="chevron-right" size={18} color="#9CA3AF" />
                    </Pressable>
                </View>

                {/* 3. NOTIFICATION SETTINGS */}
                <Text className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-2 mb-2">
                    Notification Preferences
                </Text>
                <View className="rounded-[24px] border border-border/70 bg-card/85 dark:bg-card/50 overflow-hidden mb-5 shadow-sm divide-y divide-border/40 p-2">
                    <View className="flex-row items-center justify-between p-3">
                        <View className="flex-1 mr-3">
                            <Text className="text-xs font-bold text-foreground">
                                Community Energy Requests
                            </Text>
                            <Text className="text-[10px] text-muted-foreground">
                                Push notification when a neighbor needs energy
                            </Text>
                        </View>
                        <Switch
                            value={notificationsEnabled.energyRequests}
                            onValueChange={() => toggleNotificationSetting('energyRequests')}
                            trackColor={{ false: '#64748B', true: '#F59E0B' }}
                        />
                    </View>

                    <View className="flex-row items-center justify-between p-3">
                        <View className="flex-1 mr-3">
                            <Text className="text-xs font-bold text-foreground">
                                Low Battery Warnings
                            </Text>
                            <Text className="text-[10px] text-muted-foreground">
                                Alert when battery capacity drops below 20%
                            </Text>
                        </View>
                        <Switch
                            value={notificationsEnabled.lowBattery}
                            onValueChange={() => toggleNotificationSetting('lowBattery')}
                            trackColor={{ false: '#64748B', true: '#F59E0B' }}
                        />
                    </View>

                    <View className="flex-row items-center justify-between p-3">
                        <View className="flex-1 mr-3">
                            <Text className="text-xs font-bold text-foreground">
                                Maintenance & Inverter Alerts
                            </Text>
                            <Text className="text-[10px] text-muted-foreground">
                                Diagnostic alerts and seasonal cleaning reminders
                            </Text>
                        </View>
                        <Switch
                            value={notificationsEnabled.maintenanceReminders}
                            onValueChange={() => toggleNotificationSetting('maintenanceReminders')}
                            trackColor={{ false: '#64748B', true: '#F59E0B' }}
                        />
                    </View>
                </View>

                {/* 4. PRIVACY & LOGOUT */}
                <Text className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-2 mb-2">
                    Account & Security
                </Text>
                <View className="rounded-[24px] border border-border/70 bg-card/85 dark:bg-card/50 overflow-hidden mb-6 shadow-sm divide-y divide-border/40">
                    <Pressable
                        onPress={() => showToast('Grid privacy settings are up to date', 'info')}
                        className="flex-row items-center justify-between p-4 active:bg-secondary/40"
                    >
                        <View className="flex-row items-center flex-1 mr-2">
                            <View className="h-9 w-9 rounded-xl bg-secondary items-center justify-center mr-3 border border-border/60">
                                <Feather name="shield" size={16} color="#64748B" />
                            </View>
                            <View>
                                <Text className="text-sm font-bold text-foreground">
                                    Privacy & Telemetry Data
                                </Text>
                                <Text className="text-xs text-muted-foreground">
                                    End-to-end encrypted microgrid sharing
                                </Text>
                            </View>
                        </View>
                        <Feather name="chevron-right" size={18} color="#9CA3AF" />
                    </Pressable>

                    <Pressable
                        onPress={() => signOut()}
                        className="flex-row items-center p-4 active:bg-destructive/10"
                    >
                        <View className="h-9 w-9 rounded-xl bg-destructive/15 items-center justify-center mr-3 border border-destructive/30">
                            <Feather name="log-out" size={16} color="#EF4444" />
                        </View>
                        <Text className="text-sm font-bold text-destructive">
                            Sign Out of Solar-Link
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>

            {/* --- MODAL: HARDWARE SPECIFICATIONS --- */}
            <Modal visible={hardwareModalVisible} transparent animationType="slide">
                <View className="flex-1 bg-black/60 justify-end">
                    <View className="rounded-t-[36px] bg-card border-t border-border p-6 max-h-[80%]">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-lg font-black text-foreground">
                                Solar Hardware Information
                            </Text>
                            <Pressable
                                onPress={() => setHardwareModalVisible(false)}
                                className="h-8 w-8 rounded-full bg-secondary items-center justify-center"
                            >
                                <Feather name="x" size={18} color="#9CA3AF" />
                            </Pressable>
                        </View>

                        <ScrollView className="gap-3">
                            <View className="rounded-2xl bg-secondary/40 p-3.5 border border-border/60">
                                <Text className="text-[10px] uppercase font-bold text-muted-foreground">
                                    Rooftop Panels
                                </Text>
                                <Text className="text-sm font-bold text-foreground mt-0.5">
                                    {hardware.panelModel}
                                </Text>
                                <Text className="text-xs text-muted-foreground mt-0.5">
                                    {hardware.totalPanels} Panels • {hardware.peakCapacityKW} kWp Total Capacity
                                </Text>
                            </View>

                            <View className="rounded-2xl bg-secondary/40 p-3.5 border border-border/60">
                                <Text className="text-[10px] uppercase font-bold text-muted-foreground">
                                    Inverter
                                </Text>
                                <Text className="text-sm font-bold text-foreground mt-0.5">
                                    {hardware.inverterModel}
                                </Text>
                                <Text className="text-xs text-muted-foreground mt-0.5">
                                    Efficiency: {hardware.inverterEfficiency}% • Status: {hardware.inverterStatus}
                                </Text>
                            </View>

                            <View className="rounded-2xl bg-secondary/40 p-3.5 border border-border/60">
                                <Text className="text-[10px] uppercase font-bold text-muted-foreground">
                                    Installation & Warranty
                                </Text>
                                <Text className="text-xs text-foreground mt-0.5 font-medium">
                                    Installed: {hardware.installationDate} (25-year linear performance warranty)
                                </Text>
                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* --- MODAL: MAINTENANCE INFO --- */}
            <Modal visible={maintenanceModalVisible} transparent animationType="slide">
                <View className="flex-1 bg-black/60 justify-end">
                    <View className="rounded-t-[36px] bg-card border-t border-border p-6 max-h-[80%]">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-lg font-black text-foreground">
                                Maintenance & Health Check
                            </Text>
                            <Pressable
                                onPress={() => setMaintenanceModalVisible(false)}
                                className="h-8 w-8 rounded-full bg-secondary items-center justify-center"
                            >
                                <Feather name="x" size={18} color="#9CA3AF" />
                            </Pressable>
                        </View>

                        <View className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 mb-4">
                            <Text className="text-xs font-bold text-emerald-500 uppercase">
                                System Health: 100% Operational
                            </Text>
                            <Text className="text-xs text-muted-foreground mt-1">
                                Inverter telemetry and battery cells are balanced. Zero hardware faults detected.
                            </Text>
                        </View>

                        <View className="divide-y divide-border/40">
                            <View className="py-3 flex-row justify-between">
                                <Text className="text-xs text-muted-foreground">Last Full Inspection</Text>
                                <Text className="text-xs font-bold text-foreground">{hardware.lastServiceDate}</Text>
                            </View>
                            <View className="py-3 flex-row justify-between">
                                <Text className="text-xs text-muted-foreground">Next Scheduled Service</Text>
                                <Text className="text-xs font-bold text-foreground">{hardware.nextServiceDue}</Text>
                            </View>
                            <View className="py-3 flex-row justify-between">
                                <Text className="text-xs text-muted-foreground">Panel Dust Index</Text>
                                <Text className="text-xs font-bold text-amber-500">Low (98.2% output)</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* --- MODAL: EFFICIENCY SUGGESTIONS --- */}
            <Modal visible={tipsModalVisible} transparent animationType="slide">
                <View className="flex-1 bg-black/60 justify-end">
                    <View className="rounded-t-[36px] bg-card border-t border-border p-6 max-h-[80%]">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-lg font-black text-foreground">
                                Energy Efficiency Suggestions
                            </Text>
                            <Pressable
                                onPress={() => setTipsModalVisible(false)}
                                className="h-8 w-8 rounded-full bg-secondary items-center justify-center"
                            >
                                <Feather name="x" size={18} color="#9CA3AF" />
                            </Pressable>
                        </View>

                        <ScrollView className="gap-3">
                            {suggestions.map((sug) => (
                                <View key={sug.id} className="rounded-2xl border border-border/60 bg-secondary/30 p-3.5">
                                    <View className="flex-row items-center justify-between mb-1">
                                        <Text className="text-xs font-bold text-foreground flex-1 mr-2">
                                            {sug.title}
                                        </Text>
                                        <Text className="text-[10px] font-bold text-emerald-500">
                                            Save {sug.potentialSavingsUSD}
                                        </Text>
                                    </View>
                                    <Text className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                                        {sug.description}
                                    </Text>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default SolarOwnerMenu;
