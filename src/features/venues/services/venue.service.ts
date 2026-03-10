import axios from 'axios';
import { getAuthHeaders } from '../../auth/services/auth.service';

const API_URL = 'http://44.222.141.70:3000';

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
