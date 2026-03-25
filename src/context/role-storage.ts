import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export type UserRole = 'user' | 'business' | 'dj';

export const ROLE_STORAGE_KEY = 'zync_active_role';

export async function loadPersistedRole(): Promise<UserRole | null> {
    try {
        const stored = Platform.OS !== 'web'
            ? await SecureStore.getItemAsync(ROLE_STORAGE_KEY)
            : localStorage.getItem(ROLE_STORAGE_KEY);
        if (stored === 'user' || stored === 'business' || stored === 'dj') {
            return stored;
        }
    } catch { /* ignore */ }
    return null;
}

export async function persistRole(role: UserRole): Promise<void> {
    try {
        if (Platform.OS !== 'web') {
            await SecureStore.setItemAsync(ROLE_STORAGE_KEY, role);
        } else {
            localStorage.setItem(ROLE_STORAGE_KEY, role);
        }
    } catch { /* ignore */ }
}

export async function clearPersistedRole(): Promise<void> {
    try {
        if (Platform.OS !== 'web') {
            await SecureStore.deleteItemAsync(ROLE_STORAGE_KEY);
        } else {
            localStorage.removeItem(ROLE_STORAGE_KEY);
        }
    } catch { /* ignore */ }
}
