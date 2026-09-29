import TabScreenBackground from "@/components/shared/TabScreenBackground";
import {
    useHouseholdEnergyRequests,
    type HouseholdEnergyRequest,
} from "@/hooks/household/useHouseholdEnergyRequests";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import React, { useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";

type ActiveTab = "create" | "requests";
type StatusFilter = "all" | "pending" | "approved" | "rejected" | "fulfilled" | "cancelled";

const PURPOSE_OPTIONS = [
    { label: "Household Usage", icon: "home", color: "#60A5FA" },
    { label: "Appliance Operation", icon: "cpu", color: "#22C55E" },
    { label: "EV Charging", icon: "battery-charging", color: "#38BDF8" },
    { label: "Medical Equipment", icon: "activity", color: "#F87171" },
    { label: "Other Purpose", icon: "settings", color: "#FBBF24" },
];

const DURATION_OPTIONS = ["1 Day", "3 Days", "1 Week", "1 Month"];
const PRIORITY_OPTIONS = ["Low", "Medium", "High"];
const PRESET_AMOUNTS = [5, 10, 20, 50];

function formatDate(dateStr: string) {
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return dateStr;
    }
}

interface HouseholdEnergyProps {
    initialTab?: ActiveTab;
    initialFilter?: StatusFilter;
}

const HouseholdEnergy = ({
    initialTab = "create",
    initialFilter = "all",
}: HouseholdEnergyProps) => {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === "dark";

    const {
        requests,
        stats,
        loading,
        submitting,
        error: hookError,
        refetch,
        createRequest,
        cancelRequest,
    } = useHouseholdEnergyRequests();

    // Tab state
    const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialFilter);
    const [searchQuery, setSearchQuery] = useState("");

    React.useEffect(() => {
        if (initialTab) setActiveTab(initialTab);
    }, [initialTab]);

    React.useEffect(() => {
        if (initialFilter) setStatusFilter(initialFilter);
    }, [initialFilter]);

    // Form state
    const [energyAmount, setEnergyAmount] = useState("");
    const [duration, setDuration] = useState("1 Day");
    const [purpose, setPurpose] = useState("Household Usage");
    const [priority, setPriority] = useState("Medium");
    const [notes, setNotes] = useState("");
    const [formError, setFormError] = useState("");

    // Modals & UI feedback
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [lastCreatedRequest, setLastCreatedRequest] = useState<HouseholdEnergyRequest | null>(null);
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    // Theme color map
    const theme = {
        background: isDark ? "bg-background" : "bg-gray-50",
        text: isDark ? "text-white" : "text-gray-900",
        textSecondary: isDark ? "text-zinc-300" : "text-gray-600",
        textMuted: isDark ? "text-zinc-400" : "text-gray-500",
        card: isDark ? "bg-card/90" : "bg-white",
        cardBorder: isDark ? "border-border/60" : "border-gray-200",
        inputBg: isDark ? "bg-white/5" : "bg-gray-100",
        inputBorder: isDark ? "border-white/10" : "border-gray-300",
        inputText: isDark ? "text-white" : "text-gray-900",
        inputPlaceholder: isDark ? "#A1A1AA" : "#9CA3AF",
        selectedBg: isDark ? "bg-primary/20 border-primary" : "bg-amber-100 border-amber-500",
        selectedText: isDark ? "text-primary font-bold" : "text-amber-900 font-bold",
        unselectedBg: isDark ? "bg-card border-border/40" : "bg-gray-100 border-gray-200",
        unselectedText: isDark ? "text-zinc-300" : "text-gray-700",
        modalBg: isDark ? "bg-zinc-900" : "bg-white",
        modalBorder: isDark ? "border-white/10" : "border-gray-200",
        submitBg: isDark ? "#F59E0B" : "#D97706",
        submitText: isDark ? "text-amber-950 font-extrabold" : "text-white font-extrabold",
    };

    // Filtered requests for the "My Requests" tab
    const filteredRequests = useMemo(() => {
        return requests.filter((req) => {
            const matchesStatus =
                statusFilter === "all" ? true : req.status === statusFilter;

            const q = searchQuery.toLowerCase().trim();
            const matchesSearch =
                !q ||
                (req.reason && req.reason.toLowerCase().includes(q)) ||
                req.requestedEnergyKwh.includes(q) ||
                req.id.toLowerCase().includes(q);

            return matchesStatus && matchesSearch;
        });
    }, [requests, statusFilter, searchQuery]);

    const pendingCount = useMemo(
        () => requests.filter((r) => r.status === "pending").length,
        [requests]
    );

    // Form submission handler
    const handleSubmit = async () => {
        const val = parseFloat(energyAmount);
        if (isNaN(val) || val <= 0) {
            setFormError("Please enter a valid energy amount greater than 0 kWh.");
            return;
        }

        setFormError("");

        try {
            const created = await createRequest({
                requestedEnergyKwh: val,
                duration,
                purpose,
                priority,
                notes: notes.trim() || undefined,
            });

            setLastCreatedRequest(created);
            setShowSuccessModal(true);
        } catch (err: any) {
            setFormError(err?.message || "Failed to submit request. Please try again.");
        }
    };

    const handleCloseModal = (goToRequests = false) => {
        setShowSuccessModal(false);
        setEnergyAmount("");
        setNotes("");
        setDuration("1 Day");
        setPurpose("Household Usage");
        setPriority("Medium");

        if (goToRequests) {
            setActiveTab("requests");
            setStatusFilter("all");
        }
    };

    const handlePresetClick = (amount: number) => {
        const currentVal = parseFloat(energyAmount) || 0;
        setEnergyAmount(String(currentVal + amount));
        setFormError("");
    };

    const handleCancelRequestPrompt = (requestId: string) => {
        Alert.alert(
            "Cancel Energy Request",
            "Are you sure you want to cancel this pending energy request?",
            [
                { text: "Keep Request", style: "cancel" },
                {
                    text: "Cancel Request",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setCancellingId(requestId);
                            await cancelRequest(requestId);
                        } catch (err: any) {
                            Alert.alert("Error", err?.message || "Failed to cancel request");
                        } finally {
                            setCancellingId(null);
                        }
                    },
                },
            ]
        );
    };

    const getStatusBadge = (status: HouseholdEnergyRequest["status"]) => {
        switch (status) {
            case "approved":
                return {
                    bg: "bg-emerald-500/15 border-emerald-500/30",
                    text: "text-emerald-500",
                    iconColor: "#10B981",
                    icon: "check-circle",
                    label: "Approved",
                };
            case "fulfilled":
                return {
                    bg: "bg-sky-500/15 border-sky-500/30",
                    text: "text-sky-500",
                    iconColor: "#0EA5E9",
                    icon: "zap",
                    label: "Fulfilled",
                };
            case "rejected":
                return {
                    bg: "bg-rose-500/15 border-rose-500/30",
                    text: "text-rose-500",
                    iconColor: "#F43F5E",
                    icon: "x-circle",
                    label: "Declined",
                };
            case "cancelled":
                return {
                    bg: "bg-zinc-500/15 border-zinc-500/30",
                    text: "text-zinc-400",
                    iconColor: "#A1A1AA",
                    icon: "slash",
                    label: "Cancelled",
                };
            case "pending":
            default:
                return {
                    bg: "bg-amber-500/15 border-amber-500/30",
                    text: "text-amber-500",
                    iconColor: "#F59E0B",
                    icon: "clock",
                    label: "Pending Review",
                };
        }
    };

    return (
        <View className={`flex-1 ${theme.background}`}>
            <TabScreenBackground />

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={refetch}
                        tintColor={isDark ? "#F59E0B" : "#D97706"}
                    />
                }
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingTop: 55,
                    paddingBottom: 120,
                }}
            >
                {/* Header */}
                <View className="mb-6">
                    <Text className={`text-4xl font-extrabold tracking-tight ${theme.text}`}>
                        Energy Requests
                    </Text>
                    <Text className={`mt-1.5 text-base ${theme.textSecondary}`}>
                        Request clean solar power from the community microgrid
                    </Text>
                </View>

                {/* Top Segmented Navigation Tabs */}
                <View className="flex-row rounded-2xl bg-card border border-border/60 p-1 mb-6 shadow-sm">
                    <Pressable
                        onPress={() => setActiveTab("create")}
                        className={`flex-1 py-3 rounded-xl flex-row items-center justify-center ${
                            activeTab === "create" ? "bg-primary shadow-sm" : ""
                        }`}
                    >
                        <Feather
                            name="plus-circle"
                            size={16}
                            color={
                                activeTab === "create"
                                    ? isDark
                                        ? "#18181B"
                                        : "#FFFFFF"
                                    : isDark
                                      ? "#A1A1AA"
                                      : "#6B7280"
                            }
                        />
                        <Text
                            className={`ml-2 text-sm font-bold ${
                                activeTab === "create"
                                    ? isDark
                                        ? "text-zinc-900"
                                        : "text-white"
                                    : "text-muted-foreground"
                            }`}
                        >
                            New Request
                        </Text>
                    </Pressable>

                    <Pressable
                        onPress={() => setActiveTab("requests")}
                        className={`flex-1 py-3 rounded-xl flex-row items-center justify-center ${
                            activeTab === "requests" ? "bg-primary shadow-sm" : ""
                        }`}
                    >
                        <Feather
                            name="list"
                            size={16}
                            color={
                                activeTab === "requests"
                                    ? isDark
                                        ? "#18181B"
                                        : "#FFFFFF"
                                    : isDark
                                      ? "#A1A1AA"
                                      : "#6B7280"
                            }
                        />
                        <Text
                            className={`ml-2 text-sm font-bold ${
                                activeTab === "requests"
                                    ? isDark
                                        ? "text-zinc-900"
                                        : "text-white"
                                    : "text-muted-foreground"
                            }`}
                        >
                            My Requests
                        </Text>

                        {pendingCount > 0 && (
                            <View
                                className={`ml-2 px-2 py-0.5 rounded-full ${
                                    activeTab === "requests"
                                        ? "bg-amber-950/30"
                                        : "bg-amber-500/20"
                                }`}
                            >
                                <Text
                                    className={`text-[10px] font-black ${
                                        activeTab === "requests"
                                            ? isDark
                                                ? "text-zinc-900"
                                                : "text-white"
                                            : "text-amber-500"
                                    }`}
                                >
                                    {pendingCount}
                                </Text>
                            </View>
                        )}
                    </Pressable>
                </View>

                {/* ========================================================================= */}
                {/* TAB 1: CREATE NEW REQUEST FORM */}
                {/* ========================================================================= */}
                {activeTab === "create" && (
                    <View>
                        {/* Summary Pill Bar */}
                        {stats && (
                            <View className="flex-row items-center justify-between rounded-2xl bg-card/80 border border-border/60 p-4 mb-6">
                                <View className="flex-1">
                                    <Text className="text-xs font-semibold text-muted-foreground">
                                        Monthly Co-Op Quota
                                    </Text>
                                    <Text className="text-lg font-black text-foreground">
                                        {stats.monthlyAllocationKwh} kWh
                                    </Text>
                                </View>
                                <View className="h-8 w-px bg-border/60 mx-3" />
                                <View className="flex-1">
                                    <Text className="text-xs font-semibold text-muted-foreground">
                                        Approved Clean Energy
                                    </Text>
                                    <Text className="text-lg font-black text-emerald-500">
                                        {stats.approvedKwh} kWh
                                    </Text>
                                </View>
                            </View>
                        )}

                        {/* Energy Amount Card */}
                        <View className={`rounded-3xl p-5 mb-5 border ${theme.cardBorder} ${theme.card} shadow-sm`}>
                            <View className="flex-row items-center justify-between mb-3">
                                <Text className={`text-lg font-bold ${theme.text}`}>
                                    Requested Energy (kWh)
                                </Text>
                                <Text className="text-xs font-semibold text-amber-500">Required</Text>
                            </View>

                            <View
                                className={`flex-row items-center rounded-2xl px-4 py-3.5 border ${theme.inputBorder} ${theme.inputBg}`}
                            >
                                <Feather name="zap" size={22} color="#FBBF24" />
                                <TextInput
                                    value={energyAmount}
                                    onChangeText={(text) => {
                                        setEnergyAmount(text);
                                        setFormError("");
                                    }}
                                    keyboardType="decimal-pad"
                                    placeholder="Enter kWh (e.g. 15.5)"
                                    placeholderTextColor={theme.inputPlaceholder}
                                    className={`flex-1 ml-3 text-lg font-bold ${theme.inputText}`}
                                />
                                {energyAmount.length > 0 && (
                                    <Pressable onPress={() => setEnergyAmount("")}>
                                        <Feather name="x" size={18} color="#9CA3AF" />
                                    </Pressable>
                                )}
                            </View>

                            {/* Quick Presets */}
                            <View className="flex-row items-center justify-between mt-3 gap-2">
                                {PRESET_AMOUNTS.map((amt) => (
                                    <Pressable
                                        key={amt}
                                        onPress={() => handlePresetClick(amt)}
                                        className="flex-1 py-2 rounded-xl bg-card border border-border/70 items-center active:scale-95"
                                    >
                                        <Text className="text-xs font-bold text-foreground">
                                            +{amt} kWh
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>

                            {formError ? (
                                <View className="flex-row items-center mt-3 bg-rose-500/10 border border-rose-500/30 p-2.5 rounded-xl">
                                    <Feather name="alert-circle" size={16} color="#F43F5E" />
                                    <Text className="ml-2 text-xs font-semibold text-rose-500 flex-1">
                                        {formError}
                                    </Text>
                                </View>
                            ) : null}
                        </View>

                        {/* Duration Card */}
                        <View className={`rounded-3xl p-5 mb-5 border ${theme.cardBorder} ${theme.card} shadow-sm`}>
                            <Text className={`text-lg font-bold mb-3 ${theme.text}`}>
                                Requested Duration
                            </Text>

                            <View className="flex-row flex-wrap gap-2">
                                {DURATION_OPTIONS.map((item) => {
                                    const isSelected = duration === item;
                                    return (
                                        <Pressable
                                            key={item}
                                            onPress={() => setDuration(item)}
                                            className={`flex-1 min-w-[22%] py-3 rounded-2xl items-center border ${
                                                isSelected ? theme.selectedBg : theme.unselectedBg
                                            }`}
                                        >
                                            <Text
                                                className={`text-xs ${
                                                    isSelected ? theme.selectedText : theme.unselectedText
                                                }`}
                                            >
                                                {item}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </View>

                        {/* Purpose Card */}
                        <View className={`rounded-3xl p-5 mb-5 border ${theme.cardBorder} ${theme.card} shadow-sm`}>
                            <Text className={`text-lg font-bold mb-3 ${theme.text}`}>
                                Purpose of Energy
                            </Text>

                            <View className="gap-2">
                                {PURPOSE_OPTIONS.map((opt) => {
                                    const isSelected = purpose === opt.label;
                                    return (
                                        <Pressable
                                            key={opt.label}
                                            onPress={() => setPurpose(opt.label)}
                                            className={`flex-row items-center rounded-2xl p-3.5 border ${
                                                isSelected ? theme.selectedBg : theme.unselectedBg
                                            }`}
                                        >
                                            <View
                                                className={`h-9 w-9 rounded-xl items-center justify-center ${
                                                    isSelected
                                                        ? "bg-primary shadow-sm"
                                                        : "bg-secondary border border-border/40"
                                                }`}
                                            >
                                                <Feather
                                                    name={opt.icon as any}
                                                    size={18}
                                                    color={isSelected ? (isDark ? "#18181B" : "#FFFFFF") : opt.color}
                                                />
                                            </View>
                                            <Text
                                                className={`ml-3.5 flex-1 text-sm ${
                                                    isSelected ? theme.selectedText : theme.unselectedText
                                                }`}
                                            >
                                                {opt.label}
                                            </Text>
                                            {isSelected && (
                                                <Feather
                                                    name="check"
                                                    size={18}
                                                    color={isDark ? "#F59E0B" : "#D97706"}
                                                />
                                            )}
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </View>

                        {/* Priority Card */}
                        <View className={`rounded-3xl p-5 mb-5 border ${theme.cardBorder} ${theme.card} shadow-sm`}>
                            <Text className={`text-lg font-bold mb-3 ${theme.text}`}>
                                Urgency / Priority
                            </Text>

                            <View className="flex-row gap-2.5">
                                {PRIORITY_OPTIONS.map((item) => {
                                    const isSelected = priority === item;
                                    let activeColor = "#22C55E";
                                    if (item === "Medium") activeColor = "#F59E0B";
                                    if (item === "High") activeColor = "#EF4444";

                                    return (
                                        <Pressable
                                            key={item}
                                            onPress={() => setPriority(item)}
                                            className={`flex-1 py-3.5 rounded-2xl items-center border ${
                                                isSelected
                                                    ? "bg-secondary border-foreground/40 shadow-sm"
                                                    : "bg-card border-border/50"
                                            }`}
                                        >
                                            <View className="flex-row items-center">
                                                <View
                                                    className="h-2.5 w-2.5 rounded-full mr-2"
                                                    style={{ backgroundColor: activeColor }}
                                                />
                                                <Text
                                                    className={`text-xs font-bold ${
                                                        isSelected ? "text-foreground" : "text-muted-foreground"
                                                    }`}
                                                >
                                                    {item}
                                                </Text>
                                            </View>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </View>

                        {/* Additional Notes Card */}
                        <View className={`rounded-3xl p-5 mb-6 border ${theme.cardBorder} ${theme.card} shadow-sm`}>
                            <Text className={`text-lg font-bold mb-3 ${theme.text}`}>
                                Additional Notes (Optional)
                            </Text>

                            <TextInput
                                value={notes}
                                onChangeText={setNotes}
                                placeholder="Any specific time window or appliance details..."
                                placeholderTextColor={theme.inputPlaceholder}
                                multiline
                                numberOfLines={3}
                                className={`rounded-2xl p-4 border ${theme.inputBorder} ${theme.inputBg} ${theme.inputText} text-sm`}
                                style={{ minHeight: 80, textAlignVertical: "top" }}
                            />
                        </View>

                        {/* Request Summary Card */}
                        <View className={`rounded-3xl p-5 mb-6 border border-border/70 bg-card/90 shadow-sm`}>
                            <Text className={`text-base font-bold mb-3 ${theme.text}`}>
                                Request Summary
                            </Text>

                            <View className="flex-row justify-between mb-2">
                                <Text className={theme.textMuted}>Energy Requested</Text>
                                <Text className={`font-bold ${theme.text}`}>
                                    {energyAmount ? `${energyAmount} kWh` : "0 kWh"}
                                </Text>
                            </View>

                            <View className="flex-row justify-between mb-2">
                                <Text className={theme.textMuted}>Duration</Text>
                                <Text className={`font-semibold ${theme.text}`}>{duration}</Text>
                            </View>

                            <View className="flex-row justify-between mb-2">
                                <Text className={theme.textMuted}>Purpose</Text>
                                <Text className={`font-semibold ${theme.text}`}>{purpose}</Text>
                            </View>

                            <View className="flex-row justify-between">
                                <Text className={theme.textMuted}>Priority</Text>
                                <Text
                                    className="font-bold"
                                    style={{
                                        color:
                                            priority === "High"
                                                ? "#EF4444"
                                                : priority === "Medium"
                                                  ? "#F59E0B"
                                                  : "#22C55E",
                                    }}
                                >
                                    {priority}
                                </Text>
                            </View>
                        </View>

                        {/* Submit Button */}
                        <Pressable
                            onPress={handleSubmit}
                            disabled={submitting}
                            className="rounded-3xl py-4.5 items-center justify-center active:opacity-90 shadow-md shadow-primary/20"
                            style={{ backgroundColor: theme.submitBg }}
                        >
                            {submitting ? (
                                <ActivityIndicator color="#18181B" />
                            ) : (
                                <View className="flex-row items-center">
                                    <Feather name="send" size={18} color={isDark ? "#18181B" : "#FFFFFF"} />
                                    <Text className={`ml-2 text-base ${theme.submitText}`}>
                                        Submit Energy Request
                                    </Text>
                                </View>
                            )}
                        </Pressable>
                    </View>
                )}

                {/* ========================================================================= */}
                {/* TAB 2: MY REQUESTS & STATUS TRACKING */}
                {/* ========================================================================= */}
                {activeTab === "requests" && (
                    <View>
                        {/* Search & Filter Bar */}
                        <View className="mb-4 flex-row items-center rounded-2xl border border-border/80 bg-card px-4 py-2 shadow-sm">
                            <Feather name="search" size={18} color="#9CA3AF" />
                            <TextInput
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholder="Search by reason, kWh or ID..."
                                placeholderTextColor="#9CA3AF"
                                className="ml-3 flex-1 py-2 text-sm text-foreground"
                            />
                            {searchQuery.length > 0 && (
                                <Pressable onPress={() => setSearchQuery("")}>
                                    <Feather name="x" size={18} color="#9CA3AF" />
                                </Pressable>
                            )}
                        </View>

                        {/* Status Filter Horizontal Pills */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            className="mb-5 -mx-5 px-5"
                        >
                            <View className="flex-row gap-2">
                                {(
                                    [
                                        { id: "all", label: "All", count: requests.length },
                                        {
                                            id: "pending",
                                            label: "Pending",
                                            count: requests.filter((r) => r.status === "pending").length,
                                        },
                                        {
                                            id: "approved",
                                            label: "Approved",
                                            count: requests.filter((r) => r.status === "approved").length,
                                        },
                                        {
                                            id: "fulfilled",
                                            label: "Fulfilled",
                                            count: requests.filter((r) => r.status === "fulfilled").length,
                                        },
                                        {
                                            id: "rejected",
                                            label: "Declined",
                                            count: requests.filter((r) => r.status === "rejected").length,
                                        },
                                    ] as const
                                ).map((item) => {
                                    const active = statusFilter === item.id;
                                    return (
                                        <Pressable
                                            key={item.id}
                                            onPress={() => setStatusFilter(item.id)}
                                            className={`flex-row items-center rounded-full border px-4 py-2 ${
                                                active
                                                    ? "bg-primary border-primary"
                                                    : "bg-card border-border/70"
                                            }`}
                                        >
                                            <Text
                                                className={`text-xs font-bold ${
                                                    active ? "text-primary-foreground" : "text-foreground"
                                                }`}
                                            >
                                                {item.label}
                                            </Text>
                                            <View
                                                className={`ml-2 px-1.5 py-0.2 rounded-full ${
                                                    active ? "bg-black/20" : "bg-muted"
                                                }`}
                                            >
                                                <Text
                                                    className={`text-[10px] font-bold ${
                                                        active
                                                            ? "text-primary-foreground"
                                                            : "text-muted-foreground"
                                                    }`}
                                                >
                                                    {item.count}
                                                </Text>
                                            </View>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        </ScrollView>

                        {/* Requests List */}
                        {loading && requests.length === 0 ? (
                            <View className="items-center justify-center py-16">
                                <ActivityIndicator size="large" color="#F59E0B" />
                                <Text className="mt-4 text-sm font-semibold text-muted-foreground">
                                    Loading your energy requests...
                                </Text>
                            </View>
                        ) : filteredRequests.length === 0 ? (
                            <View className="items-center rounded-3xl border border-border/70 bg-card/80 p-8 text-center my-6">
                                <View className="h-16 w-16 rounded-2xl bg-secondary items-center justify-center mb-4">
                                    <Feather name="inbox" size={30} color="#9CA3AF" />
                                </View>
                                <Text className="text-lg font-bold text-foreground">
                                    No requests found
                                </Text>
                                <Text className="text-center text-sm text-muted-foreground mt-1 mb-6">
                                    {statusFilter !== "all"
                                        ? `You don't have any ${statusFilter} energy requests.`
                                        : "You haven't submitted any energy requests yet."}
                                </Text>
                                <Pressable
                                    onPress={() => {
                                        setStatusFilter("all");
                                        setActiveTab("create");
                                    }}
                                    className="rounded-2xl bg-primary px-6 py-3 shadow-sm"
                                >
                                    <Text className="text-sm font-bold text-primary-foreground">
                                        Create First Request
                                    </Text>
                                </Pressable>
                            </View>
                        ) : (
                            <View className="gap-4">
                                {filteredRequests.map((req) => {
                                    const badge = getStatusBadge(req.status);
                                    const isCancellingThis = cancellingId === req.id;

                                    return (
                                        <View
                                            key={req.id}
                                            className="rounded-3xl border border-border/70 bg-card/90 p-5 shadow-sm"
                                        >
                                            {/* Top Row: kWh Amount & Status Badge */}
                                            <View className="flex-row items-center justify-between mb-3">
                                                <View className="flex-row items-baseline">
                                                    <Text className="text-2xl font-black text-foreground">
                                                        {parseFloat(req.requestedEnergyKwh).toFixed(1)}
                                                    </Text>
                                                    <Text className="ml-1 text-sm font-bold text-amber-500">
                                                        kWh
                                                    </Text>
                                                </View>

                                                <View
                                                    className={`flex-row items-center px-3 py-1 rounded-full border ${badge.bg}`}
                                                >
                                                    <Feather
                                                        name={badge.icon as any}
                                                        size={12}
                                                        color={badge.iconColor}
                                                    />
                                                    <Text
                                                        className={`ml-1.5 text-xs font-bold uppercase tracking-wider ${badge.text}`}
                                                    >
                                                        {badge.label}
                                                    </Text>
                                                </View>
                                            </View>

                                            {/* Reason / Details text */}
                                            <View className="bg-secondary/40 rounded-2xl p-3.5 mb-3 border border-border/40">
                                                <Text className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">
                                                    Purpose & Notes
                                                </Text>
                                                <Text className="text-sm font-medium text-foreground leading-5">
                                                    {req.reason || "General household energy consumption"}
                                                </Text>
                                            </View>

                                            {/* Metadata row */}
                                            <View className="flex-row items-center justify-between pt-1 border-t border-border/40">
                                                <View className="flex-row items-center">
                                                    <Feather name="calendar" size={13} color="#9CA3AF" />
                                                    <Text className="ml-1.5 text-xs text-muted-foreground">
                                                        {formatDate(req.requestedAt)}
                                                    </Text>
                                                </View>

                                                <Text className="text-[11px] font-mono text-muted-foreground">
                                                    ID: {req.id.slice(-6).toUpperCase()}
                                                </Text>
                                            </View>

                                            {/* Action: Cancel Button for Pending Requests */}
                                            {req.status === "pending" && (
                                                <View className="mt-4 pt-3 border-t border-border/40 flex-row justify-end">
                                                    <Pressable
                                                        onPress={() => handleCancelRequestPrompt(req.id)}
                                                        disabled={isCancellingThis}
                                                        className="flex-row items-center px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 active:opacity-80"
                                                    >
                                                        {isCancellingThis ? (
                                                            <ActivityIndicator size="small" color="#F43F5E" />
                                                        ) : (
                                                            <>
                                                                <Feather name="x" size={14} color="#F43F5E" />
                                                                <Text className="ml-1.5 text-xs font-bold text-rose-500">
                                                                    Cancel Request
                                                                </Text>
                                                            </>
                                                        )}
                                                    </Pressable>
                                                </View>
                                            )}
                                        </View>
                                    );
                                })}
                            </View>
                        )}
                    </View>
                )}
            </ScrollView>

            {/* ========================================================================= */}
            {/* SUCCESS CONFIRMATION MODAL */}
            {/* ========================================================================= */}
            <Modal visible={showSuccessModal} transparent animationType="fade">
                <View className="flex-1 bg-black/80 justify-center items-center px-6">
                    <View className={`w-full rounded-3xl p-6 border ${theme.modalBorder} ${theme.modalBg} shadow-2xl`}>
                        <View className="items-center mb-4">
                            <View className="h-20 w-20 rounded-3xl bg-emerald-500/20 border border-emerald-500/30 items-center justify-center shadow-lg">
                                <Feather name="check-circle" size={38} color="#10B981" />
                            </View>
                        </View>

                        <Text className={`text-2xl font-black text-center ${theme.text}`}>
                            Request Submitted!
                        </Text>

                        <Text className={`text-center mt-2 mb-5 text-sm ${theme.textMuted} leading-5`}>
                            Your energy request has been recorded and submitted to the Co-Op Grid Manager for review.
                        </Text>

                        <View className={`rounded-2xl p-4 mb-6 ${isDark ? "bg-white/5 border border-white/10" : "bg-gray-100"}`}>
                            <View className="flex-row justify-between mb-2">
                                <Text className="text-xs text-muted-foreground">Energy Amount</Text>
                                <Text className="text-sm font-bold text-foreground">
                                    {lastCreatedRequest ? `${parseFloat(lastCreatedRequest.requestedEnergyKwh)} kWh` : `${energyAmount} kWh`}
                                </Text>
                            </View>

                            <View className="flex-row justify-between mb-2">
                                <Text className="text-xs text-muted-foreground">Duration</Text>
                                <Text className="text-sm font-semibold text-foreground">{duration}</Text>
                            </View>

                            <View className="flex-row justify-between mb-2">
                                <Text className="text-xs text-muted-foreground">Purpose</Text>
                                <Text className="text-sm font-semibold text-foreground">{purpose}</Text>
                            </View>

                            <View className="flex-row justify-between">
                                <Text className="text-xs text-muted-foreground">Status</Text>
                                <Text className="text-sm font-bold text-amber-500 uppercase">
                                    Pending Review
                                </Text>
                            </View>
                        </View>

                        <View className="gap-3">
                            <Pressable
                                onPress={() => handleCloseModal(true)}
                                className="rounded-2xl py-3.5 items-center bg-primary shadow-sm active:opacity-90"
                            >
                                <Text className="font-bold text-primary-foreground text-base">
                                    View in My Requests
                                </Text>
                            </Pressable>

                            <Pressable
                                onPress={() => handleCloseModal(false)}
                                className="rounded-2xl py-3 items-center bg-secondary border border-border/50 active:opacity-80"
                            >
                                <Text className="font-semibold text-foreground text-sm">
                                    Create Another Request
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default HouseholdEnergy;