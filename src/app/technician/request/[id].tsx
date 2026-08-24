import {
    faultDetails,
    serviceRequests,
} from '@/data/technicianData';
import { Feather } from '@expo/vector-icons';
import {
    router,
    useLocalSearchParams,
} from 'expo-router';
import React from 'react';
import {
    Alert,
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native';

const FaultDetailsScreen = () => {
    const { id } = useLocalSearchParams<{ id: string }>();

    const request = serviceRequests.find(
        (item) => item.id === id
    );

    const details = faultDetails.find(
        (item) => item.requestId === id
    );

    if (!request || !details) {
        return (
            <View className="flex-1 items-center justify-center bg-background px-6">
                <Feather
                    name="alert-circle"
                    size={40}
                    color="#9CA3AF"
                />

                <Text className="mt-4 text-xl font-bold text-foreground">
                    Request not found
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

    const getStatusStyle = () => {
        if (request.status === 'Critical') {
            return {
                box: 'bg-priority-high',
                text: 'text-priority-high-foreground',
            };
        }

        if (request.status === 'Warning') {
            return {
                box: 'bg-priority-medium',
                text: 'text-priority-medium-foreground',
            };
        }

        if (request.status === 'Normal') {
            return {
                box: 'bg-priority-low',
                text: 'text-priority-low-foreground',
            };
        }

        return {
            box: 'bg-secondary',
            text: 'text-secondary-foreground',
        };
    };

    const statusStyle = getStatusStyle();

    const showFrontendMessage = (title: string) => {
        Alert.alert(
            title,
            'Frontend demonstration only. No backend action is performed.'
        );
    };

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
                            Fault Details
                        </Text>

                        <Text className="mt-0.5 text-xs text-muted-foreground">
                            {request.id}
                        </Text>
                    </View>

                    <View
                        className={`rounded-full px-3 py-1.5 ${statusStyle.box}`}
                    >
                        <Text
                            className={`text-[10px] font-extrabold uppercase ${statusStyle.text}`}
                        >
                            {request.status}
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
                {/* Main fault information */}
                <View className="rounded-[24px] border border-border bg-card p-5">
                    <View className="mb-4 h-12 w-12 items-center justify-center rounded-2xl bg-priority-high">
                        <Feather
                            name="alert-triangle"
                            size={23}
                            color="#DC2626"
                        />
                    </View>

                    <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Fault Type
                    </Text>

                    <Text className="mt-1 text-2xl font-extrabold text-foreground">
                        {details.faultType}
                    </Text>

                    <View className="mt-4 flex-row items-center">
                        <Feather
                            name="map-pin"
                            size={15}
                            color="#6B7280"
                        />

                        <Text className="ml-2 text-sm text-muted-foreground">
                            {request.systemName} • {request.location}
                        </Text>
                    </View>
                </View>

                {/* Fault information */}
                <Text className="mb-3 mt-7 text-lg font-extrabold text-foreground">
                    Fault Information
                </Text>

                <View className="rounded-[24px] border border-border bg-card p-5">
                    <InfoRow
                        label="Severity"
                        value={request.severity}
                    />

                    <Divider />

                    <InfoRow
                        label="Error Code"
                        value={details.errorCode}
                    />

                    <Divider />

                    <InfoRow
                        label="Detected"
                        value={details.detectedTime}
                    />

                    <Divider />

                    <InfoRow
                        label="Affected Equipment"
                        value={request.equipment}
                    />
                </View>

                {/* Performance */}
                <Text className="mb-3 mt-7 text-lg font-extrabold text-foreground">
                    System Performance
                </Text>

                <View className="flex-row gap-3">
                    <View className="flex-1 rounded-[22px] border border-border bg-card p-4">
                        <Text className="text-xs text-muted-foreground">
                            Current
                        </Text>

                        <Text className="mt-2 text-2xl font-extrabold text-foreground">
                            {details.currentPerformance}
                        </Text>

                        <Text className="mt-1 text-xs text-muted-foreground">
                            Current output
                        </Text>
                    </View>

                    <View className="flex-1 rounded-[22px] border border-border bg-card p-4">
                        <Text className="text-xs text-muted-foreground">
                            Expected
                        </Text>

                        <Text className="mt-2 text-2xl font-extrabold text-foreground">
                            {details.expectedPerformance}
                        </Text>

                        <Text className="mt-1 text-xs text-muted-foreground">
                            Normal output
                        </Text>
                    </View>
                </View>

                {/* Equipment details */}
                <Text className="mb-3 mt-7 text-lg font-extrabold text-foreground">
                    Equipment Details
                </Text>

                <View className="rounded-[24px] border border-border bg-card p-5">
                    <View className="mb-4 flex-row items-center">
                        <View className="h-11 w-11 items-center justify-center rounded-xl bg-muted">
                            <Feather
                                name="cpu"
                                size={20}
                                color="#6B7280"
                            />
                        </View>

                        <View className="ml-3 flex-1">
                            <Text className="text-xs text-muted-foreground">
                                Equipment
                            </Text>

                            <Text className="mt-1 text-base font-bold text-foreground">
                                {request.equipment}
                            </Text>
                        </View>
                    </View>

                    <InfoRow
                        label="Model"
                        value={details.equipmentModel}
                    />

                    <Divider />

                    <InfoRow
                        label="Serial Number"
                        value={details.equipmentSerial}
                    />

                    <Divider />

                    <InfoRow
                        label="Installed"
                        value={details.installationDate}
                    />
                </View>

                {/* Previous fault history */}
                <Text className="mb-3 mt-7 text-lg font-extrabold text-foreground">
                    Previous Fault History
                </Text>

                <View className="rounded-[24px] border border-border bg-card p-5">
                    {details.previousFaults.length === 0 ? (
                        <View className="items-center py-5">
                            <Feather
                                name="check-circle"
                                size={26}
                                color="#16A34A"
                            />

                            <Text className="mt-3 text-sm font-semibold text-foreground">
                                No previous faults
                            </Text>
                        </View>
                    ) : (
                        details.previousFaults.map(
                            (fault, index) => (
                                <View key={`${fault.date}-${index}`}>
                                    <View className="flex-row">
                                        <View className="mt-1 h-9 w-9 items-center justify-center rounded-xl bg-muted">
                                            <Feather
                                                name="clock"
                                                size={16}
                                                color="#6B7280"
                                            />
                                        </View>

                                        <View className="ml-3 flex-1">
                                            <View className="flex-row items-start justify-between">
                                                <Text className="mr-3 flex-1 text-sm font-bold text-foreground">
                                                    {fault.issue}
                                                </Text>

                                                <Text className="text-xs font-semibold text-muted-foreground">
                                                    {fault.status}
                                                </Text>
                                            </View>

                                            <Text className="mt-1 text-xs text-muted-foreground">
                                                {fault.date}
                                            </Text>
                                        </View>
                                    </View>

                                    {index <
                                        details.previousFaults
                                            .length -
                                            1 && (
                                        <View className="my-4 h-px bg-border" />
                                    )}
                                </View>
                            )
                        )
                    )}
                </View>

                {/* Maintenance history */}
                <Text className="mb-3 mt-7 text-lg font-extrabold text-foreground">
                    Maintenance History
                </Text>

                <View className="rounded-[24px] border border-border bg-card p-5">
                    {details.maintenanceHistory.map(
                        (item, index) => (
                            <View key={`${item.date}-${index}`}>
                                <View className="flex-row">
                                    <View className="mt-1 h-9 w-9 items-center justify-center rounded-xl bg-muted">
                                        <Feather
                                            name="tool"
                                            size={16}
                                            color="#6B7280"
                                        />
                                    </View>

                                    <View className="ml-3 flex-1">
                                        <Text className="text-sm font-bold text-foreground">
                                            {item.action}
                                        </Text>

                                        <Text className="mt-1 text-xs text-muted-foreground">
                                            {item.date}
                                        </Text>

                                        <Text className="mt-1 text-xs text-muted-foreground">
                                            {item.technician}
                                        </Text>
                                    </View>
                                </View>

                                {index <
                                    details.maintenanceHistory
                                        .length -
                                        1 && (
                                    <View className="my-4 h-px bg-border" />
                                )}
                            </View>
                        )
                    )}
                </View>

                {/* Recommended Action */}
                <Text className="mb-3 mt-7 text-lg font-extrabold text-foreground">
                    Recommended Action
                </Text>

                <View className="rounded-[24px] border border-border bg-card p-5">
                    <View className="flex-row">
                        <View className="h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                            <Feather
                                name="info"
                                size={18}
                                color="#D97706"
                            />
                        </View>

                        <Text className="ml-3 flex-1 text-sm leading-6 text-foreground">
                            {details.recommendedAction}
                        </Text>
                    </View>
                </View>

                {/* Technician actions */}
                <Text className="mb-3 mt-7 text-lg font-extrabold text-foreground">
                    Technician Actions
                </Text>

                <Pressable
                    onPress={() =>
                        showFrontendMessage(
                            'Resolve Remotely'
                        )
                    }
                    className="mb-3 flex-row items-center justify-center rounded-2xl bg-primary py-4 active:opacity-80"
                >
                    <Feather
                        name="wifi"
                        size={18}
                        color="#1F1F1F"
                    />

                    <Text className="ml-2 font-extrabold text-primary-foreground">
                        Resolve Remotely
                    </Text>
                </Pressable>

                <Pressable
                    onPress={() =>
                        showFrontendMessage(
                            'Start Maintenance'
                        )
                    }
                    className="mb-3 flex-row items-center justify-center rounded-2xl bg-foreground py-4 active:opacity-80"
                >
                    <Feather
                        name="tool"
                        size={18}
                        color="#FFFFFF"
                    />

                    <Text className="ml-2 font-extrabold text-background">
                        Start Maintenance
                    </Text>
                </Pressable>

                <View className="flex-row gap-3">
                    <Pressable
                        onPress={() =>
                            showFrontendMessage(
                                'Update Status'
                            )
                        }
                        className="flex-1 items-center rounded-2xl border border-border bg-card py-4"
                    >
                        <Feather
                            name="refresh-cw"
                            size={18}
                            color="#6B7280"
                        />

                        <Text className="mt-2 text-xs font-bold text-foreground">
                            Update Status
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={() =>
                            showFrontendMessage(
                                'Technician Notes'
                            )
                        }
                        className="flex-1 items-center rounded-2xl border border-border bg-card py-4"
                    >
                        <Feather
                            name="edit-3"
                            size={18}
                            color="#6B7280"
                        />

                        <Text className="mt-2 text-xs font-bold text-foreground">
                            Add Notes
                        </Text>
                    </Pressable>
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

export default FaultDetailsScreen;