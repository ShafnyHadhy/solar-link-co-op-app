import TabScreenBackground from '@/components/shared/TabScreenBackground';
import {
    serviceRequests,
    technicianSummary,
    TechnicianFilter,
} from '@/data/technicianData';
import { Feather } from '@expo/vector-icons';
import { useUser } from '@clerk/expo';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native';

const filters: TechnicianFilter[] = [
    'All',
    'Critical',
    'Warning',
    'Maintenance',
];

const TechnicianDashboard = () => {
    const { user } = useUser();

    const [search, setSearch] = useState('');
    const [selectedFilter, setSelectedFilter] =
        useState<TechnicianFilter>('All');

    const filteredRequests = useMemo(() => {
        return serviceRequests.filter((request) => {
            const searchMatch =
                request.systemName
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                request.location
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                request.issue
                    .toLowerCase()
                    .includes(search.toLowerCase());

            const filterMatch =
                selectedFilter === 'All'
                    ? true
                    : request.status === selectedFilter;

            return searchMatch && filterMatch;
        });
    }, [search, selectedFilter]);

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Critical':
                return {
                    container: 'bg-priority-high',
                    text: 'text-priority-high-foreground',
                };

            case 'Warning':
                return {
                    container: 'bg-priority-medium',
                    text: 'text-priority-medium-foreground',
                };

            case 'Normal':
                return {
                    container: 'bg-priority-low',
                    text: 'text-priority-low-foreground',
                };

            default:
                return {
                    container: 'bg-secondary',
                    text: 'text-secondary-foreground',
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
                    paddingTop: 16,
                    paddingBottom: 40,
                }}
            >
                {/* Header */}
                <View className="mb-6 flex-row items-center justify-between">
                    <View>
                        <Text className="text-xl font-extrabold text-foreground">
                            SolarShare
                        </Text>

                        <Text className="mt-0.5 text-xs text-muted-foreground">
                            Technician Portal
                        </Text>
                    </View>

                    <View className="h-11 w-11 items-center justify-center rounded-2xl bg-primary">
                        <Text className="text-lg font-extrabold text-primary-foreground">
                            {(user?.firstName?.[0] || 'T').toUpperCase()}
                        </Text>
                    </View>
                </View>

                {/* Title */}
                <View className="mb-5">
                    <Text className="text-3xl font-extrabold text-foreground">
                        Technician Dashboard
                    </Text>

                    <Text className="mt-2 text-sm leading-5 text-muted-foreground">
                        Monitor solar systems, faults, service requests and maintenance.
                    </Text>
                </View>

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
                </View>

                {/* Filters */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mb-6"
                >
                    <View className="flex-row gap-2">
                        {filters.map((filter) => {
                            const active = selectedFilter === filter;

                            return (
                                <Pressable
                                    key={filter}
                                    onPress={() =>
                                        setSelectedFilter(filter)
                                    }
                                    className={`rounded-full border px-4 py-2 ${
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

                {/* Summary heading */}
                <Text className="mb-3 text-lg font-bold text-foreground">
                    System Overview
                </Text>

                {/* Summary cards */}
                <View className="mb-7 flex-row gap-2">
                    <View className="flex-1 rounded-2xl border border-border bg-card p-3">
                        <View className="mb-2 h-9 w-9 items-center justify-center rounded-xl bg-priority-low">
                            <Feather
                                name="check-circle"
                                size={18}
                                color="#16A34A"
                            />
                        </View>

                        <Text className="text-2xl font-extrabold text-foreground">
                            {technicianSummary.healthySystems}
                        </Text>

                        <Text className="mt-1 text-[11px] text-muted-foreground">
                            Healthy Systems
                        </Text>
                    </View>

                    <View className="flex-1 rounded-2xl border border-border bg-card p-3">
                        <View className="mb-2 h-9 w-9 items-center justify-center rounded-xl bg-priority-high">
                            <Feather
                                name="alert-triangle"
                                size={18}
                                color="#DC2626"
                            />
                        </View>

                        <Text className="text-2xl font-extrabold text-foreground">
                            {technicianSummary.activeFaults}
                        </Text>

                        <Text className="mt-1 text-[11px] text-muted-foreground">
                            Active Faults
                        </Text>
                    </View>

                    <View className="flex-1 rounded-2xl border border-border bg-card p-3">
                        <View className="mb-2 h-9 w-9 items-center justify-center rounded-xl bg-priority-medium">
                            <Feather
                                name="tool"
                                size={18}
                                color="#D97706"
                            />
                        </View>

                        <Text className="text-2xl font-extrabold text-foreground">
                            {technicianSummary.maintenanceDue}
                        </Text>

                        <Text className="mt-1 text-[11px] text-muted-foreground">
                            Maintenance Due
                        </Text>
                    </View>
                </View>

                {/* Service requests header */}
                <View className="mb-3 flex-row items-center justify-between">
                    <View>
                        <Text className="text-lg font-bold text-foreground">
                            Service Requests
                        </Text>

                        <Text className="mt-0.5 text-xs text-muted-foreground">
                            Systems requiring attention
                        </Text>
                    </View>

                    <Pressable
                        onPress={() =>
                            router.push('/requests' as any)
                        }
                    >
                        <Text className="text-sm font-bold text-foreground">
                            View All
                        </Text>
                    </Pressable>
                </View>

                {/* Service cards */}
                <View className="gap-3">
                    {filteredRequests.slice(0, 3).map((request) => {
                        const style = getStatusStyle(request.status);

                        return (
                            <View
                                key={request.id}
                                className="rounded-[22px] border border-border bg-card p-4"
                            >
                                <View className="flex-row items-start justify-between">
                                    <View className="mr-3 flex-1">
                                        <Text className="text-base font-extrabold text-foreground">
                                            {request.systemName}
                                        </Text>

                                        <View className="mt-1.5 flex-row items-center">
                                            <Feather
                                                name="map-pin"
                                                size={13}
                                                color="#6B7280"
                                            />

                                            <Text className="ml-1 text-xs text-muted-foreground">
                                                {request.location}
                                            </Text>
                                        </View>
                                    </View>

                                    <View
                                        className={`rounded-full px-3 py-1 ${style.container}`}
                                    >
                                        <Text
                                            className={`text-[10px] font-extrabold uppercase ${style.text}`}
                                        >
                                            {request.status}
                                        </Text>
                                    </View>
                                </View>

                                <View className="my-3 h-px bg-border" />

                                <Text className="text-xs text-muted-foreground">
                                    Issue
                                </Text>

                                <Text className="mt-1 text-sm font-semibold text-foreground">
                                    {request.issue}
                                </Text>

                                <View className="mt-3 flex-row items-center justify-between">
                                    <View>
                                        <Text className="text-xs text-muted-foreground">
                                            Severity
                                        </Text>

                                        <Text className="mt-0.5 text-sm font-bold text-foreground">
                                            {request.severity}
                                        </Text>
                                    </View>

                                    <Pressable
                                        onPress={() =>
                                            router.push(
                                                `/technician/request/${request.id}` as any
                                            )
                                        }
                                        className="rounded-xl bg-primary px-4 py-2.5 active:opacity-80"
                                    >
                                        <Text className="text-xs font-bold text-primary-foreground">
                                            View Details
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* No result */}
                {filteredRequests.length === 0 && (
                    <View className="my-5 items-center rounded-2xl border border-border bg-card p-8">
                        <Feather
                            name="search"
                            size={28}
                            color="#9CA3AF"
                        />

                        <Text className="mt-3 font-bold text-foreground">
                            No systems found
                        </Text>

                        <Text className="mt-1 text-center text-xs text-muted-foreground">
                            Try another system name, location or filter.
                        </Text>
                    </View>
                )}

                {/* Maintenance */}
                <View className="mb-3 mt-8 flex-row items-center justify-between">
                    <View>
                        <Text className="text-lg font-bold text-foreground">
                            Upcoming Maintenance
                        </Text>

                        <Text className="mt-0.5 text-xs text-muted-foreground">
                            Your next scheduled service
                        </Text>
                    </View>

                    <Pressable
                        onPress={() =>
                            router.push('/schedule' as any)
                        }
                    >
                        <Text className="text-sm font-bold text-foreground">
                            View Schedule
                        </Text>
                    </Pressable>
                </View>

                <View className="rounded-[22px] border border-border bg-card p-4">
                    <View className="flex-row items-center">
                        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-secondary">
                            <Feather
                                name="calendar"
                                size={21}
                                color="#D97706"
                            />
                        </View>

                        <View className="ml-3 flex-1">
                            <Text className="text-base font-bold text-foreground">
                                GreenHome Solar
                            </Text>

                            <Text className="mt-1 text-xs text-muted-foreground">
                                Panel Inspection • Katugastota
                            </Text>
                        </View>

                        <View className="items-end">
                            <Text className="text-xs font-bold text-foreground">
                                Tomorrow
                            </Text>

                            <Text className="mt-1 text-xs text-muted-foreground">
                                10:30 AM
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default TechnicianDashboard;