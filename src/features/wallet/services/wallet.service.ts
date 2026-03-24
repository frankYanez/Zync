import axios from 'axios';
import { getAuthHeaders } from '@/features/auth/services/auth.service';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface WalletBalance {
    balance: number;
    zyncPoints: number;
}

// POST /wallet/topup  { amount }
// TODO: replace mock → await axios.post(`${API_URL}/wallet/topup`, { amount }, await getAuthHeaders())
export const topUp = async (amount: number): Promise<WalletBalance> => {
    // mock: simula respuesta del servidor
    return { balance: amount, zyncPoints: Math.floor(amount / 100) };
};

// GET /wallet/balance
// TODO: replace mock → await axios.get(`${API_URL}/wallet/balance`, await getAuthHeaders())
export const getBalance = async (): Promise<WalletBalance> => {
    const config = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/wallet/balance`, config);
    return response.data;
};
