import axios from 'axios';
import { AuthResponse } from '../domain/auth.types';
import { setToken, setRefreshToken, getMe } from './auth.service';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const loginWithGoogleAccessToken = async (accessToken: string): Promise<AuthResponse> => {
    const response = await axios.post(`${API_URL}/auth/google`, { accessToken });
    const data = response.data;

    if (data.accessToken) {
        await setToken(data.accessToken);
        if (data.refreshToken) await setRefreshToken(data.refreshToken);
        const user = await getMe();
        return { accessToken: data.accessToken, user };
    }

    throw new Error('Google login failed');
};
