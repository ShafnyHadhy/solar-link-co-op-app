import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSolarOwnerStore } from '../store/useSolarOwnerStore';

export const SolarToast = () => {
    const insets = useSafeAreaInsets();
    const { toastMessage, toastType, hideToast } = useSolarOwnerStore();

    if (!toastMessage) return null;

    const getBgStyle = () => {
        switch (toastType) {
            case 'success':
                return 'bg-emerald-600 border-emerald-400';
            case 'warning':
                return 'bg-amber-600 border-amber-400';
            case 'info':
            default:
                return 'bg-sky-600 border-sky-400';
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
        <View
            style={{
                position: 'absolute',
                top: insets.top > 0 ? insets.top + 10 : 20,
                left: 16,
                right: 16,
                zIndex: 999999,
                elevation: 999999,
            }}
        >
            <Pressable
                onPress={hideToast}
                className={`flex-row items-center justify-between rounded-2xl p-4 border shadow-2xl ${getBgStyle()}`}
            >
                <View className="flex-row items-center flex-1 mr-2">
                    <Feather name={getIconName() as any} size={20} color="#FFFFFF" />
                    <Text className="text-white font-bold text-sm ml-3 flex-1">
                        {toastMessage}
                    </Text>
                </View>
                <Feather name="x" size={16} color="#FFFFFF" />
            </Pressable>
        </View>
    );
};
