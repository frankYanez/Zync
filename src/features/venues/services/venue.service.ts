import axios from 'axios';
import { getToken } from '../../auth/services/auth.service';

const API_URL = 'http://44.222.141.70:3000';

const getAuthHeaders = async () => {
    const tokenRaw = await getToken();
    const jwt = typeof tokenRaw === 'string' ? tokenRaw : (tokenRaw as any)?.token;

    if (!jwt || typeof jwt !== 'string') {
        throw new Error('VenueService: JWT inválido o vacío.');
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

export const createVenue = async (venueData: { name: string; description: string; address: string }) => {
    const config = await getAuthHeaders();
    const response = await axios.post(`${API_URL}/venues`, venueData, config);
    return response.data;
};

export const getMyVenues = async () => {
    const config = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/venues/my-venues`, config);
    return response.data;
};
