import axios from 'axios';
import { getToken } from '../../auth/services/auth.service';

const API_URL = 'http://44.222.141.70:3000';

const getAuthHeaders = async () => {
    const tokenRaw = await getToken();
    const jwt = typeof tokenRaw === 'string' ? tokenRaw : (tokenRaw as any)?.token;

    if (!jwt || typeof jwt !== 'string') {
        throw new Error('EventService: JWT inválido o vacío.');
    }

    const cleanJwt = jwt.startsWith('Bearer ') ? jwt.replace('Bearer ', '') : jwt;

    return {
        headers: {
            Authorization: `Bearer ${cleanJwt}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    };
};

export const getEvents = async (skip: number = 0, take: number = 10) => {
    // This endpoint may not require auth, but if it does, use getAuthHeaders. Assume it's public initially or pass auth just in case.
    const response = await axios.get(`${API_URL}/events`, {
        params: { skip, take }
    });
    return response.data;
};
