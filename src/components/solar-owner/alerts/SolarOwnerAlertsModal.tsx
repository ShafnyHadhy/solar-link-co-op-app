import { Feather } from '@expo/vector-icons';
import { useNotifications } from '@/hooks/useNotifications';
import React, { useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSolarOwnerStore } from '../store/useSolarOwnerStore';

type ModalCategory = 'all' | 'requests' | 'energy' | 'maintenance' | 'system';

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
    const {
        notifications,
        unreadCount,
        markingReadId,
        isMarkingAllRead,
        markAsRead,
        markAllAsRead,
    } = useNotifications();
    const { notificationsEnabled, showToast } = useSolarOwnerStore();
    const [selectedCategory, setSelectedCategory] = useState<ModalCategory>('all');

    const handleMarkAsRead = async (id: string) => {
        try {
            await markAsRead(id);
        } catch (err: any) {
            showToast(err?.message || 'Failed to mark notification as read', 'warning');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
            showToast('All notifications marked as read', 'info');
        } catch (err: any) {
            showToast(err?.message || 'Failed to mark all as read', 'warning');
        }
    };

    // Filter notifications respecting user's active notification toggles
    const activeNotifications = notifications.filter((item) => {
        if (item.type === 'request' && !notificationsEnabled.energyRequests) return false;
        if (item.type === 'energy' && !notificationsEnabled.lowBattery) return false;
        if (item.type === 'maintenance' && !notificationsEnabled.maintenanceReminders) return false;
        return true;
    });

    const filteredNotifications = activeNotifications.filter((item) => {
        if (selectedCategory === 'all') return true;
        if (selectedCategory === 'requests') return item.type === 'request';
        if (selectedCategory === 'energy') return item.type === 'energy';
        if (selectedCategory === 'maintenance') return item.type === 'maintenance';
        if (selectedCategory === 'system') return item.type === 'system' || item.type === 'announcement';
        return true;
    });

    const getBadgeStyle = (type: string) => {
        switch (type) {
            case 'energy':
                return { bg: 'bg-emerald-500/20 border-emerald-500/40', text: 'text-emerald-500', label: 'Energy' };
            case 'maintenance':
                return { bg: 'bg-amber-500/20 border-amber-500/40', text: 'text-amber-500', label: 'Maintenance' };
            case 'request':
                return { bg: 'bg-sky-500/20 border-sky-500/40', text: 'text-sky-500', label: 'Request' };
            case 'announcement':
                return { bg: 'bg-indigo-500/20 border-indigo-500/40', text: 'text-indigo-500', label: 'Notice' };
            case 'system':
            default:
                return { bg: 'bg-purple-500/20 border-purple-500/40', text: 'text-purple-500', label: 'System' };
        }
    };

    const formatTimestamp = (createdAt: string | Date) => {
        try {
            const date = new Date(createdAt);
            if (isNaN(date.getTime())) return 'Recently';

            const now = new Date();
            const diffMs = now.getTime() - date.getTime();
            const diffMins = Math.floor(diffMs / 60000);

            if (diffMins < 1) return 'Just now';
            if (diffMins < 60) return `${diffMins}m ago`;

            const diffHours = Math.floor(diffMins / 60);
            if (diffHours < 24) return `${diffHours}h ago`;

            const diffDays = Math.floor(diffHours / 24);
            if (diffDays === 1) return 'Yesterday';
            if (diffDays < 7) return `${diffDays}d ago`;

            return date.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return 'Recently';
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
                            <Pressable
                                onPress={handleMarkAllAsRead}
                                disabled={isMarkingAllRead}
                                className="px-2.5 py-1 rounded-lg bg-secondary border border-border/60 flex-row items-center active:opacity-80"
                            >
                                {isMarkingAllRead ? (
                                    <View className="flex-row items-center gap-1">
                                        <ActivityIndicator size="small" color="#F59E0B" />
                                        <Text className="text-xs font-bold text-primary">
                                            Marking...
                                        </Text>
                                    </View>
                                ) : (
                                    <Text className="text-xs font-bold text-primary">
                                        Mark all as read
                                    </Text>
                                )}
                            </Pressable>
                        </View>
                    )}

                    {/* Category Filter Tabs */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: 8, paddingBottom: 14 }}
                    >
                        {[
                            { id: 'all', label: 'All', icon: 'bell' },
                            { id: 'requests', label: 'Requests', icon: 'zap' },
                            { id: 'energy', label: 'Energy', icon: 'battery-charging' },
                            { id: 'maintenance', label: 'Maintenance', icon: 'tool' },
                            { id: 'system', label: 'System', icon: 'activity' },
                        ].map((cat) => {
                            const isSelected = selectedCategory === cat.id;
                            return (
                                <Pressable
                                    key={cat.id}
                                    onPress={() => setSelectedCategory(cat.id as ModalCategory)}
                                    className={`flex-row items-center px-3.5 py-1.5 rounded-xl border ${
                                        isSelected
                                            ? 'bg-primary border-primary'
                                            : 'bg-secondary/60 border-border/70 active:bg-secondary'
                                    }`}
                                >
                                    <Feather
                                        name={cat.icon as any}
                                        size={12}
                                        color={isSelected ? '#FFFFFF' : '#9CA3AF'}
                                    />
                                    <Text
                                        className={`text-xs font-bold ml-1.5 ${
                                            isSelected ? 'text-primary-foreground font-black' : 'text-muted-foreground'
                                        }`}
                                    >
                                        {cat.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </ScrollView>

                    {/* Alerts List */}
                    <ScrollView className="gap-3 mb-4" showsVerticalScrollIndicator={false}>
                        {filteredNotifications.length === 0 ? (
                            <View className="p-8 items-center justify-center">
                                <Feather name="check-circle" size={32} color="#10B981" />
                                <Text className="text-sm font-bold text-foreground mt-3">
                                    No alerts in this category
                                </Text>
                                <Text className="text-xs text-muted-foreground mt-1 text-center">
                                    Your system and notifications are all caught up.
                                </Text>
                            </View>
                        ) : (
                            filteredNotifications.map((item) => {
                                const badge = getBadgeStyle(item.type);

                                return (
                                    <Pressable
                                        key={item.id}
                                        onPress={() => {
                                            if (!item.isRead && markingReadId !== item.id) {
                                                handleMarkAsRead(item.id);
                                            }
                                        }}
                                        style={{ padding: 16 }}
                                        className={`rounded-2xl border p-4 mb-2.5 ${
                                            !item.isRead
                                                ? 'bg-card border-primary/50'
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
                                                {formatTimestamp(item.createdAt)}
                                            </Text>
                                        </View>

                                        <Text className="text-xs font-bold text-foreground mb-1">
                                            {item.title}
                                        </Text>
                                        <Text className="text-[11px] text-muted-foreground leading-relaxed mb-2.5">
                                            {item.message}
                                        </Text>

                                        {!item.isRead && (
                                            <View className="flex-row items-center justify-end pt-2 border-t border-border/30">
                                                <Pressable
                                                    onPress={() => handleMarkAsRead(item.id)}
                                                    disabled={markingReadId === item.id}
                                                    className="px-3 py-1 rounded-lg bg-primary/20 border border-primary/30 active:opacity-80 flex-row items-center"
                                                >
                                                    {markingReadId === item.id ? (
                                                        <View className="flex-row items-center gap-1">
                                                            <ActivityIndicator size="small" color="#F59E0B" />
                                                            <Text className="text-[11px] font-bold text-primary">
                                                                Saving...
                                                            </Text>
                                                        </View>
                                                    ) : (
                                                        <Text className="text-[11px] font-bold text-primary">
                                                            Mark as read
                                                        </Text>
                                                    )}
                                                </Pressable>
                                            </View>
                                        )}
                                    </Pressable>
                                );
                            })
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};
