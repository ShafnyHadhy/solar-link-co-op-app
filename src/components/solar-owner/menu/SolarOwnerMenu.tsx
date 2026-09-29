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
        serviceTickets,
        submitMaintenanceTicketAction,
    } = useSolarOwnerStore();

    const [tipsModalVisible, setTipsModalVisible] = useState(false);
    const [maintenanceModalVisible, setMaintenanceModalVisible] = useState(false);
    const [hardwareModalVisible, setHardwareModalVisible] = useState(false);
    const [assetModalVisible, setAssetModalVisible] = useState(false);
    const [predictionModalVisible, setPredictionModalVisible] = useState(false);
    const [reportsModalVisible, setReportsModalVisible] = useState(false);

    // Maintenance ticket form state
    const [isCreatingTicket, setIsCreatingTicket] = useState(false);
    const [ticketCategory, setTicketCategory] = useState<'inverter' | 'generation' | 'cleaning' | 'wiring'>('inverter');
    const [ticketTitle, setTicketTitle] = useState('Inverter Failure & Warning Light');
    const [ticketPriority, setTicketPriority] = useState<'critical' | 'high' | 'medium' | 'low'>('critical');
    const [ticketNotes, setTicketNotes] = useState('');
    const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

    const handleSelectCategory = (cat: 'inverter' | 'generation' | 'cleaning' | 'wiring') => {
        setTicketCategory(cat);
        if (cat === 'inverter') {
            setTicketTitle('Inverter Failure & Warning Light');
            setTicketPriority('critical');
        } else if (cat === 'generation') {
            setTicketTitle('Low Energy Generation / Output Drop');
            setTicketPriority('high');
        } else if (cat === 'cleaning') {
            setTicketTitle('Solar Panel Dusting & Surface Cleaning');
            setTicketPriority('low');
        } else if (cat === 'wiring') {
            setTicketTitle('Electrical Wiring & Fan Inspection');
            setTicketPriority('medium');
        }
    };

    const handleSubmitTicket = async () => {
        if (!user?.id) {
            showToast('Please sign in to submit a service request', 'warning');
            return;
        }
        setIsSubmittingTicket(true);
        const success = await submitMaintenanceTicketAction({
            reportedBy: user.id,
            title: ticketTitle,
            description: ticketNotes.trim() || `Automated request: ${ticketTitle} reported by solar owner for ${primaryAsset?.name || 'Home Rooftop Solar Array'}.`,
            priority: ticketPriority,
            assetId: primaryAsset?.id,
            systemName: primaryAsset?.name || 'Home Rooftop Solar Array',
            location: primaryAsset?.location || 'Main Roof',
        });
        setIsSubmittingTicket(false);
        if (success) {
            setTicketNotes('');
            setIsCreatingTicket(false);
        }
    };


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
                        className="flex-row items-center p-4 active:bg-red-500/10"
                    >
                        <View className="h-10 w-10 rounded-xl bg-red-500/20 items-center justify-center mr-3 border border-red-500/40">
                            <Feather name="log-out" size={18} color="#EF4444" />
                        </View>
                        <View>
                            <Text className="text-base font-black text-red-500 dark:text-red-400">
                                Sign Out of Solar-Link
                            </Text>
                            <Text className="text-xs text-red-500/80 font-medium">
                                Log out of your solar owner session
                            </Text>
                        </View>
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

            {/* --- MODAL: MAINTENANCE & TECHNICIAN DISPATCH --- */}
            <Modal visible={maintenanceModalVisible} transparent animationType="slide">
                <View className="flex-1 bg-black/60 justify-end">
                    <View className="rounded-t-[36px] bg-card border-t border-border p-6 max-h-[88%]">
                        {/* Header */}
                        <View className="flex-row items-center justify-between mb-4">
                            <View className="flex-1 mr-2">
                                <View className="flex-row items-center gap-2">
                                    {isCreatingTicket && (
                                        <Pressable
                                            onPress={() => setIsCreatingTicket(false)}
                                            className="h-8 w-8 rounded-full bg-secondary items-center justify-center mr-1"
                                        >
                                            <Feather name="arrow-left" size={16} color="#9CA3AF" />
                                        </Pressable>
                                    )}
                                    <Text className="text-lg font-black text-foreground">
                                        {isCreatingTicket ? 'Request Technician Service' : 'System Health & Maintenance'}
                                    </Text>
                                </View>
                                <Text className="text-xs text-muted-foreground mt-0.5">
                                    {isCreatingTicket
                                        ? 'Dispatch request to field technician Azmil Ahamed'
                                        : 'Telemetry diagnostics & cooperative service tickets'}
                                </Text>
                            </View>
                            <Pressable
                                onPress={() => {
                                    setMaintenanceModalVisible(false);
                                    setIsCreatingTicket(false);
                                }}
                                className="h-8 w-8 rounded-full bg-secondary items-center justify-center flex-shrink-0"
                            >
                                <Feather name="x" size={18} color="#9CA3AF" />
                            </Pressable>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} className="gap-4">
                            {isCreatingTicket ? (
                                /* ── FORM: CREATE SERVICE TICKET ── */
                                <View className="gap-4 pb-4">
                                    {/* Technician Dispatch Info Banner */}
                                    <View className="rounded-2xl bg-sky-500/10 border border-sky-500/30 p-3.5 flex-row items-center gap-3">
                                        <View className="h-10 w-10 rounded-xl bg-sky-500/20 items-center justify-center border border-sky-500/30">
                                            <MaterialCommunityIcons name="account-wrench" size={22} color="#0EA5E9" />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-xs font-bold text-sky-500">
                                                Assigned Technician: Azmil Ahamed
                                            </Text>
                                            <Text className="text-[11px] text-muted-foreground mt-0.5">
                                                Certified Microgrid Specialist • Direct On-Site Dispatch
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Issue Type Chips */}
                                    <View>
                                        <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                                            Select Issue Category
                                        </Text>
                                        <View className="flex-row flex-wrap gap-2">
                                            {[
                                                { id: 'inverter', label: '⚡ Inverter Alarm / Tripped', defPri: 'critical' },
                                                { id: 'generation', label: '📉 Severe Output Drop', defPri: 'high' },
                                                { id: 'cleaning', label: '🧹 Panel Dust Cleaning', defPri: 'low' },
                                                { id: 'wiring', label: '🔌 Wiring & Electrical', defPri: 'medium' },
                                            ].map((cat) => (
                                                <Pressable
                                                    key={cat.id}
                                                    onPress={() => handleSelectCategory(cat.id as any)}
                                                    className={`px-3 py-2 rounded-xl border ${
                                                        ticketCategory === cat.id
                                                            ? 'bg-primary/20 border-primary'
                                                            : 'bg-secondary/60 border-border/60'
                                                    }`}
                                                >
                                                    <Text
                                                        className={`text-xs font-bold ${
                                                            ticketCategory === cat.id
                                                                ? 'text-primary font-black'
                                                                : 'text-muted-foreground'
                                                        }`}
                                                    >
                                                        {cat.label}
                                                    </Text>
                                                </Pressable>
                                            ))}
                                        </View>
                                    </View>

                                    {/* Issue Title */}
                                    <View>
                                        <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                                            Ticket Summary
                                        </Text>
                                        <View className="rounded-2xl bg-secondary/80 border border-border/80 px-4 py-2.5">
                                            <TextInput
                                                value={ticketTitle}
                                                onChangeText={setTicketTitle}
                                                placeholder="e.g. Inverter Failure & Warning Light"
                                                placeholderTextColor="#9CA3AF"
                                                className="text-sm font-bold text-foreground py-0.5"
                                            />
                                        </View>
                                    </View>

                                    {/* Urgency / Priority */}
                                    <View>
                                        <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                                            Urgency & System Impact
                                        </Text>
                                        <View className="flex-row gap-2">
                                            {[
                                                { id: 'critical', label: '🔴 Critical (0 kW Offline)', bg: 'bg-red-500/20 border-red-500 text-red-500' },
                                                { id: 'high', label: '🟡 Warning (Degraded)', bg: 'bg-amber-500/20 border-amber-500 text-amber-500' },
                                                { id: 'low', label: '🟢 Routine Service', bg: 'bg-emerald-500/20 border-emerald-500 text-emerald-500' },
                                            ].map((p) => (
                                                <Pressable
                                                    key={p.id}
                                                    onPress={() => setTicketPriority(p.id as any)}
                                                    className={`flex-1 py-2.5 rounded-xl items-center border ${
                                                        ticketPriority === p.id
                                                            ? p.bg
                                                            : 'bg-secondary/60 border-border/60'
                                                    }`}
                                                >
                                                    <Text
                                                        className={`text-[11px] font-bold text-center ${
                                                            ticketPriority === p.id ? 'font-black' : 'text-muted-foreground'
                                                        }`}
                                                    >
                                                        {p.label}
                                                    </Text>
                                                </Pressable>
                                            ))}
                                        </View>
                                    </View>

                                    {/* Hardware Array Details */}
                                    <View className="rounded-2xl bg-secondary/40 p-3.5 border border-border/60">
                                        <Text className="text-[10px] uppercase font-bold text-muted-foreground mb-1">
                                            Target Array & Location
                                        </Text>
                                        <Text className="text-xs font-bold text-foreground">
                                            {primaryAsset?.name || 'Home Rooftop Solar Array'}
                                        </Text>
                                        <Text className="text-[11px] text-muted-foreground mt-0.5">
                                            Location: {primaryAsset?.location || 'Main Roof'} • Capacity: {primaryAsset?.capacityKw || '6.0'} kWp
                                        </Text>
                                    </View>

                                    {/* Problem Description Notes */}
                                    <View>
                                        <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                                            Detailed Notes / Symptoms (Optional)
                                        </Text>
                                        <View className="rounded-2xl bg-secondary/80 border border-border/80 px-4 py-3 min-h-[80px]">
                                            <TextInput
                                                multiline
                                                numberOfLines={3}
                                                value={ticketNotes}
                                                onChangeText={setTicketNotes}
                                                placeholder="Describe what happened (e.g. Inverter red light blinking after rainfall, zero output on grid)..."
                                                placeholderTextColor="#9CA3AF"
                                                className="text-xs text-foreground py-0.5 leading-relaxed"
                                                textAlignVertical="top"
                                            />
                                        </View>
                                    </View>

                                    {/* Submit Button */}
                                    <Pressable
                                        onPress={handleSubmitTicket}
                                        disabled={isSubmittingTicket}
                                        className="w-full rounded-2xl bg-primary py-4 items-center justify-center shadow-lg active:opacity-90 mt-2"
                                    >
                                        <Text className="text-sm font-black text-primary-foreground">
                                            {isSubmittingTicket ? 'Dispatching to Azmil Ahamed...' : 'Submit Request to Technician Azmil'}
                                        </Text>
                                    </Pressable>
                                </View>
                            ) : (
                                /* ── DIAGNOSTICS & TICKETS SUMMARY ── */
                                <View className="gap-4 pb-4">
                                    {/* Health Status Banner */}
                                    <View className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4">
                                        <View className="flex-row items-center justify-between">
                                            <Text className="text-xs font-black text-emerald-500 uppercase tracking-wide">
                                                Hardware Health: Optimal (100%)
                                            </Text>
                                            <View className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                        </View>
                                        <Text className="text-xs text-muted-foreground mt-1">
                                            Inverter efficiency at 98.4%. PV cell telemetry is balanced and connected to the microgrid.
                                        </Text>
                                    </View>

                                    {/* Technician Contact Card */}
                                    <View className="rounded-2xl bg-secondary/40 border border-border/60 p-3.5 flex-row items-center justify-between">
                                        <View className="flex-row items-center flex-1 mr-2">
                                            <View className="h-10 w-10 rounded-xl bg-primary/15 items-center justify-center mr-3 border border-primary/30">
                                                <MaterialCommunityIcons name="account-wrench" size={22} color="#0EA5E9" />
                                            </View>
                                            <View className="flex-1">
                                                <Text className="text-xs font-bold text-foreground">
                                                    Azmil Ahamed (Lead Technician)
                                                </Text>
                                                <Text className="text-[11px] text-emerald-500 font-medium mt-0.5">
                                                    ● Available • Cooperative On-Call Service
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    {/* Telemetry Metrics Grid */}
                                    <View className="rounded-2xl bg-secondary/30 border border-border/50 divide-y divide-border/40 px-4">
                                        <View className="py-2.5 flex-row justify-between items-center">
                                            <Text className="text-xs text-muted-foreground">Last Full Inspection</Text>
                                            <Text className="text-xs font-bold text-foreground">{hardware.lastServiceDate}</Text>
                                        </View>
                                        <View className="py-2.5 flex-row justify-between items-center">
                                            <Text className="text-xs text-muted-foreground">Next Scheduled Service</Text>
                                            <Text className="text-xs font-bold text-foreground">{hardware.nextServiceDue}</Text>
                                        </View>
                                        <View className="py-2.5 flex-row justify-between items-center">
                                            <Text className="text-xs text-muted-foreground">Panel Dust Index</Text>
                                            <Text className="text-xs font-bold text-amber-500">Low (98.2% output)</Text>
                                        </View>
                                    </View>

                                    {/* Request Service CTA Button */}
                                    <Pressable
                                        onPress={() => setIsCreatingTicket(true)}
                                        className="w-full rounded-2xl bg-emerald-600 dark:bg-emerald-600 py-3.5 items-center justify-center shadow-md active:bg-emerald-700 flex-row gap-2"
                                    >
                                        <Feather name="tool" size={16} color="#FFFFFF" />
                                        <Text className="text-sm font-black text-white">
                                            Request Technician Service / Report Fault
                                        </Text>
                                    </Pressable>

                                    {/* Service Tickets History */}
                                    <View className="mt-2">
                                        <View className="flex-row items-center justify-between mb-2">
                                            <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                                My Service Tickets ({serviceTickets.length})
                                            </Text>
                                            <Text className="text-[11px] text-muted-foreground">
                                                Assigned to Azmil
                                            </Text>
                                        </View>

                                        {serviceTickets.length === 0 ? (
                                            <View className="p-4 rounded-2xl bg-secondary/30 border border-border/40 items-center">
                                                <Text className="text-xs text-muted-foreground">
                                                    No service tickets logged. System is operating normally.
                                                </Text>
                                            </View>
                                        ) : (
                                            <View className="gap-2.5">
                                                {serviceTickets.map((ticket) => (
                                                    <View
                                                        key={ticket.id}
                                                        className="rounded-2xl border border-border/60 bg-secondary/40 p-3.5"
                                                    >
                                                        <View className="flex-row items-center justify-between mb-1">
                                                            <View className="flex-row items-center gap-2">
                                                                <View className="px-2 py-0.5 rounded-md bg-secondary border border-border/60">
                                                                    <Text className="text-[10px] font-black text-foreground">
                                                                        {ticket.id}
                                                                    </Text>
                                                                </View>
                                                                <View
                                                                    className={`px-2 py-0.5 rounded-md ${
                                                                        ticket.priority === 'critical'
                                                                            ? 'bg-red-500/20 border border-red-500/40'
                                                                            : ticket.priority === 'high'
                                                                            ? 'bg-amber-500/20 border border-amber-500/40'
                                                                            : 'bg-emerald-500/20 border border-emerald-500/40'
                                                                    }`}
                                                                >
                                                                    <Text
                                                                        className={`text-[9px] font-black uppercase ${
                                                                            ticket.priority === 'critical'
                                                                                ? 'text-red-500'
                                                                                : ticket.priority === 'high'
                                                                                ? 'text-amber-500'
                                                                                : 'text-emerald-500'
                                                                        }`}
                                                                    >
                                                                        {ticket.priority}
                                                                    </Text>
                                                                </View>
                                                            </View>
                                                            <View
                                                                className={`px-2 py-0.5 rounded-full ${
                                                                    ticket.status === 'resolved'
                                                                        ? 'bg-emerald-500/20'
                                                                        : ticket.status === 'in_progress'
                                                                        ? 'bg-blue-500/20'
                                                                        : 'bg-amber-500/20'
                                                                }`}
                                                            >
                                                                <Text
                                                                    className={`text-[10px] font-extrabold uppercase ${
                                                                        ticket.status === 'resolved'
                                                                            ? 'text-emerald-500'
                                                                            : ticket.status === 'in_progress'
                                                                            ? 'text-blue-500'
                                                                            : 'text-amber-500'
                                                                    }`}
                                                                >
                                                                    {ticket.status}
                                                                </Text>
                                                            </View>
                                                        </View>

                                                        <Text className="text-xs font-bold text-foreground mt-1">
                                                            {ticket.title}
                                                        </Text>
                                                        {ticket.description ? (
                                                            <Text
                                                                className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed"
                                                                numberOfLines={2}
                                                            >
                                                                {ticket.description}
                                                            </Text>
                                                        ) : null}

                                                        <View className="flex-row items-center justify-between mt-2 pt-2 border-t border-border/30">
                                                            <Text className="text-[10px] text-muted-foreground">
                                                                Tech: {ticket.technicianName || 'Azmil Ahamed'}
                                                            </Text>
                                                            <Text className="text-[10px] text-muted-foreground">
                                                                {ticket.createdAt || 'Recent'}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                </View>
                            )}
                        </ScrollView>
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
