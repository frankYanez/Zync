import axios from 'axios';
import { getAuthHeaders } from '@/features/auth/services/auth.service';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export type UserTier = 'bronze' | 'silver' | 'gold';

export interface UserStats {
    totalOrders: number;
    totalSpent: number;
    tier: UserTier;
}

// GET /users/me/stats
export const getUserStats = async (): Promise<UserStats> => {
    const config = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/users/me/stats`, config);
    return response.data;
};
