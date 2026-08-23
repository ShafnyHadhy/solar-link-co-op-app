import TabScreenBackground from '@/components/shared/TabScreenBackground';
import { useUser } from '@clerk/expo';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

const ManagementDashboard = () => {
    const { user } = useUser();

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, padding: 20 }}
            className='flex-1 bg-background'
        >
            <TabScreenBackground />

            <View className='flex-row items-center justify-between mb-6'>
                <View>
                    <Text className='text-2xl font-extrabold text-foreground'>
                        Good morning, {user?.firstName}
                    </Text>
                    <Text className='text-xs text-muted-foreground mt-0.5'>
                        Manage your solar community
                    </Text>
                </View>

                <View className='h-12 w-12 items-center justify-center rounded-full bg-secondary border border-border/60'>
                    <Feather name="bell" size={24} color="#F59E0B" />
                </View>
            </View>

            <View className='flex-col items-start gap-2 rounded-xl border border-border/30 bg-secondary/60 p-4'>
                <Text className='text-sm font-semibold text-muted-foreground'>
                    Available Community Energy
                </Text>
                <Text className='text-3xl font-extrabold text-foreground'>
                    45 kWh
                </Text>
                <Text className='text-xs font-semibold text-muted-foreground'>
                    12% available for sharing
                </Text>
            </View>

            <View className='flex-row gap-4 my-4 w-full'>
                <View className='flex-1 flex-col gap-2 rounded-lg border border-border/30 bg-secondary/60 p-4'>
                    <Text className='text-sm font-semibold text-muted-foreground'>
                        Generated Today
                    </Text>
                    <Text className='text-xl font-extrabold text-foreground'>
                        120 kWh
                    </Text>
                </View>
                <View className='flex-1 flex-col gap-2 rounded-lg border border-border/30 bg-secondary/60 p-4'>
                    <Text className='text-sm font-semibold text-muted-foreground'>
                        Consumed Today
                    </Text>
                    <Text className='text-xl font-extrabold text-foreground'>
                        75 kWh
                    </Text>
                </View>
            </View>

            <View className='flex-row items-center justify-between gap-4 p-4 bg-secondary/60 rounded-xl'>
                <View className='flex-col gap-1'>
                    <Text className='text-lg font-semibold text-foreground'>
                        3 requests
                    </Text>
                    <Text className='text-xs font-semibold text-muted-foreground'>
                        pending household requests
                    </Text>
                </View>
                <View className='items-center justify-center'>
                    <Pressable className='items-center justify-center rounded-md bg-secondary border border-border/60 px-4 py-2'>
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

            <View className="flex-col gap-4 mt-4 p-4 border border-border rounded-2xl">
                <View className="flex-row items-center gap-4 p-4 bg-secondary/60 rounded-xl border border-border">
                    <View className="h-14 w-14 items-center justify-center rounded-full bg-red/15 border border-red-500">
                        <Feather name="alert-triangle" size={20} color="#F59E0B" />
                    </View>
                    <View className="flex-1 flex-col">
                        <Text className="text-lg font-semibold text-foreground">
                            Low Stock Alert
                        </Text>
                        <Text className="text-xs font-semibold text-muted-foreground">
                            Community storage is running low
                        </Text>
                    </View>
                </View>
                <View className="flex-row items-center gap-4 p-4 bg-secondary/60 rounded-xl border border-border">
                    <View className="h-14 w-14 items-center justify-center rounded-full bg-red/15 border border-red-500">
                        <Feather name="alert-triangle" size={20} color="#F59E0B" />
                    </View>
                    <View className="flex-1 flex-col">
                        <Text className="text-lg font-semibold text-foreground">
                            Insufficient Power
                        </Text>
                        <Text className="text-xs font-semibold text-muted-foreground">
                            3 households are experiencing power outages
                        </Text>
                    </View>
                </View>
                <View className="flex-row items-center gap-4 p-4 bg-secondary/60 rounded-xl border border-border">
                    <View className="h-14 w-14 items-center justify-center rounded-full bg-yellow/15 border border-yellow-500">
                        <Feather name="alert-triangle" size={20} color="#F59E0B" />
                    </View>
                    <View className="flex-1 flex-col">
                        <Text className="text-lg font-semibold text-foreground">
                            Grid Maintenance
                        </Text>
                        <Text className="text-xs font-semibold text-muted-foreground">
                            Scheduled maintenance on 2024-12-31
                        </Text>
                    </View>
                </View>
                <View className="flex-row items-center gap-4 p-4 bg-secondary/60 rounded-xl border border-border">
                    <View className="h-14 w-14 items-center justify-center rounded-full bg-yellow/15 border border-yellow-500">
                        <Feather name="alert-triangle" size={20} color="#F59E0B" />
                    </View>
                    <View className="flex-1 flex-col">
                        <Text className="text-lg font-semibold text-foreground">
                            Community Storage Maintenance
                        </Text>
                        <Text className="text-xs font-semibold text-muted-foreground">
                            Scheduled maintenance on 2025-01-01
                        </Text>
                    </View>
                </View>
            </View>

        </ScrollView>
    );
};

export default ManagementDashboard;
