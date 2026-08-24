import TabScreenBackground from '@/components/shared/TabScreenBackground';
import TechnicianEnergyScreen from '@/components/technician/energy/TechnicianEnergyScreen';
import { getUserRole } from '@/lib/getUserRole';

import { useUser } from '@clerk/expo';

import React from 'react';

import {
    ScrollView,
    Text,
    View,
} from 'react-native';

const EnergyScreen = () => {
    const { user, isLoaded } = useUser();

    if (!isLoaded) {
        return null;
    }

    const role = getUserRole(
        user?.publicMetadata?.role
    );

    // Technician-specific Energy / System Monitoring screen
    if (role === 'technician') {
        return <TechnicianEnergyScreen />;
    }

    // Keep the existing Energy screen for other roles
    return (
        <ScrollView
            className="flex-1 bg-background"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
                flexGrow: 1,
                padding: 20,
            }}
        >
            <TabScreenBackground />

            <View className="flex-1 items-center justify-center py-20">
                <Text className="text-2xl font-bold text-foreground">
                    Energy Screen
                </Text>
            </View>
        </ScrollView>
    );
};

export default EnergyScreen;