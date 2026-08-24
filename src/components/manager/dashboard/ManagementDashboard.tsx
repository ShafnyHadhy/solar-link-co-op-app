import TabScreenBackground from '@/components/shared/TabScreenBackground';
import { useUser } from '@clerk/expo';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

const ManagementDashboard = () => {
    const { user } = useUser();
    const router = useRouter();

    return (
        <View className='flex-1'>
            <TabScreenBackground />
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1, padding: 20, paddingTop: 60 }}
                className='flex-1'
            >
                <View className='flex-row items-center justify-between mb-6'>
                    <View>
                        <Text className='text-2xl font-extrabold text-foreground'>
                            Good morning, {user?.firstName}
                        </Text>
                        <Text className='text-xs text-muted-foreground mt-0.5'>
                            Manage your solar community
                        </Text>
                    </View>

                    <View className='h-10 w-10 items-center justify-center rounded-2xl bg-secondary border border-border/60'>
                        <Feather name="bell" size={20} color="#F59E0B" />
                    </View>
                </View>

                <View className='flex-col items-start gap-2 rounded-xl border border-border/30 bg-secondary/60 p-4 shadow-sm'>
                    <Text className='text-sm font-semibold text-muted-foreground'>
                        Available Community Energy
                    </Text>
                    <Text className='text-3xl font-extrabold text-foreground'>
                        45 kWh
                    </Text>
                    <View className='w-full flex-row items-center justify-between mb-1'>
                        <Text className='text-xs font-semibold text-muted-foreground'>
                            12% available for sharing
                        </Text>
                    </View>
                    {/* Progress Bar Container */}
                    <View className='w-full h-2 rounded-full bg-secondary overflow-hidden border border-border/40'>
                        {/* Progress Bar Fill */}
                        <View className='h-full w-[12%] bg-primary rounded-full' />
                    </View>
                </View>

                <View className='flex-row gap-4 my-4 w-full'>
                    <View className='flex-1 flex-col gap-2 rounded-lg border border-border/30 bg-secondary/60 p-4 shadow-sm'>
                        <View className='flex-row items-center justify-between'>
                            <View className='flex-row items-center gap-1.5'>
                                <Feather name="sun" size={14} color="#10B981" />
                                <Text className='text-sm font-semibold text-muted-foreground'>
                                    Generated Today
                                </Text>
                            </View>
                        </View>
                        <Text className='text-xl font-extrabold text-foreground mt-1'>
                            120 kWh
                        </Text>
                        <View className='flex-row items-center gap-1'>
                            <Feather name="trending-up" size={12} color="#10B981" />
                            <Text className='text-xs font-semibold text-[#10B981]'>
                                +5.2% vs yesterday
                            </Text>
                        </View>
                    </View>
                    <View className='flex-1 flex-col gap-2 rounded-lg border border-border/30 bg-secondary/60 p-4 shadow-sm'>
                        <View className='flex-row items-center justify-between'>
                            <View className='flex-row items-center gap-1.5'>
                                <Feather name="zap" size={14} color="#EF4444" />
                                <Text className='text-sm font-semibold text-muted-foreground'>
                                    Consumed Today
                                </Text>
                            </View>
                        </View>
                        <Text className='text-xl font-extrabold text-foreground mt-1'>
                            75 kWh
                        </Text>
                        <View className='flex-row items-center gap-1'>
                            <Feather name="trending-down" size={12} color="#EF4444" />
                            <Text className='text-xs font-semibold text-[#EF4444]'>
                                -2.1% vs yesterday
                            </Text>
                        </View>
                    </View>
                </View>

                <View className='flex-row items-center justify-between gap-4 p-4 bg-secondary/60 rounded-xl shadow-sm'>
                    <View className='flex-col gap-1'>
                        <Text className='text-lg font-semibold text-foreground'>
                            3 requests
                        </Text>
                        <Text className='text-xs font-semibold text-muted-foreground'>
                            pending household requests
                        </Text>
                    </View>
                    <View className='items-center justify-center'>
                        <Pressable
                            onPress={() => router.push('/energy')}
                            className='items-center justify-center rounded-md bg-secondary border border-border/60 px-4 py-2 active:opacity-75'
                        >
                            <Text className='text-md font-semibold text-[#F59E0B]'>
                                View Requests
                            </Text>
                        </Pressable>
                    </View>
                </View>

                <View className="flex-row items-center justify-between mt-6">
                    <Text className="text-sm font-semibold uppercase tracking-[1px] text-muted-foreground">
                        Needs Attention
                    </Text>
                </View>

                <View className="flex-col gap-4 mt-4 p-4 border border-border rounded-2xl shadow-sm">
                    <Pressable className="flex-row items-center gap-4 p-4 bg-secondary/60 rounded-xl border border-border active:opacity-70 shadow-sm">
                        <View className="h-12 w-12 items-center justify-center rounded-full bg-red-500/15 border border-red-500">
                            <Feather name="alert-triangle" size={20} color="#EF4444" />
                        </View>
                        <View className="flex-1 flex-col">
                            <Text className="text-lg font-semibold text-foreground" numberOfLines={1}>
                                Low Stock Alert
                            </Text>
                            <Text className="text-xs font-semibold text-muted-foreground" numberOfLines={1}>
                                Community storage is running low
                            </Text>
                        </View>
                        <Feather name="chevron-right" size={20} color="#9CA3AF" />
                    </Pressable>

                    <Pressable className="flex-row items-center gap-4 p-4 bg-secondary/60 rounded-xl border border-border active:opacity-70 shadow-sm">
                        <View className="h-12 w-12 items-center justify-center rounded-full bg-red-500/15 border border-red-500">
                            <Feather name="alert-triangle" size={20} color="#EF4444" />
                        </View>
                        <View className="flex-1 flex-col">
                            <Text className="text-lg font-semibold text-foreground" numberOfLines={1}>
                                Insufficient Power
                            </Text>
                            <Text className="text-xs font-semibold text-muted-foreground" numberOfLines={1}>
                                3 households are experiencing power outages
                            </Text>
                        </View>
                        <Feather name="chevron-right" size={20} color="#9CA3AF" />
                    </Pressable>

                    <Pressable className="flex-row items-center gap-4 p-4 bg-secondary/60 rounded-xl border border-border active:opacity-70 shadow-sm">
                        <View className="h-12 w-12 items-center justify-center rounded-full bg-yellow-500/15 border border-yellow-500">
                            <Feather name="alert-triangle" size={20} color="#F59E0B" />
                        </View>
                        <View className="flex-1 flex-col">
                            <Text className="text-lg font-semibold text-foreground" numberOfLines={1}>
                                Grid Maintenance
                            </Text>
                            <Text className="text-xs font-semibold text-muted-foreground" numberOfLines={1}>
                                Scheduled maintenance on 2024-12-31
                            </Text>
                        </View>
                        <Feather name="chevron-right" size={20} color="#9CA3AF" />
                    </Pressable>

                </View>

                <View className="flex-row items-center justify-between mt-6">
                    <Text className="text-sm font-semibold uppercase tracking-[1px] text-muted-foreground">
                        Battery Banks
                    </Text>
                </View>

                <View className="flex-row gap-4 mt-4 w-full">

                    <View className="flex-1 flex-col gap-3 p-4 bg-secondary/60 rounded-xl border border-border/30 shadow-sm">
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center gap-2">
                                <Feather name="battery-charging" size={16} color="#10B981" />
                                <Text className="text-sm font-semibold text-foreground">
                                    Bank A
                                </Text>
                            </View>
                            <Text className="text-xs font-bold text-[#10B981]">
                                85%
                            </Text>
                        </View>
                        <View className='w-full h-1.5 rounded-full bg-secondary overflow-hidden border border-border/40'>
                            <View className='h-full w-[85%] bg-[#10B981] rounded-full' />
                        </View>
                    </View>

                    <View className="flex-1 flex-col gap-3 p-4 bg-secondary/60 rounded-xl border border-border/30 shadow-sm">
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center gap-2">
                                <Feather name="battery" size={16} color="#F59E0B" />
                                <Text className="text-sm font-semibold text-foreground">
                                    Bank B
                                </Text>
                            </View>
                            <Text className="text-xs font-bold text-[#F59E0B]">
                                32%
                            </Text>
                        </View>
                        <View className='w-full h-1.5 rounded-full bg-secondary overflow-hidden border border-border/40'>
                            <View className='h-full w-[32%] bg-[#F59E0B] rounded-full' />
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default ManagementDashboard;
