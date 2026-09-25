import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Resolves API endpoint URLs seamlessly across Web, Emulators, Simulators, and Physical Devices.
 */
export function getApiUrl(path: string): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    // 1. Web environment uses relative paths directly
    if (Platform.OS === 'web') {
        return cleanPath;
    }

    // 2. Explicit custom API URL from environment variable
    if (process.env.EXPO_PUBLIC_API_URL) {
        return `${process.env.EXPO_PUBLIC_API_URL}${cleanPath}`;
    }

    // 3. Expo development on local network (Dev Client / Expo Go on real device or simulator)
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
        const ip = hostUri.split(':')[0];
        return `http://${ip}:8081${cleanPath}`;
    }

    // 4. Android emulator fallback (10.0.2.2 points to host machine localhost)
    if (Platform.OS === 'android') {
        return `http://10.0.2.2:8081${cleanPath}`;
    }

    // 5. iOS Simulator fallback
    return `http://localhost:8081${cleanPath}`;
}
