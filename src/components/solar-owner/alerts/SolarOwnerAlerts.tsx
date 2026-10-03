import TabScreenBackground from '@/components/shared/TabScreenBackground';
import { useNotifications } from '@/hooks/useNotifications';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SolarToast } from '../shared/SolarToast';
import { ViewHeader } from '../shared/ViewHeader';
import { useSolarOwnerStore } from '../store/useSolarOwnerStore';

type NotificationCategory = 'all' | 'requests' | 'energy' | 'maintenance' | 'system';

export const SolarOwnerAlerts = () => {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { setActiveView, showToast } = useSolarOwnerStore();

    const {
        notifications,
        unreadCount,
        loading,
        error,
        markingReadId,
        isMarkingAllRead,
        refetch,
        markAsRead,
        markAllAsRead,
    } = useNotifications({
        pollIntervalMs: 15000, // refresh in background every 15s
    });

    const [refreshing, setRefreshing] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<NotificationCategory>('all');

    const handleRefresh = async () => {
        setRefreshing(true);
        await refetch();
        setRefreshing(false);
    };

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

    // Filter notifications by selected category tab
    const filteredNotifications = notifications.filter((item) => {
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
                return {
                    bg: 'bg-emerald-500/20 border-emerald-500/40',
                    text: 'text-emerald-500',
                    label: 'Energy',
                };
            case 'maintenance':
                return {
                    bg: 'bg-amber-500/20 border-amber-500/40',
                    text: 'text-amber-500',
                    label: 'Maintenance',
                };
            case 'request':
                return {
                    bg: 'bg-sky-500/20 border-sky-500/40',
                    text: 'text-sky-500',
                    label: 'Request',
                };
            case 'announcement':
                return {
                    bg: 'bg-indigo-500/20 border-indigo-500/40',
                    text: 'text-indigo-500',
                    label: 'Notice',
                };
            case 'system':
            default:
                return {
                    bg: 'bg-purple-500/20 border-purple-500/40',
                    text: 'text-purple-500',
                    label: 'System',
                };
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
        <View className="flex-1 bg-background">
            <TabScreenBackground />
            <SolarToast />

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor="#F59E0B"
                        colors={['#F59E0B']}
                    />
                }
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingTop: insets.top > 0 ? insets.top + 10 : 24,
                    paddingBottom: 40,
                }}
            >
                {/* Header */}
                <ViewHeader
                    title="Alerts & Notices"
                    subtitle="System warnings, energy requests & maintenance"
                    showBack={true}
                    onBack={() => {
                        if (router.canGoBack()) {
                            router.back();
                        } else {
                            setActiveView('dashboard');
                        }
                    }}
                />

                {/* Top Status & Mark All Read */}
                <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center">
                        <View className={`h-3 w-3 rounded-full mr-2 ${unreadCount > 0 ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                        <Text className="text-xs font-bold text-foreground">
                            {unreadCount} Unread Notification{unreadCount === 1 ? '' : 's'}
                        </Text>
                    </View>

                    {unreadCount > 0 && (
                        <Pressable
                            onPress={handleMarkAllAsRead}
                            disabled={isMarkingAllRead}
                            className="px-3 py-1.5 rounded-xl bg-secondary border border-border/70 active:opacity-80 flex-row items-center"
                        >
                            {isMarkingAllRead ? (
                                <View className="flex-row items-center gap-1">
                                    <ActivityIndicator size="small" color="#F59E0B" />
                                    <Text className="text-[11px] font-bold text-primary">
                                        Marking...
                                    </Text>
                                </View>
                            ) : (
                                <Text className="text-[11px] font-bold text-primary">
                                    Mark all as read
                                </Text>
                            )}
                        </Pressable>
                    )}
                </View>

                {/* Category Filter Pills */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                        paddingHorizontal: 4,
                        paddingVertical: 4,
                        gap: 8,
                        flexDirection: 'row',
                        alignItems: 'center',
                    }}
                    className="mb-5"
                >
                    {[
                        { id: 'all', label: 'All Alerts', icon: 'bell' },
                        { id: 'requests', label: 'Requests', icon: 'zap' },
                        { id: 'energy', label: 'Energy', icon: 'battery-charging' },
                        { id: 'maintenance', label: 'Maintenance', icon: 'tool' },
                        { id: 'system', label: 'System', icon: 'activity' },
                    ].map((cat) => {
                        const isSelected = selectedCategory === cat.id;
                        return (
                            <Pressable
                                key={cat.id}
                                onPress={() => setSelectedCategory(cat.id as NotificationCategory)}
                                className={`flex-row items-center px-4 py-2.5 rounded-2xl border ${
                                    isSelected
                                        ? 'bg-primary border-primary shadow-sm'
                                        : 'bg-card/90 border-border/70 active:bg-secondary'
                                }`}
                            >
                                <Feather
                                    name={cat.icon as any}
                                    size={14}
                                    color={isSelected ? '#FFFFFF' : '#9CA3AF'}
                                />
                                <Text
                                    style={{ includeFontPadding: false }}
                                    className={`text-xs font-bold ml-1.5 leading-none ${
                                        isSelected
                                            ? 'text-primary-foreground font-black'
                                            : 'text-foreground'
                                    }`}
                                >
                                    {cat.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>

                {/* Notifications List */}
                <View className="gap-3 mb-6">
                    {/* 1. Loading State */}
                    {loading && notifications.length === 0 ? (
                        <View className="rounded-[28px] border border-border/70 bg-card/60 p-10 items-center justify-center">
                            <ActivityIndicator size="large" color="#F59E0B" />
                            <Text className="text-xs font-semibold text-muted-foreground mt-3">
                                Loading notifications...
                            </Text>
                        </View>
                    ) : error && notifications.length === 0 ? (
                        /* 2. Error State */
                        <View className="rounded-[28px] border border-destructive/40 bg-destructive/10 p-8 items-center justify-center">
                            <Feather name="alert-triangle" size={32} color="#EF4444" />
                            <Text className="text-sm font-bold text-destructive mt-3 text-center">
                                Failed to load notifications
                            </Text>
                            <Text className="text-xs text-muted-foreground mt-1 text-center">
                                {error}
                            </Text>
                            <Pressable
                                onPress={refetch}
                                className="mt-4 px-4 py-2 bg-destructive/20 border border-destructive/30 rounded-xl active:opacity-75"
                            >
                                <Text className="text-xs font-bold text-destructive">
                                    Retry
                                </Text>
                            </Pressable>
                        </View>
                    ) : filteredNotifications.length === 0 ? (
                        /* 3. Empty State */
                        <View className="rounded-[28px] border border-border/70 bg-card/60 p-8 items-center justify-center">
                            <Feather name="check-circle" size={32} color="#10B981" />
                            <Text className="text-sm font-bold text-foreground mt-3 text-center">
                                No notifications in this category
                            </Text>
                            <Text className="text-xs text-muted-foreground mt-0.5 text-center">
                                You're all caught up with your updates.
                            </Text>
                        </View>
                    ) : (
                        /* 4. Notification Items */
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
                                    style={{ padding: 18 }}
                                    className={`rounded-3xl border p-5 shadow-sm active:opacity-90 ${
                                        !item.isRead
                                            ? 'bg-card border-primary/50 dark:bg-card/80'
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
                                            {formatTimestamp(item.createdAt)}
                                        </Text>
                                    </View>

                                    {/* Alert Content */}
                                    <Text className="text-sm font-bold text-foreground mb-1">
                                        {item.title}
                                    </Text>
                                    <Text className="text-xs text-muted-foreground leading-relaxed mb-3">
                                        {item.message}
                                    </Text>

                                    {/* Action Row */}
                                    {!item.isRead && (
                                        <View className="flex-row items-center justify-end pt-2 border-t border-border/40">
                                            <Pressable
                                                onPress={() => handleMarkAsRead(item.id)}
                                                disabled={markingReadId === item.id}
                                                className="px-3.5 py-1.5 rounded-xl bg-primary/20 border border-primary/30 active:opacity-80 flex-row items-center"
                                            >
                                                {markingReadId === item.id ? (
                                                    <View className="flex-row items-center gap-1.5">
                                                        <ActivityIndicator size="small" color="#F59E0B" />
                                                        <Text className="text-xs font-bold text-primary">
                                                            Saving...
                                                        </Text>
                                                    </View>
                                                ) : (
                                                    <Text className="text-xs font-bold text-primary">
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
                </View>
            </ScrollView>
        </View>
    );
};

export default SolarOwnerAlerts;
