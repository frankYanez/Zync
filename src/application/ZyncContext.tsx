import React, { createContext, useContext, useEffect, useState } from 'react';

import { MOCK_USERS, User } from '@/infrastructure/mock-data';

// User type imported from mock-data

type AuthState = {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
};

type ZyncContextType = {
    authState: AuthState;
    login: (email: string) => Promise<boolean>;
    logout: () => Promise<void>;
    updateBalance: (amount: number) => void;
};

const ZyncContext = createContext<ZyncContextType | undefined>(undefined);

export function ZyncProvider({ children }: { children: React.ReactNode }) {
    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: false,
        user: null,
        token: null,
    });

    // Mock initial loading or check storage
    useEffect(() => {
        // Check local storage for token in a real app
    }, []);

    const login = async (email: string) => {
        // Mock login logic using MOCK_USERS
        const foundUser = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (foundUser) {
            setAuthState({
                isAuthenticated: true,
                token: 'mock-token-xyz',
                user: foundUser,
            });
            return true;
        }
        return false;
    };

    const logout = async () => {
        setAuthState({
            isAuthenticated: false,
            user: null,
            token: null,
        });
    };

    const updateBalance = (amount: number) => {
        if (authState.user) {
            setAuthState(prev => ({
                ...prev,
                user: { ...prev.user!, balance: amount }
            }));
        }
    };

    return (
        <ZyncContext.Provider value={{ authState, login, logout, updateBalance }}>
            {children}
        </ZyncContext.Provider>
    );
}

export function useZync() {
    const context = useContext(ZyncContext);
    if (context === undefined) {
        throw new Error('useZync must be used within a ZyncProvider');
    }
    return context;
}
