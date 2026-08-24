import TabScreenBackground from '@/components/shared/TabScreenBackground';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SolarToast } from '../shared/SolarToast';
import { ViewHeader } from '../shared/ViewHeader';
import { useSolarOwnerStore } from '../store/useSolarOwnerStore';
import { AlertCategory } from '../types/solarOwner.types';

export const SolarOwnerAlerts = () => {
    const {
        alerts,
        markAlertAsRead,
        markAllAlertsAsRead,
        dismissAlert,
        setActiveView,
    } = useSolarOwnerStore();

    const [selectedCategory, setSelectedCategory] = useState<AlertCategory>('all');

    const filteredAlerts = alerts.filter((alert) => {
        if (selectedCategory === 'all') return true;
        return alert.category === selectedCategory;
    });

    const unreadCount = alerts.filter((a) => !a.isRead).length;

    const getSeverityBadge = (severity: string) => {
        switch (severity) {
            case 'critical':
                return { bg: 'bg-destructive/20 border-destructive/40', text: 'text-destructive', label: 'Urgent' };
            case 'warning':
                return { bg: 'bg-amber-500/20 border-amber-500/40', text: 'text-amber-500', label: 'Warning' };
            case 'success':
                return { bg: 'bg-emerald-500/20 border-emerald-500/40', text: 'text-emerald-500', label: 'Optimal' };
            case 'info':
            default:
                return { bg: 'bg-sky-500/20 border-sky-500/40', text: 'text-sky-500', label: 'Update' };
        }
    };

    const handleAction = (alert: any) => {
        markAlertAsRead(alert.id);
        if (alert.actionType === 'view_request') {
            setActiveView('sharing');
        } else if (alert.actionType === 'view_battery') {
            setActiveView('energy');
        } else if (alert.actionType === 'check_inverter') {
            setActiveView('menu');
        }
    };

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
                    title="Alerts & Notices"
                    subtitle="System warnings, energy requests & maintenance"
                    showBack={false}
                />

                {/* Top Status & Mark All Read */}
                <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center">
                        <View className="h-3 w-3 rounded-full bg-amber-500 mr-2" />
                        <Text className="text-xs font-bold text-foreground">
                            {unreadCount} Unread Alert{unreadCount === 1 ? '' : 's'}
                        </Text>
                    </View>

                    {unreadCount > 0 && (
                        <Pressable
                            onPress={markAllAlertsAsRead}
                            className="px-3 py-1.5 rounded-xl bg-secondary border border-border/70 active:opacity-80"
                        >
                            <Text className="text-[11px] font-bold text-primary">
                                Mark all as read
                            </Text>
                        </Pressable>
                    )}
                </View>

                {/* Category Filter Pills */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mb-5 -mx-5 px-5"
                >
                    <View className="flex-row gap-2">
                        {[
                            { id: 'all', label: 'All Alerts' },
                            { id: 'requests', label: '⚡ Requests' },
                            { id: 'battery', label: '🔋 Battery' },
                            { id: 'maintenance', label: '🛠️ Maintenance' },
                            { id: 'system', label: '🌐 System' },
                        ].map((cat) => (
                            <Pressable
                                key={cat.id}
                                onPress={() => setSelectedCategory(cat.id as AlertCategory)}
                                className={`px-4 py-2 rounded-2xl border ${
                                    selectedCategory === cat.id
                                        ? 'bg-primary border-primary'
                                        : 'bg-card/90 border-border/70'
                                }`}
                            >
                                <Text
                                    className={`text-xs font-bold ${
                                        selectedCategory === cat.id
                                            ? 'text-primary-foreground'
                                            : 'text-foreground'
                                    }`}
                                >
                                    {cat.label}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </ScrollView>

                {/* Alerts List */}
                <View className="gap-3 mb-6">
                    {filteredAlerts.length === 0 ? (
                        <View className="rounded-[28px] border border-border/70 bg-card/60 p-8 items-center justify-center">
                            <Feather name="check-circle" size={32} color="#10B981" />
                            <Text className="text-sm font-bold text-foreground mt-3">
                                No alerts in this category
                            </Text>
                            <Text className="text-xs text-muted-foreground mt-0.5 text-center">
                                Your solar system and battery are operating smoothly.
                            </Text>
                        </View>
                    ) : (
                        filteredAlerts.map((item) => {
                            const badge = getSeverityBadge(item.severity);

                            return (
                                <View
                                    key={item.id}
                                    className={`rounded-[24px] border p-4.5 shadow-sm ${
                                        !item.isRead
                                            ? 'bg-card border-primary/40 dark:bg-card/70'
                                            : 'bg-card/60 border-border/50'
                                    }`}
                                >
                                    {/* Alert Top Row */}
                                    <View className="flex-row items-center justify-between mb-2">
                                        <View className="flex-row items-center flex-1 mr-2">
                                            {!item.isRead && (
                                                <View className="h-2 w-2 rounded-full bg-primary mr-2" />
                                            )}
                                            <View className={`px-2.5 py-0.5 rounded-full border ${badge.bg}`}>
                                                <Text className={`text-[10px] font-black uppercase ${badge.text}`}>
                                                    {badge.label}
                                                </Text>
                                            </View>
                                        </View>

                                        <Text className="text-[10px] font-semibold text-muted-foreground">
                                            {item.timestamp}
                                        </Text>
                                    </View>

                                    {/* Alert Content */}
                                    <Text className="text-sm font-bold text-foreground mb-1">
                                        {item.title}
                                    </Text>
                                    <Text className="text-xs text-muted-foreground leading-relaxed mb-3">
                                        {item.message}
                                    </Text>

                                    {/* Action Buttons */}
                                    <View className="flex-row items-center justify-between pt-2 border-t border-border/40">
                                        {item.actionLabel ? (
                                            <Pressable
                                                onPress={() => handleAction(item)}
                                                className="px-3.5 py-1.5 rounded-xl bg-primary/20 border border-primary/30 active:opacity-80"
                                            >
                                                <Text className="text-xs font-bold text-primary">
                                                    {item.actionLabel}
                                                </Text>
                                            </Pressable>
                                        ) : <View />}

                                        <Pressable
                                            onPress={() => dismissAlert(item.id)}
                                            className="px-3 py-1.5 active:opacity-70"
                                        >
                                            <Text className="text-xs font-semibold text-muted-foreground">
                                                Dismiss
                                            </Text>
                                        </Pressable>
                                    </View>
                                </View>
                            );
                        })
                    )}
                </View>
            </ScrollView>
        </View>
    );
};

export default SolarOwnerAlerts;
