import { useAuth } from '@clerk/expo';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

const HouseholdDashboard = () => {

    const { signOut } = useAuth();
    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 20 }}
            className='flex-1 bg-background'
        >
            <View className='flex-col bg-background pt-40 pb-4 justify-center items-center'>
                <Text className='text-2xl font-bold text-white'>HouseholdDashboard</Text>
                <Pressable onPress={() => signOut()} className='bg-primary/80 rounded-2xl px-4 py-3 mt-6'>
                    <Text className='text-white font-semibold text-lg'>Sign out</Text>
                </Pressable>
            </View>
        </ScrollView>
    )
}

export default HouseholdDashboard
