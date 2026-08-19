import CompletedItems from '@/components/list/CompletedItems';
import ListHeroCard from '@/components/list/ListHeroCard';
import PendingItemCard from '@/components/list/PendingItemCard';
import TabScreenBackground from '@/components/TabScreenBackground';
import { GroceryItem } from '@/store/grocery-store';
import { useAuth } from '@clerk/expo';
import { Button, ScrollView, Text, View } from 'react-native';

export default function ListScreen() {

    const pendingItems: GroceryItem[] = [
        { id: "1", name: "Bananas", quantity: 6, priority: "medium", category: "Produce", purchased: false, },
        { id: "2", name: "Pasta Sauce", quantity: 1, priority: "high", category: "Pantry", purchased: false, },
        { id: "3", name: "Whole Wheat Bread", quantity: 2, priority: "high", category: "Bakery", purchased: false, },
        { id: "4", name: "Almond Milk", quantity: 1, priority: "medium", category: "Dairy", purchased: false, },
        { id: "5", name: "Greek Yogurt", quantity: 2, priority: "high", category: "Dairy", purchased: false, },
    ]

    const { signOut } = useAuth()

    return (
        <ScrollView className='flex-1 bg-background py-4'
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ padding: 20, gap: 14 }}
        >
            <TabScreenBackground />

            <ListHeroCard />

            <View className='w-full'>
                <Button title="Sign out" onPress={() => signOut()} />
            </View>

            <View className='flex-row items-center justify-between px-1'>
                <Text className='text-sm font-semibold uppercase tracking-[1px] text-muted-foreground'>
                    Shopping Items
                </Text>
                <Text className='text-sm text-muted-foreground'>
                    {pendingItems.length} active
                </Text>
            </View>

            {pendingItems.map((item) => (
                <PendingItemCard key={item.id} item={item} />
            ))}

            <CompletedItems />
        </ScrollView>
    )
}
