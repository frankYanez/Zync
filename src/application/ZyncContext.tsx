import React, { createContext, useContext, useEffect, useState } from 'react';

type User = {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    balance: number;
} | null;

type AuthState = {
    isAuthenticated: boolean;
    user: User;
    token: string | null;
};

type ZyncContextType = {
    authState: AuthState;
    login: (email: string) => Promise<void>;
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
        // Mock login logic
        setAuthState({
            isAuthenticated: true,
            token: 'mock-token-xyz',
            user: {
                id: '1',
                name: 'Cyber User',
                email,
                role: 'user',
                balance: 15000,
            },
        });
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
