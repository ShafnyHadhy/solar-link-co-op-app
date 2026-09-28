import TabScreenBackground from '@/components/shared/TabScreenBackground';
import { useAuth, useUser } from '@clerk/expo';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SolarOwnerPrediction } from '../prediction/SolarOwnerPrediction';
import { SolarOwnerReports } from '../reports/SolarOwnerReports';
import { SolarToast } from '../shared/SolarToast';
import { ViewHeader } from '../shared/ViewHeader';
import { useSolarOwnerStore } from '../store/useSolarOwnerStore';

export const SolarOwnerMenu = () => {
    const insets = useSafeAreaInsets();
    const { signOut } = useAuth();
    const { user } = useUser();
    const {
        hardware,
        suggestions,
        notificationsEnabled,
        toggleNotificationSetting,
        showToast,
        solarAssets,
        createSolarAssetAction,
        updateSolarAssetAction,
        fetchSolarData,
    } = useSolarOwnerStore();

    const [tipsModalVisible, setTipsModalVisible] = useState(false);
    const [maintenanceModalVisible, setMaintenanceModalVisible] = useState(false);
    const [hardwareModalVisible, setHardwareModalVisible] = useState(false);
    const [assetModalVisible, setAssetModalVisible] = useState(false);
    const [predictionModalVisible, setPredictionModalVisible] = useState(false);
    const [reportsModalVisible, setReportsModalVisible] = useState(false);

    const primaryAsset = solarAssets[0] || null;

    // Asset form state
    const [assetName, setAssetName] = useState('Home Solar System');
    const [assetCapacity, setAssetCapacity] = useState('6.0');
    const [assetLocation, setAssetLocation] = useState('Main Roof');
    const [assetType, setAssetType] = useState('solar_panel');
    const [isSavingAsset, setIsSavingAsset] = useState(false);

    useEffect(() => {
        if (primaryAsset) {
            setAssetName(primaryAsset.name);
            setAssetCapacity(primaryAsset.capacityKw || '6.0');
            setAssetLocation(primaryAsset.location || 'Main Roof');
            setAssetType(primaryAsset.assetType || 'solar_panel');
        }
    }, [primaryAsset]);

    const handleSaveAsset = async () => {
        if (!user?.id) return;
        const capacityNum = parseFloat(assetCapacity);
        if (isNaN(capacityNum) || capacityNum <= 0) {
            showToast('Please enter a valid capacity in kW', 'warning');
            return;
        }

        setIsSavingAsset(true);
        if (primaryAsset) {
            const ok = await updateSolarAssetAction(primaryAsset.id, user.id, {
                name: assetName,
                capacityKw: capacityNum,
                location: assetLocation,
                assetType,
            });
            if (ok) setAssetModalVisible(false);
        } else {
            const ok = await createSolarAssetAction(user.id, {
                name: assetName,
                capacityKw: capacityNum,
                location: assetLocation,
                assetType,
            });
            if (ok) setAssetModalVisible(false);
        }
        setIsSavingAsset(false);
    };

    return (
        <View className="flex-1 bg-background">
            <TabScreenBackground />
            <SolarToast />

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingTop: insets.top > 0 ? insets.top + 10 : 24,
                    paddingBottom: 40,
                }}
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
                        className="flex-row items-center justify-between p-4 active:bg-secondary/40 gap-2"
                    >
                        <View className="flex-row items-center flex-1 mr-2 min-w-0">
                            <View className="h-9 w-9 rounded-xl bg-amber-500/15 items-center justify-center mr-3 border border-amber-500/30 flex-shrink-0">
                                <MaterialCommunityIcons name="solar-panel" size={18} color="#F59E0B" />
                            </View>
                            <View className="flex-1 min-w-0">
                                <Text className="text-sm font-bold text-foreground" numberOfLines={1}>
                                    {primaryAsset ? primaryAsset.name : 'Solar Panels & Inverter Specs'}
                                </Text>
                                <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                                    {primaryAsset
                                        ? `${primaryAsset.capacityKw || '6.0'} kWp • ${primaryAsset.location || 'Main Roof'} • Status: ${primaryAsset.status}`
                                        : '6.0 kWp • 12 SunPower panels • 98.4% Eff.'}
                                </Text>
                            </View>
                        </View>
                        <Feather name="chevron-right" size={18} color="#9CA3AF" style={{ flexShrink: 0 }} />
                    </Pressable>

                    {/* Register / Edit Asset Row */}
                    <Pressable
                        onPress={() => setAssetModalVisible(true)}
                        className="flex-row items-center justify-between p-4 active:bg-secondary/40 gap-2"
                    >
                        <View className="flex-row items-center flex-1 mr-2 min-w-0">
                            <View className="h-9 w-9 rounded-xl bg-sky-500/15 items-center justify-center mr-3 border border-sky-500/30 flex-shrink-0">
                                <Feather name={primaryAsset ? 'edit-3' : 'plus-circle'} size={16} color="#0EA5E9" />
                            </View>
                            <View className="flex-1 min-w-0">
                                <Text className="text-sm font-bold text-foreground" numberOfLines={1}>
                                    {primaryAsset ? 'Manage Solar Asset Specs' : 'Register Solar Asset (US-04A)'}
                                </Text>
                                <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                                    {primaryAsset ? 'Edit capacity, location & system name' : 'Add rooftop panels to sync with microgrid'}
                                </Text>
                            </View>
                        </View>
                        <Feather name="chevron-right" size={18} color="#9CA3AF" style={{ flexShrink: 0 }} />
                    </Pressable>

                    <Pressable
                        onPress={() => setMaintenanceModalVisible(true)}
                        className="flex-row items-center justify-between p-4 active:bg-secondary/40 gap-2"
                    >
                        <View className="flex-row items-center flex-1 mr-2 min-w-0">
                            <View className="h-9 w-9 rounded-xl bg-emerald-500/15 items-center justify-center mr-3 border border-emerald-500/30 flex-shrink-0">
                                <Feather name="tool" size={16} color="#10B981" />
                            </View>
                            <View className="flex-1 min-w-0">
                                <Text className="text-sm font-bold text-foreground" numberOfLines={1}>
                                    System Maintenance & Inspection
                                </Text>
                                <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                                    Last cleaned 14 days ago • Inverter optimal
                                </Text>
                            </View>
                        </View>
                        <Feather name="chevron-right" size={18} color="#9CA3AF" style={{ flexShrink: 0 }} />
                    </Pressable>

                    <Pressable
                        onPress={() => setTipsModalVisible(true)}
                        className="flex-row items-center justify-between p-4 active:bg-secondary/40 gap-2"
                    >
                        <View className="flex-row items-center flex-1 mr-2 min-w-0">
                            <View className="h-9 w-9 rounded-xl bg-purple-500/15 items-center justify-center mr-3 border border-purple-500/30 flex-shrink-0">
                                <Feather name="book-open" size={16} color="#A855F7" />
                            </View>
                            <View className="flex-1 min-w-0">
                                <Text className="text-sm font-bold text-foreground" numberOfLines={1}>
                                    Solar Optimization Tips
                                </Text>
                                <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                                    5 recommendations to maximize yield
                                </Text>
                            </View>
                        </View>
                        <Feather name="chevron-right" size={18} color="#9CA3AF" style={{ flexShrink: 0 }} />
                    </Pressable>
                </View>

                {/* 3. ANALYTICS & FORECASTING (Linked Screens) */}
                <Text className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground ml-2 mb-2">
                    Advanced Analytics & Forecasting
                </Text>
                <View className="rounded-[24px] border border-border/70 bg-card/85 dark:bg-card/50 overflow-hidden mb-5 shadow-sm divide-y divide-border/40">
                    <Pressable
                        onPress={() => setPredictionModalVisible(true)}
                        className="flex-row items-center justify-between p-4 active:bg-secondary/40 gap-2"
                    >
                        <View className="flex-row items-center flex-1 mr-2 min-w-0">
                            <View className="h-9 w-9 rounded-xl bg-amber-500/15 items-center justify-center mr-3 border border-amber-500/30 flex-shrink-0">
                                <MaterialCommunityIcons name="weather-sunny" size={18} color="#F59E0B" />
                            </View>
                            <View className="flex-1 min-w-0">
                                <Text className="text-sm font-bold text-foreground" numberOfLines={1}>
                                    Solar Yield Prediction & 7-Day Forecast
                                </Text>
                                <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                                    AI hourly irradiance, peak sun hours & yield estimates
                                </Text>
                            </View>
                        </View>
                        <Feather name="chevron-right" size={18} color="#9CA3AF" style={{ flexShrink: 0 }} />
                    </Pressable>

                    <Pressable
                        onPress={() => setReportsModalVisible(true)}
                        className="flex-row items-center justify-between p-4 active:bg-secondary/40 gap-2"
                    >
                        <View className="flex-row items-center flex-1 mr-2 min-w-0">
                            <View className="h-9 w-9 rounded-xl bg-emerald-500/15 items-center justify-center mr-3 border border-emerald-500/30 flex-shrink-0">
                                <Feather name="pie-chart" size={16} color="#10B981" />
                            </View>
                            <View className="flex-1 min-w-0">
                                <Text className="text-sm font-bold text-foreground" numberOfLines={1}>
                                    Monthly Savings & Financial Statements
                                </Text>
                                <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                                    ROI breakdown, sharing earnings & exportable PDFs
                                </Text>
                            </View>
                        </View>
                        <Feather name="chevron-right" size={18} color="#9CA3AF" style={{ flexShrink: 0 }} />
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

            {/* --- MODAL: ASSET MANAGEMENT (US-04A CRUD) --- */}
            <Modal visible={assetModalVisible} transparent animationType="slide">
                <View className="flex-1 bg-black/60 justify-end">
                    <View className="rounded-t-[36px] bg-card border-t border-border p-6 max-h-[85%]">
                        <View className="flex-row items-center justify-between mb-4">
                            <View className="flex-row items-center">
                                <View className="h-10 w-10 rounded-2xl bg-sky-500/20 items-center justify-center mr-3 border border-sky-500/30">
                                    <MaterialCommunityIcons name="solar-panel" size={22} color="#0EA5E9" />
                                </View>
                                <View>
                                    <Text className="text-lg font-black text-foreground">
                                        {primaryAsset ? 'Update Solar Asset' : 'Register Solar Asset'}
                                    </Text>
                                    <Text className="text-xs text-muted-foreground">
                                        Hardware telemetry & co-op grid specs
                                    </Text>
                                </View>
                            </View>

                            <Pressable
                                onPress={() => setAssetModalVisible(false)}
                                className="h-8 w-8 rounded-full bg-secondary items-center justify-center active:opacity-70"
                            >
                                <Feather name="x" size={18} color="#9CA3AF" />
                            </Pressable>
                        </View>

                        <ScrollView className="gap-3.5" showsVerticalScrollIndicator={false}>
                            {/* System Name */}
                            <View>
                                <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                                    System / Array Name
                                </Text>
                                <View className="rounded-2xl bg-secondary/80 border border-border/80 px-4 py-2.5">
                                    <TextInput
                                        value={assetName}
                                        onChangeText={setAssetName}
                                        placeholder="e.g. Home Rooftop Solar Array"
                                        placeholderTextColor="#9CA3AF"
                                        className="text-sm font-bold text-foreground py-0.5"
                                    />
                                </View>
                            </View>

                            {/* Peak Capacity (kW) */}
                            <View>
                                <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                                    Peak Capacity (kWp)
                                </Text>
                                <View className="flex-row items-center rounded-2xl bg-secondary/80 border border-border/80 px-4 py-2.5">
                                    <TextInput
                                        keyboardType="numeric"
                                        value={assetCapacity}
                                        onChangeText={setAssetCapacity}
                                        placeholder="6.0"
                                        placeholderTextColor="#9CA3AF"
                                        className="flex-1 text-sm font-bold text-foreground py-0.5"
                                    />
                                    <Text className="text-xs font-bold text-amber-500 ml-2">kW</Text>
                                </View>
                            </View>

                            {/* Location */}
                            <View>
                                <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                                    Array Location
                                </Text>
                                <View className="rounded-2xl bg-secondary/80 border border-border/80 px-4 py-2.5">
                                    <TextInput
                                        value={assetLocation}
                                        onChangeText={setAssetLocation}
                                        placeholder="e.g. Main Roof, Garage, Ground Mount"
                                        placeholderTextColor="#9CA3AF"
                                        className="text-sm font-bold text-foreground py-0.5"
                                    />
                                </View>
                            </View>

                            {/* Asset Type */}
                            <View>
                                <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                                    Hardware Category
                                </Text>
                                <View className="flex-row gap-2">
                                    {[
                                        { id: 'solar_panel', label: 'Solar Panels' },
                                        { id: 'hybrid_inverter', label: 'Hybrid Inverter' },
                                        { id: 'battery_storage', label: 'Battery Storage' },
                                    ].map((cat) => (
                                        <Pressable
                                            key={cat.id}
                                            onPress={() => setAssetType(cat.id)}
                                            className={`flex-1 py-2 rounded-xl items-center border ${
                                                assetType === cat.id
                                                    ? 'bg-sky-500/20 border-sky-500'
                                                    : 'bg-secondary/60 border-border/60'
                                            }`}
                                        >
                                            <Text
                                                className={`text-[11px] font-bold ${
                                                    assetType === cat.id ? 'text-sky-500 font-black' : 'text-muted-foreground'
                                                }`}
                                            >
                                                {cat.label}
                                            </Text>
                                        </Pressable>
                                    ))}
                                </View>
                            </View>

                            {/* Save Button */}
                            <Pressable
                                onPress={handleSaveAsset}
                                disabled={isSavingAsset}
                                className="w-full rounded-2xl bg-primary py-4 items-center justify-center shadow-lg active:opacity-90 mt-3 mb-2"
                            >
                                <Text className="text-base font-black text-primary-foreground">
                                    {isSavingAsset ? 'Saving to Database...' : primaryAsset ? 'Update System Telemetry' : 'Register Solar Asset'}
                                </Text>
                            </Pressable>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* --- MODAL: SOLAR PREDICTION & FORECAST SCREEN --- */}
            <Modal visible={predictionModalVisible} animationType="slide">
                <SolarOwnerPrediction onBack={() => setPredictionModalVisible(false)} />
            </Modal>

            {/* --- MODAL: FINANCIAL SAVINGS & REPORTS SCREEN --- */}
            <Modal visible={reportsModalVisible} animationType="slide">
                <SolarOwnerReports onBack={() => setReportsModalVisible(false)} />
            </Modal>
        </View>
    );
};

export default SolarOwnerMenu;
