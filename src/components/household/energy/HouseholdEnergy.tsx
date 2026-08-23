import TabScreenBackground from '@/components/shared/TabScreenBackground';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';

const HouseholdEnergy = () => {

    return (
        <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, padding: 20 }}
            className='flex-1 bg-background'
        >
            <TabScreenBackground />

            <View className='flex-1 justify-center items-center py-20'>
                <Text className='text-2xl font-bold text-foreground'>
                    Household Energy
                </Text>

            </View>
        </ScrollView>
    );
};

export default HouseholdEnergy;
