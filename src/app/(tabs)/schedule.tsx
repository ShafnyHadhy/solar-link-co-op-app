import TabScreenBackground from '@/components/shared/TabScreenBackground';
import { maintenanceJobs } from '@/data/technicianData';
import { Feather } from '@expo/vector-icons';
import React from 'react';
import {
    Pressable,
    ScrollView,
    Text,
    View,
} from 'react-native';

const ScheduleScreen = () => {
    const getPriorityStyle = (priority: string) => {
        if (priority === 'High') {
            return {
                box: 'bg-priority-high',
                text: 'text-priority-high-foreground',
            };
        }

        if (priority === 'Medium') {
            return {
                box: 'bg-priority-medium',
                text: 'text-priority-medium-foreground',
            };
        }

        return {
            box: 'bg-priority-low',
            text: 'text-priority-low-foreground',
        };
    };

    return (
        <View className="flex-1 bg-background">
            <TabScreenBackground />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingTop: 20,
                    paddingBottom: 40,
                }}
            >
                <Text className="text-3xl font-extrabold text-foreground">
                    Schedule
                </Text>

                <Text className="mb-7 mt-2 text-sm text-muted-foreground">
                    Service visits and preventive maintenance.
                </Text>

                <View className="mb-5 rounded-[24px] border border-border bg-card p-4">
                    <Text className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Today
                    </Text>

                    <Text className="mt-1 text-xl font-extrabold text-foreground">
                        Service Schedule
                    </Text>
                </View>

                <Text className="mb-3 text-lg font-bold text-foreground">
                    Upcoming Maintenance
                </Text>

                <View className="gap-3">
                    {maintenanceJobs.map((job) => {
                        const style = getPriorityStyle(job.priority);

                        return (
                            <Pressable
                                key={job.id}
                                className="rounded-[22px] border border-border bg-card p-4 active:opacity-80"
                            >
                                <View className="flex-row items-start justify-between">
                                    <View className="mr-3 flex-1">
                                        <Text className="text-base font-extrabold text-foreground">
                                            {job.systemName}
                                        </Text>

                                        <View className="mt-2 flex-row items-center">
                                            <Feather
                                                name="map-pin"
                                                size={13}
                                                color="#6B7280"
                                            />

                                            <Text className="ml-1 text-xs text-muted-foreground">
                                                {job.location}
                                            </Text>
                                        </View>
                                    </View>

                                    <View
                                        className={`rounded-full px-3 py-1 ${style.box}`}
                                    >
                                        <Text
                                            className={`text-[10px] font-bold uppercase ${style.text}`}
                                        >
                                            {job.priority}
                                        </Text>
                                    </View>
                                </View>

                                <View className="my-4 h-px bg-border" />

                                <Text className="text-sm font-semibold text-foreground">
                                    {job.type}
                                </Text>

                                <View className="mt-3 flex-row items-center">
                                    <Feather
                                        name="calendar"
                                        size={14}
                                        color="#6B7280"
                                    />

                                    <Text className="ml-2 text-xs text-muted-foreground">
                                        {job.date}
                                    </Text>

                                    <Feather
                                        name="clock"
                                        size={14}
                                        color="#6B7280"
                                        style={{
                                            marginLeft: 16,
                                        }}
                                    />

                                    <Text className="ml-2 text-xs text-muted-foreground">
                                        {job.time}
                                    </Text>
                                </View>

                                <View className="mt-4 flex-row items-center justify-end">
                                    <Text className="mr-1 text-xs font-bold text-foreground">
                                        View Job
                                    </Text>

                                    <Feather
                                        name="chevron-right"
                                        size={16}
                                        color="#6B7280"
                                    />
                                </View>
                            </Pressable>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );
};

export default ScheduleScreen;