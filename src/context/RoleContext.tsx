import { useAuth } from '@/features/auth/context/AuthContext';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

export type UserRole = 'user' | 'business' | 'dj';

const ROLE_STORAGE_KEY = 'zync_active_role';

interface RoleContextType {
    currentRole: UserRole;
    isLoading: boolean;
    switchRole: (role: UserRole) => Promise<void>;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const useRole = () => {
    const context = useContext(RoleContext);
    if (!context) {
        throw new Error('useRole must be used within a RoleProvider');
    }
    return context;
};

async function loadPersistedRole(): Promise<UserRole | null> {
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

async function persistRole(role: UserRole): Promise<void> {
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

interface RoleProviderProps {
    children: ReactNode;
}

function isRoleAllowed(role: UserRole, backendRoles: string[]): boolean {
    if (role === 'business') return backendRoles.includes('ORGANIZER');
    if (role === 'dj') return backendRoles.includes('DJ');
    return true; // 'user' is always allowed
}

export const RoleProvider: React.FC<RoleProviderProps> = ({ children }) => {
    const { user, isLoading: authLoading } = useAuth();
    const [currentRole, setCurrentRole] = useState<UserRole>('user');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;

        loadPersistedRole().then(async saved => {
            const backendRoles = user?.roles ?? [];
            if (saved && isRoleAllowed(saved, backendRoles)) {
                setCurrentRole(saved);
            } else {
                // Persisted role is no longer valid — clear it and fall back
                await clearPersistedRole();
                setCurrentRole('user');
            }
            setIsLoading(false);
        });
    // user?.id is a stable primitive — avoids re-running on every new user object reference
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authLoading, user?.id]);

    const switchRole = async (role: UserRole) => {
        if (role === currentRole) return;
        const backendRoles = user?.roles ?? [];
        if (!isRoleAllowed(role, backendRoles)) return;
        setIsLoading(true);
        await persistRole(role);
        setCurrentRole(role);
        setIsLoading(false);
    };

    return (
        <RoleContext.Provider value={{ currentRole, isLoading, switchRole }}>
            {children}
        </RoleContext.Provider>
    );
};
