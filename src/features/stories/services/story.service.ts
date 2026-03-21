import axios from 'axios';
import { getAuthHeaders } from '../../auth/services/auth.service';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

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
