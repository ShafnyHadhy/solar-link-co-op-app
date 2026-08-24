import TabScreenBackground from '@/components/shared/TabScreenBackground';
import {
    serviceRequests,
    TechnicianFilter,
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

const filters: TechnicianFilter[] = [
    'All',
    'Critical',
    'Warning',
    'Maintenance',
];

const RequestsScreen = () => {
    const [search, setSearch] = useState('');

    const [selectedFilter, setSelectedFilter] =
        useState<TechnicianFilter>('All');

    // Filter requests using search + selected status
    const filteredRequests = useMemo(() => {
        return serviceRequests.filter((request) => {
            const searchText = search.toLowerCase();

            const matchesSearch =
                request.systemName
                    .toLowerCase()
                    .includes(searchText) ||
                request.location
                    .toLowerCase()
                    .includes(searchText) ||
                request.issue
                    .toLowerCase()
                    .includes(searchText);

            const matchesFilter =
                selectedFilter === 'All'
                    ? true
                    : request.status === selectedFilter;

            return matchesSearch && matchesFilter;
        });
    }, [search, selectedFilter]);

    // Status badge style
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

            case 'Maintenance':
                return {
                    container: 'bg-secondary',
                    text: 'text-secondary-foreground',
                };

            default:
                return {
                    container: 'bg-muted',
                    text: 'text-muted-foreground',
                };
        }
    };

    // Severity icon
    const getSeverityIcon = (severity: string) => {
        switch (severity) {
            case 'High':
                return 'alert-triangle';

            case 'Medium':
                return 'alert-circle';

            default:
                return 'check-circle';
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
                {/* Page heading */}
                <View className="mb-6">
                    <Text className="text-3xl font-extrabold text-foreground">
                        Service Requests
                    </Text>

                    <Text className="mt-2 text-sm leading-5 text-muted-foreground">
                        Review system faults, warnings and maintenance requests.
                    </Text>
                </View>

                {/* Request summary */}
                <View className="mb-5 flex-row gap-3">
                    <View className="flex-1 rounded-[20px] border border-border bg-card p-4">
                        <Text className="text-2xl font-extrabold text-foreground">
                            {
                                serviceRequests.filter(
                                    (item) =>
                                        item.status === 'Critical'
                                ).length
                            }
                        </Text>

                        <Text className="mt-1 text-xs text-muted-foreground">
                            Critical
                        </Text>
                    </View>

                    <View className="flex-1 rounded-[20px] border border-border bg-card p-4">
                        <Text className="text-2xl font-extrabold text-foreground">
                            {
                                serviceRequests.filter(
                                    (item) =>
                                        item.status === 'Warning'
                                ).length
                            }
                        </Text>

                        <Text className="mt-1 text-xs text-muted-foreground">
                            Warnings
                        </Text>
                    </View>

                    <View className="flex-1 rounded-[20px] border border-border bg-card p-4">
                        <Text className="text-2xl font-extrabold text-foreground">
                            {
                                serviceRequests.filter(
                                    (item) =>
                                        item.status === 'Maintenance'
                                ).length
                            }
                        </Text>

                        <Text className="mt-1 text-xs text-muted-foreground">
                            Maintenance
                        </Text>
                    </View>
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

                    {search.length > 0 && (
                        <Pressable
                            onPress={() => setSearch('')}
                        >
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
                                selectedFilter === filter;

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

                {/* Number of results */}
                <View className="mb-3 flex-row items-center justify-between">
                    <Text className="text-lg font-bold text-foreground">
                        Requests
                    </Text>

                    <Text className="text-xs font-semibold text-muted-foreground">
                        {filteredRequests.length}{' '}
                        {filteredRequests.length === 1
                            ? 'request'
                            : 'requests'}
                    </Text>
                </View>

                {/* Request Cards */}
                <View className="gap-4">
                    {filteredRequests.map((request) => {
                        const statusStyle =
                            getStatusStyle(request.status);

                        return (
                            <View
                                key={request.id}
                                className="rounded-[24px] border border-border bg-card p-4"
                            >
                                {/* Top */}
                                <View className="flex-row items-start justify-between">
                                    <View className="mr-3 flex-1">
                                        <Text className="text-base font-extrabold text-foreground">
                                            {request.systemName}
                                        </Text>

                                        <View className="mt-2 flex-row items-center">
                                            <Feather
                                                name="map-pin"
                                                size={14}
                                                color="#6B7280"
                                            />

                                            <Text className="ml-1.5 text-xs text-muted-foreground">
                                                {request.location}
                                            </Text>
                                        </View>
                                    </View>

                                    <View
                                        className={`rounded-full px-3 py-1.5 ${statusStyle.container}`}
                                    >
                                        <Text
                                            className={`text-[10px] font-extrabold uppercase ${statusStyle.text}`}
                                        >
                                            {request.status}
                                        </Text>
                                    </View>
                                </View>

                                {/* Separator */}
                                <View className="my-4 h-px bg-border" />

                                {/* Issue */}
                                <Text className="text-xs font-medium text-muted-foreground">
                                    Issue
                                </Text>

                                <Text className="mt-1 text-base font-bold text-foreground">
                                    {request.issue}
                                </Text>

                                {/* Equipment */}
                                <View className="mt-4 rounded-2xl bg-muted p-3">
                                    <View className="flex-row items-center">
                                        <View className="h-9 w-9 items-center justify-center rounded-xl bg-card">
                                            <Feather
                                                name="cpu"
                                                size={17}
                                                color="#6B7280"
                                            />
                                        </View>

                                        <View className="ml-3 flex-1">
                                            <Text className="text-[11px] text-muted-foreground">
                                                Affected Equipment
                                            </Text>

                                            <Text className="mt-0.5 text-sm font-semibold text-foreground">
                                                {request.equipment}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Severity */}
                                <View className="mt-4 flex-row items-center justify-between">
                                    <View>
                                        <Text className="text-xs text-muted-foreground">
                                            Severity
                                        </Text>

                                        <View className="mt-1 flex-row items-center">
                                            <Feather
                                                name={
                                                    getSeverityIcon(
                                                        request.severity
                                                    ) as any
                                                }
                                                size={15}
                                                color={
                                                    request.severity ===
                                                    'High'
                                                        ? '#DC2626'
                                                        : request.severity ===
                                                            'Medium'
                                                          ? '#D97706'
                                                          : '#16A34A'
                                                }
                                            />

                                            <Text className="ml-1.5 text-sm font-bold text-foreground">
                                                {request.severity}
                                            </Text>
                                        </View>
                                    </View>

                                    <Text className="text-xs text-muted-foreground">
                                        {request.id}
                                    </Text>
                                </View>

                                {/* View Details */}
                                <Pressable
                                    onPress={() =>
                                        router.push(
                                            `/technician/request/${request.id}` as any
                                        )
                                    }
                                    className="mt-5 flex-row items-center justify-center rounded-2xl bg-primary py-3.5 active:opacity-80"
                                >
                                    <Text className="font-bold text-primary-foreground">
                                        View Details
                                    </Text>

                                    <Feather
                                        name="chevron-right"
                                        size={18}
                                        color="#1F1F1F"
                                        style={{
                                            marginLeft: 6,
                                        }}
                                    />
                                </Pressable>
                            </View>
                        );
                    })}
                </View>

                {/* Empty State */}
                {filteredRequests.length === 0 && (
                    <View className="mt-4 items-center rounded-[24px] border border-border bg-card px-5 py-10">
                        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                            <Feather
                                name="search"
                                size={25}
                                color="#9CA3AF"
                            />
                        </View>

                        <Text className="mt-4 text-base font-bold text-foreground">
                            No requests found
                        </Text>

                        <Text className="mt-2 text-center text-sm leading-5 text-muted-foreground">
                            Try changing the search text or selected filter.
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

export default RequestsScreen;