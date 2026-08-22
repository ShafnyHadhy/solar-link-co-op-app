import TabScreenBackground from '@/components/shared/TabScreenBackground';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';

const AlertsScreen = () => {
    return (
        <ScrollView 
            className='flex-1 bg-background'
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, padding: 20 }}
        >
            <TabScreenBackground />

            <View className='flex-1 justify-center items-center py-20'>
                <Text className='text-2xl font-bold text-foreground'>
                    Alerts Screen
                </Text>
            </View>
        </ScrollView>
    );
};

export default AlertsScreen;