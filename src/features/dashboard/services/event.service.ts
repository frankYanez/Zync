import axios from 'axios';

const API_URL = 'http://44.222.141.70:3000';

export const getEvents = async (skip: number = 0, take: number = 10) => {
    // This endpoint may not require auth, but if it does, use getAuthHeaders. Assume it's public initially or pass auth just in case.
    const response = await axios.get(`${API_URL}/events`, {
        params: { skip, take }
    });
    return response.data;
};
