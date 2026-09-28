import { Feather } from "@expo/vector-icons";
import {
    router,
    useLocalSearchParams,
} from "expo-router";
import React, {
    useEffect,
    useState,
} from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    Text,
    View,
} from "react-native";

type TicketPriority =
    | "critical"
    | "high"
    | "medium"
    | "low";

type TicketStatus =
    | "open"
    | "assigned"
    | "in_progress"
    | "resolved"
    | "closed";

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

const TicketDetailsScreen = () => {
    const { id } = useLocalSearchParams<{ id: string }>();

    const [ticket, setTicket] =
        useState<ServiceTicket | null>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] =
        useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setError("Ticket ID is missing.");
            setLoading(false);
            return;
        }

        const fetchTicket = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await fetch(
                    `/api/service-tickets/${encodeURIComponent(id)}`
                );

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.message ??
                            "Failed to load service ticket"
                    );
                }

                const fetchedTicket =
                    result.data?.ticket ??
                    result.ticket ??
                    null;

                if (!fetchedTicket) {
                    throw new Error(
                        "Service ticket not found"
                    );
                }

                setTicket(fetchedTicket);
            } catch (err) {
                console.error(
                    "Failed to load service ticket:",
                    err
                );

                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load service ticket"
                );
            } finally {
                setLoading(false);
            }
        };

        fetchTicket();
    }, [id]);

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-background">
                <ActivityIndicator size="large" />

                <Text className="mt-4 text-sm text-muted-foreground">
                    Loading ticket details...
                </Text>
            </View>
        );
    }

    if (error || !ticket) {
        return (
            <View className="flex-1 items-center justify-center bg-background px-6">
                <Feather
                    name="alert-circle"
                    size={40}
                    color="#9CA3AF"
                />

                <Text className="mt-4 text-xl font-bold text-foreground">
                    Ticket not found
                </Text>

                <Text className="mt-2 text-center text-sm text-muted-foreground">
                    {error ??
                        "The requested service ticket could not be found."}
                </Text>

                <Pressable
                    onPress={() => router.back()}
                    className="mt-6 rounded-xl bg-primary px-6 py-3"
                >
                    <Text className="font-bold text-primary-foreground">
                        Go Back
                    </Text>
                </Pressable>
            </View>
        );
    }

    const formatStatus = (status: TicketStatus) =>
        status
            .replace("_", " ")
            .replace(/\b\w/g, (letter) =>
                letter.toUpperCase()
            );

    const formatDate = (date: string | null) => {
        if (!date) {
            return "Not available";
        }

        return new Date(date).toLocaleString();
    };

    const getPriorityStyle = (
        priority: TicketPriority
    ) => {
        switch (priority) {
            case "critical":
            case "high":
                return {
                    box: "bg-priority-high",
                    text: "text-priority-high-foreground",
                };

            case "medium":
                return {
                    box: "bg-priority-medium",
                    text: "text-priority-medium-foreground",
                };

            case "low":
                return {
                    box: "bg-priority-low",
                    text: "text-priority-low-foreground",
                };
        }
    };

    const priorityStyle = getPriorityStyle(
        ticket.priority
    );

    return (
        <View className="flex-1 bg-background">
            {/* Header */}
            <View className="border-b border-border bg-card px-5 pb-4 pt-5">
                <View className="flex-row items-center">
                    <Pressable
                        onPress={() => router.back()}
                        className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-muted"
                    >
                        <Feather
                            name="arrow-left"
                            size={21}
                            color="#6B7280"
                        />
                    </Pressable>

                    <View className="flex-1">
                        <Text className="text-xl font-extrabold text-foreground">
                            Ticket Details
                        </Text>

                        <Text className="mt-0.5 text-xs text-muted-foreground">
                            {ticket.id}
                        </Text>
                    </View>

                    <View
                        className={`rounded-full px-3 py-1.5 ${priorityStyle.box}`}
                    >
                        <Text
                            className={`text-[10px] font-extrabold uppercase ${priorityStyle.text}`}
                        >
                            {ticket.priority}
                        </Text>
                    </View>
                </View>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingTop: 20,
                    paddingBottom: 50,
                }}
            >
                {/* Main ticket */}
                <View className="rounded-[24px] border border-border bg-card p-5">
                    <View className="mb-4 h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                        <Feather
                            name="alert-triangle"
                            size={23}
                            color="#DC2626"
                        />
                    </View>

                    <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Service Ticket
                    </Text>

                    <Text className="mt-1 text-2xl font-extrabold text-foreground">
                        {ticket.title}
                    </Text>

                    <View className="mt-4 flex-row items-center">
                        <Feather
                            name="map-pin"
                            size={15}
                            color="#6B7280"
                        />

                        <Text className="ml-2 text-sm text-muted-foreground">
                            {ticket.location ??
                                "Location not provided"}
                        </Text>
                    </View>
                </View>

                {/* Issue */}
                <Text className="mb-3 mt-7 text-lg font-extrabold text-foreground">
                    Issue Description
                </Text>

                <View className="rounded-[24px] border border-border bg-card p-5">
                    <Text className="text-sm leading-6 text-foreground">
                        {ticket.description ??
                            "No description provided."}
                    </Text>
                </View>

                {/* Ticket information */}
                <Text className="mb-3 mt-7 text-lg font-extrabold text-foreground">
                    Ticket Information
                </Text>

                <View className="rounded-[24px] border border-border bg-card p-5">
                    <InfoRow
                        label="Priority"
                        value={
                            ticket.priority
                                .charAt(0)
                                .toUpperCase() +
                            ticket.priority.slice(1)
                        }
                    />

                    <Divider />

                    <InfoRow
                        label="Status"
                        value={formatStatus(
                            ticket.status
                        )}
                    />

                    <Divider />

                    <InfoRow
                        label="Solar Asset"
                        value={
                            ticket.assetId ??
                            "No asset linked"
                        }
                    />

                    <Divider />

                    <InfoRow
                        label="Assigned Technician"
                        value={
                            ticket.assignedTechnicianId ??
                            "Not assigned"
                        }
                    />

                    <Divider />

                    <InfoRow
                        label="Reported By"
                        value={ticket.reportedBy}
                    />
                </View>

                {/* Timeline */}
                <Text className="mb-3 mt-7 text-lg font-extrabold text-foreground">
                    Ticket Timeline
                </Text>

                <View className="rounded-[24px] border border-border bg-card p-5">
                    <InfoRow
                        label="Created"
                        value={formatDate(
                            ticket.createdAt
                        )}
                    />

                    <Divider />

                    <InfoRow
                        label="Last Updated"
                        value={formatDate(
                            ticket.updatedAt
                        )}
                    />

                    <Divider />

                    <InfoRow
                        label="Resolved"
                        value={formatDate(
                            ticket.resolvedAt
                        )}
                    />
                </View>

                {/* CESA-201 comes next */}
                <Text className="mb-3 mt-7 text-lg font-extrabold text-foreground">
                    Technician Actions
                </Text>

                <View className="rounded-[24px] border border-border bg-card p-5">
                    <Text className="text-sm leading-6 text-muted-foreground">
                        Ticket status and technician
                        assignment actions will be
                        available here.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

const InfoRow = ({
    label,
    value,
}: {
    label: string;
    value: string;
}) => {
    return (
        <View className="flex-row items-center justify-between">
            <Text className="mr-4 text-sm text-muted-foreground">
                {label}
            </Text>

            <Text className="max-w-[60%] text-right text-sm font-bold text-foreground">
                {value}
            </Text>
        </View>
    );
};

const Divider = () => (
    <View className="my-4 h-px bg-border" />
);

export default TicketDetailsScreen;