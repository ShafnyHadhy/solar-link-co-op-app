import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSolarOwnerStore } from '../store/useSolarOwnerStore';
import { AlertCategory } from '../types/solarOwner.types';

interface SolarOwnerAlertsModalProps {
    visible: boolean;
    onClose: () => void;
    onNavigateToShare?: () => void;
}

export const SolarOwnerAlertsModal: React.FC<SolarOwnerAlertsModalProps> = ({
    visible,
    onClose,
    onNavigateToShare,
}) => {
    const { alerts, markAlertAsRead, markAllAlertsAsRead, dismissAlert } = useSolarOwnerStore();
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
                return { bg: 'bg-sky-500/20 border-sky-500/40', text: 'text-sky-500', label: 'Notice' };
        }
    };

    const handleAction = (alert: any) => {
        markAlertAsRead(alert.id);
        if (alert.actionType === 'view_request' && onNavigateToShare) {
            onClose();
            onNavigateToShare();
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View className="flex-1 bg-black/60 justify-end">
                <View className="rounded-t-[36px] bg-card border-t border-border p-6 max-h-[85%]">
                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center">
                            <View className="h-10 w-10 rounded-2xl bg-amber-500/20 items-center justify-center mr-3 border border-amber-500/30">
                                <Feather name="bell" size={20} color="#F59E0B" />
                            </View>
                            <View>
                                <Text className="text-xl font-black text-foreground">
                                    Alerts & Notifications
                                </Text>
                                <Text className="text-xs text-muted-foreground font-medium">
                                    {unreadCount} unread update{unreadCount === 1 ? '' : 's'}
                                </Text>
                            </View>
                        </View>

                        <Pressable
                            onPress={onClose}
                            className="h-9 w-9 rounded-full bg-secondary items-center justify-center active:opacity-70"
                        >
                            <Feather name="x" size={18} color="#9CA3AF" />
                        </Pressable>
                    </View>

                    {/* Mark all as read action */}
                    {unreadCount > 0 && (
                        <View className="flex-row justify-end mb-3">
                            <Pressable onPress={markAllAlertsAsRead} className="px-2 py-1">
                                <Text className="text-xs font-bold text-primary">
                                    Mark all as read
                                </Text>
                            </Pressable>
                        </View>
                    )}

                    {/* Category Filter Tabs */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="mb-4 -mx-6 px-6"
                    >
                        <View className="flex-row gap-2">
                            {[
                                { id: 'all', label: 'All' },
                                { id: 'requests', label: '⚡ Requests' },
                                { id: 'battery', label: '🔋 Battery' },
                                { id: 'maintenance', label: '🛠️ Maintenance' },
                                { id: 'system', label: '🌐 System' },
                            ].map((cat) => (
                                <Pressable
                                    key={cat.id}
                                    onPress={() => setSelectedCategory(cat.id as AlertCategory)}
                                    className={`px-3.5 py-1.5 rounded-xl border ${
                                        selectedCategory === cat.id
                                            ? 'bg-primary border-primary'
                                            : 'bg-secondary/70 border-border/60'
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
                    <ScrollView className="gap-3 mb-4" showsVerticalScrollIndicator={false}>
                        {filteredAlerts.length === 0 ? (
                            <View className="p-8 items-center justify-center">
                                <Feather name="check-circle" size={32} color="#10B981" />
                                <Text className="text-sm font-bold text-foreground mt-3">
                                    No alerts in this category
                                </Text>
                                <Text className="text-xs text-muted-foreground mt-1 text-center">
                                    Your rooftop solar and battery are operating smoothly.
                                </Text>
                            </View>
                        ) : (
                            filteredAlerts.map((item) => {
                                const badge = getSeverityBadge(item.severity);

                                return (
                                    <View
                                        key={item.id}
                                        className={`rounded-2xl border p-4 mb-2.5 ${
                                            !item.isRead
                                                ? 'bg-card border-primary/40'
                                                : 'bg-secondary/30 border-border/40'
                                        }`}
                                    >
                                        <View className="flex-row items-center justify-between mb-1.5">
                                            <View className="flex-row items-center flex-1 mr-2">
                                                {!item.isRead && (
                                                    <View className="h-2 w-2 rounded-full bg-primary mr-1.5" />
                                                )}
                                                <View className={`px-2 py-0.5 rounded-full border ${badge.bg}`}>
                                                    <Text className={`text-[9px] font-black uppercase ${badge.text}`}>
                                                        {badge.label}
                                                    </Text>
                                                </View>
                                            </View>
                                            <Text className="text-[10px] font-medium text-muted-foreground">
                                                {item.timestamp}
                                            </Text>
                                        </View>

                                        <Text className="text-xs font-bold text-foreground mb-1">
                                            {item.title}
                                        </Text>
                                        <Text className="text-[11px] text-muted-foreground leading-relaxed mb-2.5">
                                            {item.message}
                                        </Text>

                                        <View className="flex-row items-center justify-between pt-2 border-t border-border/30">
                                            {item.actionLabel ? (
                                                <Pressable
                                                    onPress={() => handleAction(item)}
                                                    className="px-3 py-1 rounded-lg bg-primary/20 border border-primary/30 active:opacity-80"
                                                >
                                                    <Text className="text-[11px] font-bold text-primary">
                                                        {item.actionLabel}
                                                    </Text>
                                                </Pressable>
                                            ) : <View />}

                                            <Pressable
                                                onPress={() => dismissAlert(item.id)}
                                                className="px-2 py-1 active:opacity-70"
                                            >
                                                <Text className="text-[11px] font-semibold text-muted-foreground">
                                                    Dismiss
                                                </Text>
                                            </Pressable>
                                        </View>
                                    </View>
                                );
                            })
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};
