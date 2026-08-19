
import { FontAwesome6 } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

const priorityPillBg = {
    low: "bg-priority-low",
    medium: "bg-priority-medium",
    high: "bg-priority-high",
};

const priorityPillText = {
    low: "text-priority-low-foreground",
    medium: "text-priority-medium-foreground",
    high: "text-priority-high-foreground",
};

const CompletedItems = () => {


    const CompletedItems = [
        { id: "1", name: "Milk", quantity: 2, priority: "medium", category: "Produce", purchased: true, },
        { id: "2", name: "Bread", quantity: 1, priority: "high", category: "Bakery", purchased: true, },
        { id: "3", name: "Eggs", quantity: 12, priority: "high", category: "Dairy", purchased: true, },
        { id: "4", name: "Chicken Breast", quantity: 1, priority: "high", category: "Meat", purchased: true, },
        { id: "5", name: "Rice", quantity: 1, priority: "low", category: "Pantry", purchased: true, },
    ]

    return (
        <View className="mt-3 rounded-3xl border border-border  bbg-secondary p-4">
            <Text className="text-sm font-semibold uppercase tracking-[1px]
                    text-secondary-foreground"
            >
                Completed
            </Text>

            {CompletedItems.map((item) => (
                <View key={item.id}
                    className="mt-3 flex-row items-center justify-between rounded-2xl border border-border bg-card px-3 py-2"
                >
                    <View className="flex-row items-center gap-2">
                        <Pressable
                            className="h-6 w-6 items-center justify-center rounded-full bg-primary"
                        >
                            <FontAwesome6 name="check" size={12} color="#ffffff" />
                        </Pressable>
                        <Text className="text-base text-muted-foreground line-through">{item.name}</Text>
                    </View>
                    <Pressable
                        className="h-8 w-8 items-center justify-center rounded-xl bg-destructive"
                    >
                        <FontAwesome6 name="trash" size={12} color="#d45f58" />
                    </Pressable>
                </View>
            ))}
        </View>
    );
};

export default CompletedItems;