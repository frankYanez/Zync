import { clearPersistedRole } from '@/context/role-storage';
import { LoginUserDto, RegisterDto, User } from '@/features/auth/domain/auth.types';
import * as authService from '@/features/auth/services/auth.service';
import { loginWithGoogleAccessToken } from '@/features/auth/services/google-auth.service';
import { disconnectSocket } from '@/features/chat/services/socket.service';
import { registerForPushNotifications, savePushToken } from '@/features/notifications/services/notifications.service';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    isLoading: boolean;
    register: (data: RegisterDto) => Promise<boolean>;
    login: (data: LoginUserDto) => Promise<boolean>;
    loginWithGoogle: (accessToken: string) => Promise<boolean>;
    logout: () => Promise<void>;
    verifyEmail: (email: string, otp: string) => Promise<boolean>;
    resendVerification: (email: string) => Promise<void>;
    requestEmailVerification: (email: string) => Promise<void>;
    updateUser: (user: User) => void;
    updateBalance: (amount: number) => void;
    checkUser: () => Promise<void>;
    refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const user = await authService.checkAuth();

            console.log(user, "user en checkuser");

            setUser(user);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const registerPushToken = async () => {
        try {
            const token = await registerForPushNotifications();
            if (token) await savePushToken(token);
        } catch (e) {
            console.warn('Push token registration failed:', e);
        }
    };

    const login = async (loginDto: LoginUserDto) => {
        const response = await authService.login(loginDto);
        setUser(response.user);
        registerPushToken();
        return true;
    };

    const loginWithGoogle = async (accessToken: string) => {
        const response = await loginWithGoogleAccessToken(accessToken);
        setUser(response.user);
        registerPushToken();
        return true;
    };

    const register = async (registerDto: RegisterDto) => {
        try {
            await authService.register(registerDto);
            return true;
        } catch (error: any) {
            console.error('Registration Error Details:', error.response?.data || error.message);
            throw error;
        }
    };

    const verifyEmail = async (email: string, otp: string) => {
        return await authService.verifyEmail(email, otp);
    };

    const resendVerification = async (email: string) => {
        await authService.resendVerification(email);
    };

    const requestEmailVerification = async (email: string) => {
        await authService.requestEmailVerification(email);
    };

    const logout = async () => {
        disconnectSocket();
        await authService.logout();
        await clearPersistedRole();
        setUser(null);
    };

    const updateUser = async (updatedUser: User) => {
        checkUser();
    };

    // Refresh JWT using the stored refresh token, then reload user from /auth/me.
    // Call this after role-changing operations (e.g. creating a DJ profile) so
    // the new role is reflected in the JWT and in user.roles.
    const refreshSession = async () => {
        try {
            const storedRefresh = await authService.getRefreshToken();
            if (storedRefresh) {
                await authService.refreshToken(storedRefresh);
            }
            // Reload user from /auth/me (now backed by the fresh JWT)
            await checkUser();
        } catch {
            // If refresh fails just reload whatever /auth/me returns
            await checkUser();
        }
    };

    const updateBalance = (amount: number) => {
        if (user) {
            setUser({ ...user, zyncPoints: user.zyncPoints + amount });
        }
    };

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated: !!user,
                user,
                isLoading,
                register,
                login,
                loginWithGoogle,
                logout,
                verifyEmail,
                resendVerification,
                requestEmailVerification,
                updateUser,
                updateBalance,
                checkUser,
                refreshSession,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
