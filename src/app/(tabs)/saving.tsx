import { ScrollView, Text, View } from 'react-native';

const SavingScreen = () => {
    return (
        <ScrollView className='flex-1 bg-background py-4'
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 20, gap: 14 }}
        >
            <View className='justify-center items-center h-40 mt-20 w-full rounded-2xl'>
                <Text className='text-xl text-white'>
                    SavingScreen
                </Text>
            </View>
        </ScrollView>
    )
}

export default SavingScreen;