import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { AuthResponse, LoginUserDto, RegisterDto, User } from '../domain/auth.types';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const STORAGE_KEY = 'auth_token';
const REFRESH_STORAGE_KEY = 'refresh_token';

let cachedToken: string | null = null;
let cachedRefreshToken: string | null = null;

export const login = async (loginDto: LoginUserDto): Promise<AuthResponse> => {
    const response = await axios.post(`${API_URL}/auth/login`, loginDto);
    const data = response.data;
    if (data.accessToken) {
        await setToken(data.accessToken);
        if (data.refreshToken) await setRefreshToken(data.refreshToken);
        const user = await getMe();
        return { accessToken: data.accessToken, user };
    }
    throw new Error('Login failed');
};

export const register = async (registerDto: RegisterDto): Promise<void> => {
    await axios.post(`${API_URL}/auth/register`, registerDto);
};

export const verifyEmail = async (email: string, otp: string): Promise<boolean> => {
    try {
        await axios.post(`${API_URL}/email/verify`, { email, otp });
        return true;
    } catch (error) {
        throw error;
    }
};

export const resendVerification = async (email: string): Promise<void> => {
    await axios.post(`${API_URL}/email/resend`, { email });
};

export const requestEmailVerification = async (email: string): Promise<void> => {
    await axios.post(`${API_URL}/email/request`, { email });
};

export const logout = async (): Promise<void> => {
    cachedToken = null;
    cachedRefreshToken = null;
    if (Platform.OS !== 'web') {
        await SecureStore.deleteItemAsync(STORAGE_KEY);
        await SecureStore.deleteItemAsync(REFRESH_STORAGE_KEY);
    } else {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(REFRESH_STORAGE_KEY);
    }
};

export const checkAuth = async (): Promise<User | null> => {
    const token = await getToken();
    if (!token) return null;
    try {
        return await getMe();
    } catch (error) {
        await logout();
        return null;
    }
};

export const getMe = async (): Promise<User> => {
    const token = await getToken();
    const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const setToken = async (token: string) => {
    cachedToken = token;
    if (Platform.OS !== 'web') {
        await SecureStore.setItemAsync(STORAGE_KEY, token);
    } else {
        localStorage.setItem(STORAGE_KEY, token);
    }
};

export const getToken = async (): Promise<string | null> => {
    if (cachedToken) return cachedToken;
    if (Platform.OS !== 'web') {
        cachedToken = await SecureStore.getItemAsync(STORAGE_KEY);
    } else {
        cachedToken = localStorage.getItem(STORAGE_KEY);
    }
    return cachedToken;
};

export const setRefreshToken = async (token: string) => {
    cachedRefreshToken = token;
    if (Platform.OS !== 'web') {
        await SecureStore.setItemAsync(REFRESH_STORAGE_KEY, token);
    } else {
        localStorage.setItem(REFRESH_STORAGE_KEY, token);
    }
};

export const getRefreshToken = async (): Promise<string | null> => {
    if (cachedRefreshToken) return cachedRefreshToken;
    if (Platform.OS !== 'web') {
        cachedRefreshToken = await SecureStore.getItemAsync(REFRESH_STORAGE_KEY);
    } else {
        cachedRefreshToken = localStorage.getItem(REFRESH_STORAGE_KEY);
    }
    return cachedRefreshToken;
};

export const refreshToken = async (refreshTokenValue: string): Promise<string> => {
    const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken: refreshTokenValue });
    if (response.data.accessToken) {
        await setToken(response.data.accessToken);
        if (response.data.refreshToken) await setRefreshToken(response.data.refreshToken);
        return response.data.accessToken;
    }
    throw new Error('Failed to refresh token');
};

export const forgotPassword = async (email: string): Promise<void> => {
    await axios.post(`${API_URL}/auth/forgot-password`, { email });
};

export const resetPassword = async (email: string, code: string, newPassword: string): Promise<void> => {
    await axios.post(`${API_URL}/auth/reset-password`, { email, code, newPassword });
};

export const getAuthHeaders = async (isMultipart = false) => {
    const tokenRaw = await getToken();
    const jwt = typeof tokenRaw === 'string' ? tokenRaw : (tokenRaw as any)?.token;

    if (!jwt || typeof jwt !== 'string') {
        throw new Error('JWT inválido o vacío.');
    }

    const cleanJwt = jwt.startsWith('Bearer ') ? jwt.replace('Bearer ', '') : jwt;

    return {
        headers: {
            Authorization: `Bearer ${cleanJwt}`,
            Accept: 'application/json',
            'Content-Type': isMultipart ? 'multipart/form-data' : 'application/json',
        },
    };
};
