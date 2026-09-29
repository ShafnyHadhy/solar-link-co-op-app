import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * Universal safe key-value storage across React Native mobile and web.
 */
export const appStorage = {
    async getItem(key: string): Promise<string | null> {
        try {
            if (Platform.OS === 'web') {
                return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
            }
            return await SecureStore.getItemAsync(key);
        } catch {
            return null;
        }
    },

    async setItem(key: string, value: string): Promise<void> {
        try {
            if (Platform.OS === 'web') {
                if (typeof localStorage !== 'undefined') {
                    localStorage.setItem(key, value);
                }
                return;
            }
            await SecureStore.setItemAsync(key, value);
        } catch {
            // Silently fallback if storage is restricted
        }
    },

    async removeItem(key: string): Promise<void> {
        try {
            if (Platform.OS === 'web') {
                if (typeof localStorage !== 'undefined') {
                    localStorage.removeItem(key);
                }
                return;
            }
            await SecureStore.deleteItemAsync(key);
        } catch {
            // Silently fallback
        }
    },
};
