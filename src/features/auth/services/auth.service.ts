import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { AuthResponse, LoginUserDto, RegisterDto, User } from '../domain/auth.types';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const STORAGE_KEY = 'auth_token';

let cachedToken: string | null = null;

export const login = async (loginDto: LoginUserDto): Promise<AuthResponse> => {
    const response = await axios.post(`${API_URL}/auth/login`, loginDto);

    console.log(response.data);

    const data = response.data;
    if (data.accessToken) {
        await setToken(data.accessToken);
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
    if (Platform.OS !== 'web') {
        await SecureStore.deleteItemAsync(STORAGE_KEY);
    } else {
        localStorage.removeItem(STORAGE_KEY);
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

const setToken = async (token: string) => {
    cachedToken = token;
    if (Platform.OS !== 'web') {
        await SecureStore.setItemAsync(STORAGE_KEY, token);
    } else {
        localStorage.setItem(STORAGE_KEY, token);
    }
};

const getToken = async (): Promise<string | null> => {
    if (cachedToken) return cachedToken;
    if (Platform.OS !== 'web') {
        cachedToken = await SecureStore.getItemAsync(STORAGE_KEY);
    } else {
        cachedToken = localStorage.getItem(STORAGE_KEY);
    }
    return cachedToken;
};
