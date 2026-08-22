import { BlurView } from "expo-blur";
import { View } from "react-native";

export default function TabScreenBackground() {
    return (
        <>
            {/* Warm gold glow, top-left — organic blob, slightly elongated */}
            <View
                pointerEvents="none"
                className="absolute -left-24 -top-20 h-64 w-80 bg-primary opacity-20 rotate-[-12deg]"
                style={{
                    borderTopLeftRadius: 160,
                    borderTopRightRadius: 120,
                    borderBottomLeftRadius: 100,
                    borderBottomRightRadius: 180,
                }}
            />
            <BlurView
                intensity={60}
                pointerEvents="none"
                className="absolute -left-24 -top-20 h-64 w-80 overflow-hidden rotate-[-12deg]"
                style={{
                    borderTopLeftRadius: 160,
                    borderTopRightRadius: 120,
                    borderBottomLeftRadius: 100,
                    borderBottomRightRadius: 180,
                }}
            />

            {/* Soft primary glow, bottom-right — different blob, opposite tilt */}
            <View
                pointerEvents="none"
                className="absolute -right-20 top-28 h-72 w-64 bg-primary opacity-25 rotate-[18deg]"
                style={{
                    borderTopLeftRadius: 180,
                    borderTopRightRadius: 90,
                    borderBottomLeftRadius: 140,
                    borderBottomRightRadius: 160,
                }}
            />
            <BlurView
                intensity={50}
                pointerEvents="none"
                className="absolute -right-20 top-28 h-72 w-64 overflow-hidden rotate-[18deg]"
                style={{
                    borderTopLeftRadius: 180,
                    borderTopRightRadius: 90,
                    borderBottomLeftRadius: 140,
                    borderBottomRightRadius: 160,
                }}
            />
        </>
    )
}