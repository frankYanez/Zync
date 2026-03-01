import axios from 'axios';
import { getToken } from '../../auth/services/auth.service';

const API_URL = 'http://44.222.141.70:3000';

const getAuthHeaders = async (isMultipart = false) => {
    const tokenRaw = await getToken();
    const jwt = typeof tokenRaw === 'string' ? tokenRaw : (tokenRaw as any)?.token;

    if (!jwt || typeof jwt !== 'string') {
        throw new Error('StoryService: JWT inválido o vacío.');
    }

    const cleanJwt = jwt.startsWith('Bearer ') ? jwt.replace('Bearer ', '') : jwt;

    return {
        headers: {
            Authorization: `Bearer ${cleanJwt}`,
            Accept: 'application/json',
            'Content-Type': isMultipart ? 'multipart/form-data' : 'application/json',
        },
    };
};

export const createStory = async (formData: FormData) => {
    const config = await getAuthHeaders(true);
    const response = await axios.post(`${API_URL}/stories`, formData, config);
    return response.data;
};

export const getEventStories = async (eventId: string) => {
    const config = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/stories/events/${eventId}/stories`, config);
    return response.data;
};

export const getUserStoriesInEvent = async (eventId: string, userId: string) => {
    const config = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/stories/events/${eventId}/users/${userId}/stories`, config);
    return response.data;
};
