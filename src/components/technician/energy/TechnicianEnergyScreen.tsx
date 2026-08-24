import TabScreenBackground from '@/components/shared/TabScreenBackground';
import {
    SystemHealthStatus,
    technicianEnergySummary,
    technicianSystems,
} from '@/data/technicianData';

import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

import React, { useMemo, useState } from 'react';

import {
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native';

type FilterType = 'All' | SystemHealthStatus;

const filters: FilterType[] = [
    'All',
    'Critical',
    'Warning',
    'Normal',
    'Maintenance',
];

const TechnicianEnergyScreen = () => {
    const [search, setSearch] = useState('');
    const [selectedFilter, setSelectedFilter] =
        useState<FilterType>('All');

    const filteredSystems = useMemo(() => {
        return technicianSystems.filter((system) => {
            const searchValue = search.toLowerCase();

            const matchesSearch =
                system.systemName
                    .toLowerCase()
                    .includes(searchValue) ||
                system.location
                    .toLowerCase()
                    .includes(searchValue) ||
                system.equipmentStatus
                    .toLowerCase()
                    .includes(searchValue);

            const matchesFilter =
                selectedFilter === 'All'
                    ? true
                    : system.status === selectedFilter;

            return matchesSearch && matchesFilter;
        });
    }, [search, selectedFilter]);

    const getStatusStyle = (status: SystemHealthStatus) => {
        switch (status) {
            case 'Critical':
                return {
                    box: 'bg-priority-high',
                    text: 'text-priority-high-foreground',
                    icon: '#DC2626',
                };

            case 'Warning':
                return {
                    box: 'bg-priority-medium',
                    text: 'text-priority-medium-foreground',
                    icon: '#D97706',
                };

            case 'Normal':
                return {
                    box: 'bg-priority-low',
                    text: 'text-priority-low-foreground',
                    icon: '#16A34A',
                };

            default:
                return {
                    box: 'bg-secondary',
                    text: 'text-secondary-foreground',
                    icon: '#D97706',
                };
        }
    };

    return (
        <View className="flex-1 bg-background">
            <TabScreenBackground />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingTop: 20,
                    paddingBottom: 50,
                }}
            >
                {/* Header */}
                <View className="mb-6">
                    <Text className="text-3xl font-extrabold text-foreground">
                        System Monitoring
                    </Text>

                    <Text className="mt-2 text-sm leading-5 text-muted-foreground">
                        Monitor real-time solar performance and equipment status.
                    </Text>
                </View>

                {/* Live indicator */}
                <View className="mb-5 flex-row items-center rounded-2xl border border-border bg-card p-4">
                    <View className="h-10 w-10 items-center justify-center rounded-xl bg-priority-low">
                        <Feather
                            name="activity"
                            size={19}
                            color="#16A34A"
                        />
                    </View>

                    <View className="ml-3 flex-1">
                        <Text className="text-sm font-bold text-foreground">
                            Live System Monitoring
                        </Text>

                        <Text className="mt-1 text-xs text-muted-foreground">
                            System information is currently up to date
                        </Text>
                    </View>

                    <View className="h-2.5 w-2.5 rounded-full bg-green-500" />
                </View>

                {/* Summary cards */}
                <Text className="mb-3 text-lg font-extrabold text-foreground">
                    Energy Overview
                </Text>

                <View className="mb-3 flex-row gap-3">
                    <View className="flex-1 rounded-[22px] border border-border bg-card p-4">
                        <View className="h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                            <Feather
                                name="sun"
                                size={19}
                                color="#D97706"
                            />
                        </View>

                        <Text className="mt-3 text-2xl font-extrabold text-foreground">
                            {technicianEnergySummary.totalGeneration}
                        </Text>

                        <Text className="text-xs font-semibold text-foreground">
                            kW
                        </Text>

                        <Text className="mt-1 text-xs text-muted-foreground">
                            Current Generation
                        </Text>
                    </View>

                    <View className="flex-1 rounded-[22px] border border-border bg-card p-4">
                        <View className="h-10 w-10 items-center justify-center rounded-xl bg-muted">
                            <Feather
                                name="target"
                                size={19}
                                color="#6B7280"
                            />
                        </View>

                        <Text className="mt-3 text-2xl font-extrabold text-foreground">
                            {technicianEnergySummary.expectedGeneration}
                        </Text>

                        <Text className="text-xs font-semibold text-foreground">
                            kW
                        </Text>

                        <Text className="mt-1 text-xs text-muted-foreground">
                            Expected Generation
                        </Text>
                    </View>
                </View>

                <View className="mb-7 flex-row gap-3">
                    <View className="flex-1 rounded-[22px] border border-border bg-card p-4">
                        <Text className="text-xs text-muted-foreground">
                            Avg. Performance
                        </Text>

                        <Text className="mt-2 text-2xl font-extrabold text-foreground">
                            {technicianEnergySummary.averagePerformance}%
                        </Text>

                        <View className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                            <View
                                className="h-full rounded-full bg-primary"
                                style={{
                                    width: `${technicianEnergySummary.averagePerformance}%`,
                                }}
                            />
                        </View>
                    </View>

                    <View className="flex-1 rounded-[22px] border border-border bg-card p-4">
                        <Text className="text-xs text-muted-foreground">
                            Systems Online
                        </Text>

                        <Text className="mt-2 text-2xl font-extrabold text-foreground">
                            {technicianEnergySummary.onlineSystems}
                        </Text>

                        <View className="mt-3 flex-row items-center">
                            <Feather
                                name="wifi"
                                size={14}
                                color="#16A34A"
                            />

                            <Text className="ml-2 text-xs font-semibold text-foreground">
                                Connected
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Critical alert */}
                <Pressable
                    onPress={() =>
                        router.push(
                            '/technician/request/SR-001' as any
                        )
                    }
                    className="mb-7 rounded-[22px] border border-priority-high bg-priority-high p-4 active:opacity-80"
                >
                    <View className="flex-row items-start">
                        <Feather
                            name="alert-triangle"
                            size={20}
                            color="#DC2626"
                        />

                        <View className="ml-3 flex-1">
                            <Text className="font-extrabold text-foreground">
                                Critical performance issue
                            </Text>

                            <Text className="mt-1 text-xs leading-5 text-muted-foreground">
                                Sunny Valley Solar is operating at only 43% of expected performance.
                            </Text>

                            <Text className="mt-2 text-xs font-bold text-foreground">
                                View Fault Details →
                            </Text>
                        </View>
                    </View>
                </Pressable>

                {/* Search */}
                <View className="mb-4 flex-row items-center rounded-2xl border border-border bg-card px-4">
                    <Feather
                        name="search"
                        size={19}
                        color="#9CA3AF"
                    />

                    <TextInput
                        value={search}
                        onChangeText={setSearch}
                        placeholder="Search system or location"
                        placeholderTextColor="#9CA3AF"
                        className="ml-3 flex-1 py-4 text-sm text-foreground"
                    />

                    {search.length > 0 && (
                        <Pressable onPress={() => setSearch('')}>
                            <Feather
                                name="x"
                                size={18}
                                color="#9CA3AF"
                            />
                        </Pressable>
                    )}
                </View>

                {/* Filters */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mb-6"
                >
                    <View className="flex-row gap-2">
                        {filters.map((filter) => {
                            const active =
                                filter === selectedFilter;

                            return (
                                <Pressable
                                    key={filter}
                                    onPress={() =>
                                        setSelectedFilter(filter)
                                    }
                                    className={`rounded-full border px-4 py-2.5 ${
                                        active
                                            ? 'border-foreground bg-foreground'
                                            : 'border-border bg-card'
                                    }`}
                                >
                                    <Text
                                        className={`text-xs font-bold ${
                                            active
                                                ? 'text-background'
                                                : 'text-foreground'
                                        }`}
                                    >
                                        {filter}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </ScrollView>

                {/* Systems */}
                <View className="mb-3 flex-row items-center justify-between">
                    <Text className="text-lg font-extrabold text-foreground">
                        Solar Systems
                    </Text>

                    <Text className="text-xs font-semibold text-muted-foreground">
                        {filteredSystems.length} systems
                    </Text>
                </View>

                <View className="gap-4">
                    {filteredSystems.map((system) => {
                        const status =
                            getStatusStyle(system.status);

                        return (
                            <View
                                key={system.id}
                                className="rounded-[24px] border border-border bg-card p-4"
                            >
                                {/* System header */}
                                <View className="flex-row items-start justify-between">
                                    <View className="mr-3 flex-1">
                                        <Text className="text-base font-extrabold text-foreground">
                                            {system.systemName}
                                        </Text>

                                        <View className="mt-2 flex-row items-center">
                                            <Feather
                                                name="map-pin"
                                                size={13}
                                                color="#6B7280"
                                            />

                                            <Text className="ml-1 text-xs text-muted-foreground">
                                                {system.location}
                                            </Text>
                                        </View>
                                    </View>

                                    <View
                                        className={`rounded-full px-3 py-1.5 ${status.box}`}
                                    >
                                        <Text
                                            className={`text-[10px] font-extrabold uppercase ${status.text}`}
                                        >
                                            {system.status}
                                        </Text>
                                    </View>
                                </View>

                                <View className="my-4 h-px bg-border" />

                                {/* Energy values */}
                                <View className="flex-row">
                                    <View className="flex-1">
                                        <Text className="text-xs text-muted-foreground">
                                            Current
                                        </Text>

                                        <Text className="mt-1 text-xl font-extrabold text-foreground">
                                            {system.currentGeneration} kW
                                        </Text>
                                    </View>

                                    <View className="flex-1">
                                        <Text className="text-xs text-muted-foreground">
                                            Expected
                                        </Text>

                                        <Text className="mt-1 text-xl font-extrabold text-foreground">
                                            {system.expectedGeneration} kW
                                        </Text>
                                    </View>
                                </View>

                                {/* Performance */}
                                <View className="mt-4">
                                    <View className="mb-2 flex-row items-center justify-between">
                                        <Text className="text-xs text-muted-foreground">
                                            Performance
                                        </Text>

                                        <Text className="text-xs font-extrabold text-foreground">
                                            {system.performance}%
                                        </Text>
                                    </View>

                                    <View className="h-2.5 overflow-hidden rounded-full bg-muted">
                                        <View
                                            className={
                                                system.status ===
                                                'Critical'
                                                    ? 'h-full rounded-full bg-red-500'
                                                    : system.status ===
                                                        'Warning'
                                                      ? 'h-full rounded-full bg-amber-500'
                                                      : 'h-full rounded-full bg-green-500'
                                            }
                                            style={{
                                                width: `${system.performance}%`,
                                            }}
                                        />
                                    </View>
                                </View>

                                {/* Equipment status */}
                                <View className="mt-4 flex-row items-center rounded-2xl bg-muted p-3">
                                    <View className="h-9 w-9 items-center justify-center rounded-xl bg-card">
                                        <Feather
                                            name="cpu"
                                            size={16}
                                            color={status.icon}
                                        />
                                    </View>

                                    <View className="ml-3 flex-1">
                                        <Text className="text-[11px] text-muted-foreground">
                                            Equipment Status
                                        </Text>

                                        <Text className="mt-0.5 text-sm font-bold text-foreground">
                                            {system.equipmentStatus}
                                        </Text>
                                    </View>
                                </View>

                                <View className="mt-4 flex-row items-center justify-between">
                                    <Text className="text-[11px] text-muted-foreground">
                                        Updated {system.lastUpdated}
                                    </Text>

                                    {system.requestId && (
                                        <Pressable
                                            onPress={() =>
                                                router.push(
                                                    `/technician/request/${system.requestId}` as any
                                                )
                                            }
                                            className="flex-row items-center"
                                        >
                                            <Text className="text-xs font-bold text-foreground">
                                                Details
                                            </Text>

                                            <Feather
                                                name="chevron-right"
                                                size={15}
                                                color="#6B7280"
                                            />
                                        </Pressable>
                                    )}
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* Empty state */}
                {filteredSystems.length === 0 && (
                    <View className="items-center rounded-[24px] border border-border bg-card py-10">
                        <Feather
                            name="search"
                            size={28}
                            color="#9CA3AF"
                        />

                        <Text className="mt-3 font-bold text-foreground">
                            No systems found
                        </Text>

                        <Text className="mt-1 text-xs text-muted-foreground">
                            Try another search or filter.
                        </Text>

                        <Pressable
                            onPress={() => {
                                setSearch('');
                                setSelectedFilter('All');
                            }}
                            className="mt-4 rounded-xl bg-secondary px-5 py-3"
                        >
                            <Text className="text-sm font-bold text-secondary-foreground">
                                Clear Filters
                            </Text>
                        </Pressable>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

export default TechnicianEnergyScreen;