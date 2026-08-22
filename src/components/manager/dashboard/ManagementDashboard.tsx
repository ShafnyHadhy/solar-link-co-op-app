import TabScreenBackground from '@/components/shared/TabScreenBackground';
import { useAuth } from '@clerk/expo';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

const ManagementDashboard = () => {
    const { signOut } = useAuth();

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, padding: 20 }}
            className='flex-1 bg-background'
        >
            <TabScreenBackground />

            <View className='flex-1 justify-center items-center py-20'>
                <Text className='text-2xl font-bold text-foreground'>
                    Management Dashboard
                </Text>
                
                <Pressable 
                    onPress={() => signOut()} 
                    className='bg-primary rounded-2xl px-6 py-3.5 mt-6 active:opacity-90 shadow-sm'
                >
                    <Text className='text-primary-foreground font-bold text-base'>
                        Sign out
                    </Text>
                </Pressable>
            </View>
        </ScrollView>
    );
};

export default ManagementDashboard;
