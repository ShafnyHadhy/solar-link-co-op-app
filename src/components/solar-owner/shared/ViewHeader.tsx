import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSolarOwnerStore } from '../store/useSolarOwnerStore';

interface ViewHeaderProps {
    title: string;
    subtitle?: string;
    showBack?: boolean;
    rightAction?: {
        icon: keyof typeof Feather.glyphMap;
        onPress: () => void;
        badgeCount?: number;
    };
}

export const ViewHeader: React.FC<ViewHeaderProps> = ({
    title,
    subtitle,
    showBack = true,
    rightAction,
}) => {
    const { setActiveView } = useSolarOwnerStore();

    return (
        <View className="flex-row items-center justify-between mb-6 pt-2 gap-2">
            <View className="flex-row items-center flex-1 mr-1 min-w-0">
                {showBack && (
                    <Pressable
                        onPress={() => setActiveView('dashboard')}
                        className="h-10 w-10 items-center justify-center rounded-2xl bg-secondary border border-border/60 mr-3 active:opacity-70 flex-shrink-0"
                    >
                        <Feather name="arrow-left" size={20} color="#F59E0B" />
                    </Pressable>
                )}
                <View className="flex-1 min-w-0">
                    <Text className="text-2xl font-extrabold text-foreground" numberOfLines={1}>
                        {title}
                    </Text>
                    {subtitle && (
                        <Text className="text-xs text-muted-foreground mt-0.5" numberOfLines={1}>
                            {subtitle}
                        </Text>
                    )}
                </View>
            </View>

            {rightAction && (
                <Pressable
                    onPress={rightAction.onPress}
                    className="h-10 w-10 items-center justify-center rounded-2xl bg-secondary border border-border/60 relative active:opacity-70 flex-shrink-0"
                >
                    <Feather name={rightAction.icon} size={20} color="#F59E0B" />
                    {rightAction.badgeCount !== undefined && rightAction.badgeCount > 0 && (
                        <View className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 rounded-full bg-destructive items-center justify-center border-2 border-background">
                            <Text className="text-xs font-bold text-white">
                                {rightAction.badgeCount}
                            </Text>
                        </View>
                    )}
                </Pressable>
            )}
        </View>
    );
};
