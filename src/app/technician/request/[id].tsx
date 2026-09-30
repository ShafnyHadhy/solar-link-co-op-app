import { useUser } from "@clerk/expo";
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
    Alert,
    Pressable,
    ScrollView,
    Text,
    TextInput,
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
    const { id } =
        useLocalSearchParams<{ id: string }>();

    const { user } = useUser();

    const [ticket, setTicket] =
        useState<ServiceTicket | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    const [updatingStatus, setUpdatingStatus] =
        useState(false);

    // CESA-205 - Maintenance diagnosis
    const [diagnosis, setDiagnosis] =
        useState("");

    const [savingDiagnosis, setSavingDiagnosis] =
        useState(false);

    // CESA-206 - Replaced parts
    const [maintenanceRecordId, setMaintenanceRecordId] =
        useState<string | null>(null);

    const [partsUsed, setPartsUsed] =
        useState("");

    const [savingParts, setSavingParts] =
        useState(false);

    // CESA-207 - Maintenance notes
    const [maintenanceNotes, setMaintenanceNotes] =
        useState("");

    const [savingNotes, setSavingNotes] =
        useState(false);

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
                    `/api/service-tickets/${encodeURIComponent(
                        id
                    )}`
                );

                const result =
                    await response.json();

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

    const formatStatus = (
        status: TicketStatus
    ) =>
        status
            .replace("_", " ")
            .replace(/\b\w/g, (letter) =>
                letter.toUpperCase()
            );

    const formatDate = (
        date: string | null
    ) => {
        if (!date) {
            return "Not available";
        }

        return new Date(
            date
        ).toLocaleString();
    };

    // CESA-201 - Update ticket status
    const updateStatus = async (
        newStatus: TicketStatus
    ) => {
        if (!ticket || updatingStatus) {
            return;
        }

        try {
            setUpdatingStatus(true);

            const response = await fetch(
                `/api/service-tickets/${encodeURIComponent(
                    ticket.id
                )}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        status: newStatus,
                    }),
                }
            );

            const result =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ??
                        "Failed to update ticket status"
                );
            }

            const updatedTicket =
                result.data?.ticket ??
                result.ticket ??
                null;

            if (!updatedTicket) {
                throw new Error(
                    "Updated ticket was not returned"
                );
            }

            setTicket(updatedTicket);

            Alert.alert(
                "Status Updated",
                `Ticket status changed to ${formatStatus(
                    newStatus
                )}.`
            );
        } catch (err) {
            console.error(
                "Failed to update ticket status:",
                err
            );

            Alert.alert(
                "Update Failed",
                err instanceof Error
                    ? err.message
                    : "Failed to update ticket status"
            );
        } finally {
            setUpdatingStatus(false);
        }
    };

    // CESA-202 - Assign ticket to
    // currently logged-in technician
    const assignToMe = async () => {
        if (!ticket) {
            return;
        }

        if (!user?.id) {
            Alert.alert(
                "Assignment Failed",
                "Unable to identify the logged-in technician."
            );
            return;
        }

        try {
            setUpdatingStatus(true);

            const response = await fetch(
                `/api/service-tickets/${encodeURIComponent(
                    ticket.id
                )}`,
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        technicianId:
                            user.id,
                    }),
                }
            );

            const result =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ??
                        "Failed to assign ticket"
                );
            }

            const updatedTicket =
                result.data?.ticket ??
                result.ticket ??
                null;

            if (!updatedTicket) {
                throw new Error(
                    "Updated ticket was not returned"
                );
            }

            setTicket(updatedTicket);

            Alert.alert(
                "Ticket Assigned",
                "This service ticket has been assigned to you."
            );
        } catch (err) {
            console.error(
                "Failed to assign ticket:",
                err
            );

            Alert.alert(
                "Assignment Failed",
                err instanceof Error
                    ? err.message
                    : "Failed to assign ticket"
            );
        } finally {
            setUpdatingStatus(false);
        }
    };

    // CESA-205 - Save technician diagnosis
    const saveDiagnosis = async () => {
        if (!ticket || savingDiagnosis) {
            return;
        }

        if (!user?.id) {
            Alert.alert(
                "Save Failed",
                "Unable to identify the logged-in technician."
            );
            return;
        }

        const cleanedDiagnosis = diagnosis.trim();

        if (!cleanedDiagnosis) {
            Alert.alert(
                "Diagnosis Required",
                "Please enter the diagnosis before saving."
            );
            return;
        }

        try {
            setSavingDiagnosis(true);

            const response = await fetch(
                "/api/maintenance-records",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        ticketId: ticket.id,
                        technicianId: user.id,
                        diagnosis: cleanedDiagnosis,
                    }),
                }
            );

            const result = await response.json();
            console.log("CESA-205 STATUS:", response.status);
            console.log("CESA-205 RESPONSE:", result);

            if (!response.ok) {
                throw new Error(
                    result.message ??
                        "Failed to save diagnosis"
                );
            }

            const createdRecord =
                result.data?.record ??
                result.record ??
                null;

            if (!createdRecord?.id) {
                throw new Error(
                    "Maintenance record ID was not returned"
                );
            }

            setMaintenanceRecordId(createdRecord.id);
            console.log(
                "MAINTENANCE RECORD ID:",
                createdRecord.id
            );
            setDiagnosis("");

            Alert.alert(
                "Diagnosis Saved",
                "The maintenance diagnosis has been recorded successfully."
            );
        } catch (err) {
            console.error(
                "Failed to save diagnosis:",
                err
            );

            Alert.alert(
                "Save Failed",
                err instanceof Error
                    ? err.message
                    : "Failed to save diagnosis"
            );
        } finally {
            setSavingDiagnosis(false);
        }
    };

    // CESA-206 - Save replaced parts
    const saveReplacedParts = async () => {
        if (savingParts) {
            return;
        }

        if (!maintenanceRecordId) {
            Alert.alert(
                "Diagnosis Required",
                "Save the diagnosis first before recording replaced parts."
            );
            return;
        }

        const cleanedParts = partsUsed.trim();

        if (!cleanedParts) {
            Alert.alert(
                "Parts Required",
                "Please enter the replaced parts."
            );
            return;
        }

        try {
            setSavingParts(true);

            const response = await fetch(
                "/api/maintenance-records",
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        recordId: maintenanceRecordId,
                        partsUsed: cleanedParts,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ??
                        "Failed to save replaced parts"
                );
            }

            setPartsUsed("");

            Alert.alert(
                "Parts Saved",
                "The replaced parts have been recorded successfully."
            );
        } catch (err) {
            console.error(
                "Failed to save replaced parts:",
                err
            );

            Alert.alert(
                "Save Failed",
                err instanceof Error
                    ? err.message
                    : "Failed to save replaced parts"
            );
        } finally {
            setSavingParts(false);
        }
    };

    // CESA-207 - Save maintenance notes
    const saveMaintenanceNotes = async () => {
        if (savingNotes) {
            return;
        }

        if (!maintenanceRecordId) {
            Alert.alert(
                "Diagnosis Required",
                "Save the diagnosis first before recording maintenance notes."
            );
            return;
        }

        const cleanedNotes = maintenanceNotes.trim();

        if (!cleanedNotes) {
            Alert.alert(
                "Notes Required",
                "Please enter maintenance notes."
            );
            return;
        }

        try {
            setSavingNotes(true);

            const response = await fetch(
                "/api/maintenance-records",
                {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        recordId: maintenanceRecordId,
                        notes: cleanedNotes,
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.message ??
                        "Failed to save maintenance notes"
                );
            }

            setMaintenanceNotes("");

            Alert.alert(
                "Notes Saved",
                "The maintenance notes have been recorded successfully."
            );
        } catch (err) {
            console.error(
                "Failed to save maintenance notes:",
                err
            );

            Alert.alert(
                "Save Failed",
                err instanceof Error
                    ? err.message
                    : "Failed to save maintenance notes"
            );
        } finally {
            setSavingNotes(false);
        }
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

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-background">
                <ActivityIndicator
                    size="large"
                />

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
                    onPress={() =>
                        router.back()
                    }
                    className="mt-6 rounded-xl bg-primary px-6 py-3"
                >
                    <Text className="font-bold text-primary-foreground">
                        Go Back
                    </Text>
                </Pressable>
            </View>
        );
    }

    const priorityStyle =
        getPriorityStyle(
            ticket.priority
        );

    const statuses: TicketStatus[] = [
        "open",
        "assigned",
        "in_progress",
        "resolved",
        "closed",
    ];

    const assignedToCurrentUser =
        ticket.assignedTechnicianId ===
        user?.id;

    return (
        <View className="flex-1 bg-background">
            {/* Header */}
            <View className="border-b border-border bg-card px-5 pb-4 pt-5">
                <View className="flex-row items-center">
                    <Pressable
                        onPress={() =>
                            router.back()
                        }
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
                showsVerticalScrollIndicator={
                    false
                }
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingTop: 20,
                    paddingBottom: 50,
                }}
            >
                {/* Main Ticket */}
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

                {/* Issue Description */}
                <Text className="mb-3 mt-7 text-lg font-extrabold text-foreground">
                    Issue Description
                </Text>

                <View className="rounded-[24px] border border-border bg-card p-5">
                    <Text className="text-sm leading-6 text-foreground">
                        {ticket.description ??
                            "No description provided."}
                    </Text>
                </View>

                {/* Ticket Information */}
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
                            ticket.priority.slice(
                                1
                            )
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
                            assignedToCurrentUser
                                ? "Assigned to me"
                                : ticket.assignedTechnicianId ??
                                  "Not assigned"
                        }
                    />

                    <Divider />

                    <InfoRow
                        label="Reported By"
                        value={
                            ticket.reportedBy
                        }
                    />
                </View>

                {/* Ticket Timeline */}
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

                {/* Technician Actions */}
                <Text className="mb-3 mt-7 text-lg font-extrabold text-foreground">
                    Technician Actions
                </Text>

                {/* Assignment */}
                <View className="rounded-[24px] border border-border bg-card p-5">
                    <View className="flex-row items-center">
                        <View className="h-10 w-10 items-center justify-center rounded-xl bg-muted">
                            <Feather
                                name="user-check"
                                size={18}
                                color="#6B7280"
                            />
                        </View>

                        <View className="ml-3 flex-1">
                            <Text className="text-sm font-bold text-foreground">
                                Ticket Assignment
                            </Text>

                            <Text className="mt-1 text-xs text-muted-foreground">
                                {assignedToCurrentUser
                                    ? "This ticket is assigned to you."
                                    : ticket.assignedTechnicianId
                                      ? "This ticket is already assigned."
                                      : "Take responsibility for this service ticket."}
                            </Text>
                        </View>
                    </View>

                    {!ticket.assignedTechnicianId && (
                        <Pressable
                            disabled={
                                updatingStatus ||
                                !user?.id
                            }
                            onPress={
                                assignToMe
                            }
                            className={`mt-4 items-center rounded-xl px-4 py-3 ${
                                updatingStatus ||
                                !user?.id
                                    ? "bg-muted"
                                    : "bg-primary"
                            }`}
                        >
                            <Text
                                className={`font-bold ${
                                    updatingStatus ||
                                    !user?.id
                                        ? "text-muted-foreground"
                                        : "text-primary-foreground"
                                }`}
                            >
                                {updatingStatus
                                    ? "Assigning..."
                                    : "Assign to Me"}
                            </Text>
                        </Pressable>
                    )}

                    {assignedToCurrentUser && (
                        <View className="mt-4 flex-row items-center rounded-xl bg-muted p-3">
                            <Feather
                                name="check-circle"
                                size={18}
                                color="#6B7280"
                            />

                            <Text className="ml-2 text-sm font-bold text-foreground">
                                Assigned to Me
                            </Text>
                        </View>
                    )}
                </View>

                {/* CESA-205 - Record Diagnosis */}
                <Text className="mb-3 mt-7 text-lg font-extrabold text-foreground">
                    Maintenance Diagnosis
                </Text>

                <View className="rounded-[24px] border border-border bg-card p-5">
                    <View className="mb-4 flex-row items-center">
                        <View className="h-10 w-10 items-center justify-center rounded-xl bg-muted">
                            <Feather
                                name="clipboard"
                                size={18}
                                color="#6B7280"
                            />
                        </View>

                        <View className="ml-3 flex-1">
                            <Text className="text-sm font-bold text-foreground">
                                Record Diagnosis
                            </Text>

                            <Text className="mt-1 text-xs text-muted-foreground">
                                Record your diagnosis for this service ticket.
                            </Text>
                        </View>
                    </View>

                    <TextInput
                        value={diagnosis}
                        onChangeText={setDiagnosis}
                        placeholder="Enter diagnosis..."
                        placeholderTextColor="#9CA3AF"
                        multiline
                        textAlignVertical="top"
                        editable={!savingDiagnosis}
                        className="min-h-[120px] rounded-xl border border-border bg-background p-4 text-sm text-foreground"
                    />

                    <Pressable
                        disabled={
                            savingDiagnosis ||
                            !diagnosis.trim() ||
                            !user?.id
                        }
                        onPress={saveDiagnosis}
                        className={`mt-4 items-center rounded-xl px-4 py-3 ${
                            savingDiagnosis ||
                            !diagnosis.trim() ||
                            !user?.id
                                ? "bg-muted"
                                : "bg-primary"
                        }`}
                    >
                        {savingDiagnosis ? (
                            <View className="flex-row items-center">
                                <ActivityIndicator size="small" />

                                <Text className="ml-2 font-bold text-muted-foreground">
                                    Saving...
                                </Text>
                            </View>
                        ) : (
                            <Text
                                className={`font-bold ${
                                    !diagnosis.trim() ||
                                    !user?.id
                                        ? "text-muted-foreground"
                                        : "text-primary-foreground"
                                }`}
                            >
                                Save Diagnosis
                            </Text>
                        )}
                    </Pressable>
                </View>

                {/* CESA-206 - Record Replaced Parts */}
                <Text className="mb-3 mt-7 text-lg font-extrabold text-foreground">
                    Replaced Parts
                </Text>

                <View className="rounded-[24px] border border-border bg-card p-5">
                    <View className="mb-4 flex-row items-center">
                        <View className="h-10 w-10 items-center justify-center rounded-xl bg-muted">
                            <Feather
                                name="tool"
                                size={18}
                                color="#6B7280"
                            />
                        </View>

                        <View className="ml-3 flex-1">
                            <Text className="text-sm font-bold text-foreground">
                                Record Replaced Parts
                            </Text>

                            <Text className="mt-1 text-xs text-muted-foreground">
                                Record any components replaced during maintenance.
                            </Text>
                        </View>
                    </View>

                    <TextInput
                        value={partsUsed}
                        onChangeText={setPartsUsed}
                        placeholder="Example: Inverter fuse, DC cable..."
                        placeholderTextColor="#9CA3AF"
                        multiline
                        textAlignVertical="top"
                        editable={
                            !savingParts &&
                            !!maintenanceRecordId
                        }
                        className="min-h-[100px] rounded-xl border border-border bg-background p-4 text-sm text-foreground"
                    />

                    {!maintenanceRecordId && (
                        <Text className="mt-2 text-xs text-muted-foreground">
                            Save the diagnosis first to enable replaced parts.
                        </Text>
                    )}

                    <Pressable
                        disabled={
                            savingParts ||
                            !partsUsed.trim() ||
                            !maintenanceRecordId
                        }
                        onPress={saveReplacedParts}
                        className={`mt-4 items-center rounded-xl px-4 py-3 ${
                            savingParts ||
                            !partsUsed.trim() ||
                            !maintenanceRecordId
                                ? "bg-muted"
                                : "bg-primary"
                        }`}
                    >
                        <Text
                            className={`font-bold ${
                                savingParts ||
                                !partsUsed.trim() ||
                                !maintenanceRecordId
                                    ? "text-muted-foreground"
                                    : "text-primary-foreground"
                            }`}
                        >
                            {savingParts
                                ? "Saving..."
                                : "Save Replaced Parts"}
                        </Text>
                    </Pressable>
                </View>

                {/* CESA-207 - Maintenance Notes */}
                <Text className="mb-3 mt-7 text-lg font-extrabold text-foreground">
                    Maintenance Notes
                </Text>

                <View className="rounded-[24px] border border-border bg-card p-5">
                    <View className="mb-4 flex-row items-center">
                        <View className="h-10 w-10 items-center justify-center rounded-xl bg-muted">
                            <Feather
                                name="file-text"
                                size={18}
                                color="#6B7280"
                            />
                        </View>

                        <View className="ml-3 flex-1">
                            <Text className="text-sm font-bold text-foreground">
                                Record Maintenance Notes
                            </Text>

                            <Text className="mt-1 text-xs text-muted-foreground">
                                Add notes about the maintenance work performed.
                            </Text>
                        </View>
                    </View>

                    <TextInput
                        value={maintenanceNotes}
                        onChangeText={setMaintenanceNotes}
                        placeholder="Example: Inspected inverter and replaced damaged fuse..."
                        placeholderTextColor="#9CA3AF"
                        multiline
                        textAlignVertical="top"
                        editable={
                            !savingNotes &&
                            !!maintenanceRecordId
                        }
                        className="min-h-[120px] rounded-xl border border-border bg-background p-4 text-sm text-foreground"
                    />

                    {!maintenanceRecordId && (
                        <Text className="mt-2 text-xs text-muted-foreground">
                            Save the diagnosis first to enable maintenance notes.
                        </Text>
                    )}

                    <Pressable
                        disabled={
                            savingNotes ||
                            !maintenanceNotes.trim() ||
                            !maintenanceRecordId
                        }
                        onPress={saveMaintenanceNotes}
                        className={`mt-4 items-center rounded-xl px-4 py-3 ${
                            savingNotes ||
                            !maintenanceNotes.trim() ||
                            !maintenanceRecordId
                                ? "bg-muted"
                                : "bg-primary"
                        }`}
                    >
                        <Text
                            className={`font-bold ${
                                savingNotes ||
                                !maintenanceNotes.trim() ||
                                !maintenanceRecordId
                                    ? "text-muted-foreground"
                                    : "text-primary-foreground"
                            }`}
                        >
                            {savingNotes
                                ? "Saving..."
                                : "Save Maintenance Notes"}
                        </Text>
                    </Pressable>
                </View>

                {/* Status Update */}
                <View className="mt-4 rounded-[24px] border border-border bg-card p-5">
                    <View className="mb-4 flex-row items-center">
                        <View className="h-10 w-10 items-center justify-center rounded-xl bg-muted">
                            <Feather
                                name="refresh-cw"
                                size={18}
                                color="#6B7280"
                            />
                        </View>

                        <View className="ml-3 flex-1">
                            <Text className="text-sm font-bold text-foreground">
                                Update Status
                            </Text>

                            <Text className="mt-1 text-xs text-muted-foreground">
                                Current:{" "}
                                {formatStatus(
                                    ticket.status
                                )}
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row flex-wrap gap-2">
                        {statuses.map(
                            (status) => {
                                const selected =
                                    ticket.status ===
                                    status;

                                return (
                                    <Pressable
                                        key={
                                            status
                                        }
                                        disabled={
                                            updatingStatus ||
                                            selected
                                        }
                                        onPress={() =>
                                            updateStatus(
                                                status
                                            )
                                        }
                                        className={`rounded-xl border px-4 py-3 ${
                                            selected
                                                ? "border-primary bg-primary"
                                                : "border-border bg-card"
                                        }`}
                                    >
                                        <Text
                                            className={`text-xs font-bold ${
                                                selected
                                                    ? "text-primary-foreground"
                                                    : "text-foreground"
                                            }`}
                                        >
                                            {formatStatus(
                                                status
                                            )}
                                        </Text>
                                    </Pressable>
                                );
                            }
                        )}
                    </View>

                    {updatingStatus && (
                        <View className="mt-4 flex-row items-center">
                            <ActivityIndicator
                                size="small"
                            />

                            <Text className="ml-2 text-xs text-muted-foreground">
                                Updating...
                            </Text>
                        </View>
                    )}
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