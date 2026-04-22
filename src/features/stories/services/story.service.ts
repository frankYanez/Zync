import axios from 'axios';
import { getAuthHeaders } from '../../auth/services/auth.service';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface Story {
    id: string;
    userId: string;
    eventId: string;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    text?: string;
    createdAt: string;
    expiresAt: string;
    viewCount: number;
    seenByViewer: boolean;
    isDjStory: boolean;
}

// POST /stories
export const createStory = async (formData: FormData): Promise<Story> => {
    const config = await getAuthHeaders(true);
    const response = await axios.post(`${API_URL}/stories`, formData, config);
    return response.data;
};

// DELETE /stories/:storyId
export const deleteStory = async (storyId: string): Promise<void> => {
    const config = await getAuthHeaders();
    await axios.delete(`${API_URL}/stories/${storyId}`, config);
};

// POST /stories/:storyId/seen
export const markStorySeen = async (storyId: string): Promise<void> => {
    const config = await getAuthHeaders();
    await axios.post(`${API_URL}/stories/${storyId}/seen`, {}, config);
};

// GET /stories/events/:eventId/stories  (DJs first)
export const getEventStories = async (eventId: string): Promise<Story[]> => {
    const config = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/stories/events/${eventId}/stories`, config);
    return response.data;
};

// GET /stories/events/:eventId/users/:userId/stories
export const getUserStoriesInEvent = async (eventId: string, userId: string): Promise<Story[]> => {
    const config = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/stories/events/${eventId}/users/${userId}/stories`, config);
    return response.data;
};
