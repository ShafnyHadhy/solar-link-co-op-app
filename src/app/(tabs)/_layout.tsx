import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from "nativewind";


export default function TabsLayout() {
    const { isSignedIn, isLoaded } = useAuth();

    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === "dark";
    const tabTincolor = isDark ? "hsl(142 70% 54%)" : "hsl(147 75% 33%)"

    if (!isLoaded) {
        return null
    }

    if (!isSignedIn) {
        return <Redirect href="/(auth)/sign-in" />
    }

    return (

        <NativeTabs tintColor={tabTincolor}>

            <NativeTabs.Trigger name="index">
                <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Icon
                    sf={{
                        default: "house",
                        selected: "house.fill",
                    }}
                    md="house"
                />
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="energy">
                <NativeTabs.Trigger.Icon
                    sf={{
                        default: "chart.bar",
                        selected: "chart.bar.fill",
                    }}
                    md="analytics"
                />
                <NativeTabs.Trigger.Label>Energy</NativeTabs.Trigger.Label>
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="alerts">
                <NativeTabs.Trigger.Icon
                    sf={{
                        default: "exclamationmark.triangle",
                        selected: "exclamationmark.triangle.fill",
                    }}
                    md="add"
                />
                <NativeTabs.Trigger.Label>Alerts</NativeTabs.Trigger.Label>
                <NativeTabs.Trigger.Badge>2</NativeTabs.Trigger.Badge>
            </NativeTabs.Trigger>

            <NativeTabs.Trigger name="menu">
                <NativeTabs.Trigger.Icon
                    sf={{
                        default: "line.3.horizontal",
                        selected: "line.3.horizontal",
                    }}
                    md="list"
                />
                <NativeTabs.Trigger.Label>Menu</NativeTabs.Trigger.Label>
            </NativeTabs.Trigger>

        </NativeTabs>
    )
}