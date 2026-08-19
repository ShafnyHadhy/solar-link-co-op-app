import { useGroceryStore } from "@/store/grocery-store";
import { Text, View } from "react-native";

export default function ListHeroCard() {

    const { items } = useGroceryStore();

    const completedCount = 5;
    const pendingCount = 5;
    const completionRate = 50;

    return (
        <>
            <View className="rounded-3xl bg-primary p-5">
                <Text
                    className="text-sm font-semibold uppercase tracking-[1px] text-primary-foreground/70"
                >
                    Today
                </Text>
                <Text
                    className="mt-1 text-3xl font-extrabold text-primary-foreground"
                >
                    Your Grocery Board
                </Text>
                <Text
                    className="mt-1 text-sm text-primary-foreground/80"
                >
                    {pendingCount} pending . {completedCount} completed
                </Text>
                <View className="mt-4 overflow-hidden rounded-full bg-white/30">
                    <View
                        className="h-2 rounded-full bg-secondary"
                        style={{ width: `${completionRate}%` }}
                    />
                </View>
            </View>
        </>
    )
}