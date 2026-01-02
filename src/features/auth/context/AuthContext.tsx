import { LoginUserDto, RegisterDto, User } from '@/features/auth/domain/auth.types';
import * as authService from '@/features/auth/services/auth.service';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    isLoading: boolean;
    register: (data: RegisterDto) => Promise<boolean>;
    login: (data: LoginUserDto) => Promise<boolean>;
    logout: () => Promise<void>;
    verifyEmail: (email: string, otp: string) => Promise<boolean>;
    resendVerification: (email: string) => Promise<void>;
    requestEmailVerification: (email: string) => Promise<void>;
    updateUser: (user: User) => void;
    updateBalance: (amount: number) => void;
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
            setUser(user);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (loginDto: LoginUserDto) => {
        const response = await authService.login(loginDto);

        console.log(response);

        setUser(response.user);
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
        await authService.logout();
        setUser(null);
    };

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
    }

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
                logout,
                verifyEmail,
                resendVerification,
                requestEmailVerification,
                updateUser,
                updateBalance,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
