import axios from 'axios';
import { getAuthHeaders } from '../../auth/services/auth.service';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const getVenues = async () => {
    const response = await axios.get(`${API_URL}/venues`);
    return response.data;
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
