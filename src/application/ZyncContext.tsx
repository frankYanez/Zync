import { SpotifyTrack } from '@/infrastructure/spotify-service';
import React, { createContext, useContext, useEffect, useState } from 'react';

import { Establishment, MOCK_USERS, User } from '@/infrastructure/mock-data';

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
    currentEstablishment: Establishment | null;
    setEstablishment: (establishment: Establishment | null) => void;
    activeRequest: SpotifyTrack | null;
    submitSongRequest: (track: SpotifyTrack) => void;
    clearRequest: () => void;
};

const ZyncContext = createContext<ZyncContextType | undefined>(undefined);

export function ZyncProvider({ children }: { children: React.ReactNode }) {
    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: false,
        user: null,
        token: null,
    });

    const [currentEstablishment, setEstablishment] = useState<Establishment | null>(null);
    const [activeRequest, setActiveRequest] = useState<SpotifyTrack | null>(null);

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
        setEstablishment(null);
        setActiveRequest(null);
    };

    const updateBalance = (amount: number) => {
        if (authState.user) {
            setAuthState(prev => ({
                ...prev,
                user: { ...prev.user!, balance: amount }
            }));
        }
    };

    const submitSongRequest = (track: SpotifyTrack) => {
        setActiveRequest(track);
    };

    const clearRequest = () => {
        setActiveRequest(null);
    };

    return (
        <ZyncContext.Provider value={{
            authState,
            login,
            logout,
            updateBalance,
            currentEstablishment,
            setEstablishment,
            activeRequest,
            submitSongRequest,
            clearRequest
        }}>
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
