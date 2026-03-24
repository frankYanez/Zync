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
// TODO: replace mock → await axios.get(`${API_URL}/users/me/stats`, await getAuthHeaders())
export const getUserStats = async (): Promise<UserStats> => {
    return { totalOrders: 0, totalSpent: 0, tier: 'bronze' };
};
