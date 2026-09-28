import TabScreenBackground from '@/components/shared/TabScreenBackground';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native';

type TicketPriority = 'critical' | 'high' | 'medium' | 'low';

type TicketStatus =
    | 'open'
    | 'assigned'
    | 'in_progress'
    | 'resolved'
    | 'closed';

type TicketFilter = 'All' | TicketPriority;

interface ServiceTicket {
    id: string;
    assetId: string | null;
    reportedBy: string;
    assignedTechnicianId: string | null;
    title: string;
    description: string | null;
    priority: TicketPriority;
    status: TicketStatus;
    location: string | null;
    createdAt: string;
    updatedAt: string;
    resolvedAt: string | null;
}

const filters: TicketFilter[] = [
    'All',
    'critical',
    'high',
    'medium',
    'low',
];

const RequestsScreen = () => {
    const [search, setSearch] = useState('');
    const [selectedFilter, setSelectedFilter] =
        useState<TicketFilter>('All');

    const [tickets, setTickets] = useState<ServiceTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadTickets = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/service-tickets');
            const result = await response.json();

            if (!response.ok || result.success === false) {
                throw new Error(
                    result.error || 'Failed to load service tickets'
                );
            }

            /*
             * Supports the common API response structures:
             *
             * { success: true, data: { tickets: [...] } }
             *
             * or
             *
             * { success: true, tickets: [...] }
             */
            const receivedTickets =
                result.data?.tickets ?? result.tickets ?? [];

            setTickets(receivedTickets);
        } catch (err) {
            console.error('Failed to load service tickets:', err);

            setError(
                'Unable to load service tickets. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTickets();
    }, []);

    const filteredTickets = useMemo(() => {
        const searchText = search.trim().toLowerCase();

        return tickets.filter((ticket) => {
            const matchesSearch =
                ticket.title.toLowerCase().includes(searchText) ||
                (ticket.description ?? '')
                    .toLowerCase()
                    .includes(searchText) ||
                (ticket.location ?? '')
                    .toLowerCase()
                    .includes(searchText) ||
                ticket.id.toLowerCase().includes(searchText);

            const matchesFilter =
                selectedFilter === 'All' ||
                ticket.priority === selectedFilter;

            return matchesSearch && matchesFilter;
        });
    }, [tickets, search, selectedFilter]);

    const getPriorityStyle = (priority: TicketPriority) => {
        switch (priority) {
            case 'critical':
                return {
                    container: 'bg-priority-high',
                    text: 'text-priority-high-foreground',
                };

            case 'high':
                return {
                    container: 'bg-priority-high',
                    text: 'text-priority-high-foreground',
                };

            case 'medium':
                return {
                    container: 'bg-priority-medium',
                    text: 'text-priority-medium-foreground',
                };

            case 'low':
                return {
                    container: 'bg-priority-low',
                    text: 'text-priority-low-foreground',
                };

            default:
                return {
                    container: 'bg-muted',
                    text: 'text-muted-foreground',
                };
        }
    };

    const getPriorityIcon = (
        priority: TicketPriority
    ): keyof typeof Feather.glyphMap => {
        switch (priority) {
            case 'critical':
            case 'high':
                return 'alert-triangle';

            case 'medium':
                return 'alert-circle';

            default:
                return 'check-circle';
        }
    };

    const getPriorityColor = (priority: TicketPriority) => {
        switch (priority) {
            case 'critical':
            case 'high':
                return '#DC2626';

            case 'medium':
                return '#D97706';

            default:
                return '#16A34A';
        }
    };

    const formatStatus = (status: TicketStatus) => {
        return status
            .split('_')
            .map(
                (word) =>
                    word.charAt(0).toUpperCase() +
                    word.slice(1)
            )
            .join(' ');
    };

    const formatPriority = (priority: TicketPriority) => {
        return (
            priority.charAt(0).toUpperCase() +
            priority.slice(1)
        );
    };

    const criticalCount = tickets.filter(
        (ticket) => ticket.priority === 'critical'
    ).length;

    const openCount = tickets.filter(
        (ticket) => ticket.status === 'open'
    ).length;

    const inProgressCount = tickets.filter(
        (ticket) => ticket.status === 'in_progress'
    ).length;

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
                {/* Page Heading */}
                <View className="mb-6">
                    <Text className="text-3xl font-extrabold text-foreground">
                        Service Tickets
                    </Text>

                    <Text className="mt-2 text-sm leading-5 text-muted-foreground">
                        Review and manage solar system service
                        tickets.
                    </Text>
                </View>

                {/* Summary */}
                <View className="mb-5 flex-row gap-3">
                    <View className="flex-1 rounded-[20px] border border-border bg-card p-4">
                        <Text className="text-2xl font-extrabold text-foreground">
                            {criticalCount}
                        </Text>

                        <Text className="mt-1 text-xs text-muted-foreground">
                            Critical
                        </Text>
                    </View>

                    <View className="flex-1 rounded-[20px] border border-border bg-card p-4">
                        <Text className="text-2xl font-extrabold text-foreground">
                            {openCount}
                        </Text>

                        <Text className="mt-1 text-xs text-muted-foreground">
                            Open
                        </Text>
                    </View>

                    <View className="flex-1 rounded-[20px] border border-border bg-card p-4">
                        <Text className="text-2xl font-extrabold text-foreground">
                            {inProgressCount}
                        </Text>

                        <Text className="mt-1 text-xs text-muted-foreground">
                            In Progress
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
                        placeholder="Search ticket, issue or location"
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

                {/* Priority Filters */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mb-6"
                >
                    <View className="flex-row gap-2">
                        {filters.map((filter) => {
                            const active =
                                selectedFilter === filter;

                            const label =
                                filter === 'All'
                                    ? 'All'
                                    : formatPriority(filter);

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
                                        {label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </ScrollView>

                {/* Loading */}
                {loading && (
                    <View className="items-center py-12">
                        <ActivityIndicator size="large" />

                        <Text className="mt-4 text-sm text-muted-foreground">
                            Loading service tickets...
                        </Text>
                    </View>
                )}

                {/* Error */}
                {!loading && error && (
                    <View className="mb-5 items-center rounded-[24px] border border-border bg-card px-5 py-10">
                        <Feather
                            name="alert-circle"
                            size={28}
                            color="#DC2626"
                        />

                        <Text className="mt-4 text-base font-bold text-foreground">
                            Unable to load tickets
                        </Text>

                        <Text className="mt-2 text-center text-sm text-muted-foreground">
                            {error}
                        </Text>

                        <Pressable
                            onPress={loadTickets}
                            className="mt-5 rounded-xl bg-primary px-5 py-3"
                        >
                            <Text className="font-bold text-primary-foreground">
                                Try Again
                            </Text>
                        </Pressable>
                    </View>
                )}

                {/* Ticket List */}
                {!loading && !error && (
                    <>
                        <View className="mb-3 flex-row items-center justify-between">
                            <Text className="text-lg font-bold text-foreground">
                                Tickets
                            </Text>

                            <Text className="text-xs font-semibold text-muted-foreground">
                                {filteredTickets.length}{' '}
                                {filteredTickets.length === 1
                                    ? 'ticket'
                                    : 'tickets'}
                            </Text>
                        </View>

                        <View className="gap-4">
                            {filteredTickets.map((ticket) => {
                                const priorityStyle =
                                    getPriorityStyle(
                                        ticket.priority
                                    );

                                return (
                                    <View
                                        key={ticket.id}
                                        className="rounded-[24px] border border-border bg-card p-4"
                                    >
                                        {/* Ticket Header */}
                                        <View className="flex-row items-start justify-between">
                                            <View className="mr-3 flex-1">
                                                <Text className="text-base font-extrabold text-foreground">
                                                    {ticket.title}
                                                </Text>

                                                <View className="mt-2 flex-row items-center">
                                                    <Feather
                                                        name="map-pin"
                                                        size={14}
                                                        color="#6B7280"
                                                    />

                                                    <Text className="ml-1.5 text-xs text-muted-foreground">
                                                        {ticket.location ||
                                                            'Location not provided'}
                                                    </Text>
                                                </View>
                                            </View>

                                            <View
                                                className={`rounded-full px-3 py-1.5 ${priorityStyle.container}`}
                                            >
                                                <Text
                                                    className={`text-[10px] font-extrabold uppercase ${priorityStyle.text}`}
                                                >
                                                    {ticket.priority}
                                                </Text>
                                            </View>
                                        </View>

                                        <View className="my-4 h-px bg-border" />

                                        {/* Description */}
                                        <Text className="text-xs font-medium text-muted-foreground">
                                            Issue
                                        </Text>

                                        <Text className="mt-1 text-base font-bold text-foreground">
                                            {ticket.description ||
                                                'No description provided'}
                                        </Text>

                                        {/* Asset */}
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
                                                        Solar Asset
                                                    </Text>

                                                    <Text className="mt-0.5 text-sm font-semibold text-foreground">
                                                        {ticket.assetId ||
                                                            'No asset linked'}
                                                    </Text>
                                                </View>
                                            </View>
                                        </View>

                                        {/* Priority + Status */}
                                        <View className="mt-4 flex-row items-center justify-between">
                                            <View>
                                                <Text className="text-xs text-muted-foreground">
                                                    Priority
                                                </Text>

                                                <View className="mt-1 flex-row items-center">
                                                    <Feather
                                                        name={getPriorityIcon(
                                                            ticket.priority
                                                        )}
                                                        size={15}
                                                        color={getPriorityColor(
                                                            ticket.priority
                                                        )}
                                                    />

                                                    <Text className="ml-1.5 text-sm font-bold text-foreground">
                                                        {formatPriority(
                                                            ticket.priority
                                                        )}
                                                    </Text>
                                                </View>
                                            </View>

                                            <View className="items-end">
                                                <Text className="text-xs text-muted-foreground">
                                                    Status
                                                </Text>

                                                <Text className="mt-1 text-sm font-bold text-foreground">
                                                    {formatStatus(
                                                        ticket.status
                                                    )}
                                                </Text>
                                            </View>
                                        </View>

                                        <Text className="mt-4 text-xs text-muted-foreground">
                                            Ticket ID: {ticket.id}
                                        </Text>

                                        {/* View Details */}
                                        <Pressable
                                            onPress={() =>
                                                router.push(
                                                    `/technician/request/${ticket.id}` as any
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
                        {filteredTickets.length === 0 && (
                            <View className="mt-4 items-center rounded-[24px] border border-border bg-card px-5 py-10">
                                <View className="h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                                    <Feather
                                        name="inbox"
                                        size={25}
                                        color="#9CA3AF"
                                    />
                                </View>

                                <Text className="mt-4 text-base font-bold text-foreground">
                                    No service tickets found
                                </Text>

                                <Text className="mt-2 text-center text-sm leading-5 text-muted-foreground">
                                    {tickets.length === 0
                                        ? 'There are currently no service tickets.'
                                        : 'Try changing the search text or priority filter.'}
                                </Text>

                                {(search.length > 0 ||
                                    selectedFilter !== 'All') && (
                                    <Pressable
                                        onPress={() => {
                                            setSearch('');
                                            setSelectedFilter(
                                                'All'
                                            );
                                        }}
                                        className="mt-4 rounded-xl bg-secondary px-5 py-3"
                                    >
                                        <Text className="text-sm font-bold text-secondary-foreground">
                                            Clear Filters
                                        </Text>
                                    </Pressable>
                                )}
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </View>
    );
};

export default RequestsScreen;