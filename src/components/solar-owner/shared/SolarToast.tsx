import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSolarOwnerStore } from '../store/useSolarOwnerStore';

export const SolarToast = () => {
    const { toastMessage, toastType, hideToast } = useSolarOwnerStore();

    if (!toastMessage) return null;

    const getBgStyle = () => {
        switch (toastType) {
            case 'success':
                return 'bg-emerald-600 border-emerald-500/40';
            case 'warning':
                return 'bg-amber-600 border-amber-500/40';
            case 'info':
            default:
                return 'bg-sky-600 border-sky-500/40';
        }
    };

    const getIconName = () => {
        switch (toastType) {
            case 'success':
                return 'check-circle';
            case 'warning':
                return 'alert-circle';
            case 'info':
            default:
                return 'info';
        }
    };

    return (
        <View className="absolute top-12 left-4 right-4 z-50 shadow-2xl">
            <Pressable
                onPress={hideToast}
                className={`flex-row items-center justify-between rounded-2xl p-4 border shadow-lg ${getBgStyle()}`}
            >
                <View className="flex-row items-center flex-1 mr-2">
                    <Feather name={getIconName() as any} size={20} color="#FFFFFF" />
                    <Text className="text-white font-semibold text-sm ml-3 flex-1">
                        {toastMessage}
                    </Text>
                </View>
                <Feather name="x" size={16} color="#FFFFFF" />
            </Pressable>
        </View>
    );
};
