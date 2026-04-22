import axios from 'axios';
import { getAuthHeaders } from '../../auth/services/auth.service';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface Venue {
    id: string;
    name: string;
    address: string;
    description?: string;
    imageUrl?: string;
}

export interface CreateVenueDto {
    name: string;
    address: string;
    description?: string;
}

// GET /venues/timezones
export const getVenueTimezones = async (): Promise<string[]> => {
    const response = await axios.get(`${API_URL}/venues/timezones`);
    return response.data;
};

export const getVenues = async (): Promise<Venue[]> => {
    const response = await axios.get(`${API_URL}/venues`);
    return response.data;
};

export const getMyVenues = async (): Promise<Venue[]> => {
    const config = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/venues/my-venues`, config);
    return response.data;
};

export const getVenueById = async (venueId: string): Promise<Venue> => {
    const response = await axios.get(`${API_URL}/venues/${venueId}`);
    return response.data;
};

export const createVenue = async (data: CreateVenueDto): Promise<Venue> => {
    const config = await getAuthHeaders();
    const response = await axios.post(`${API_URL}/venues`, data, config);
    return response.data;
};

export const updateVenue = async (venueId: string, data: Partial<CreateVenueDto>): Promise<Venue> => {
    const config = await getAuthHeaders();
    const response = await axios.patch(`${API_URL}/venues/${venueId}`, data, config);
    return response.data;
};

export const deleteVenue = async (venueId: string): Promise<void> => {
    const config = await getAuthHeaders();
    await axios.delete(`${API_URL}/venues/${venueId}`, config);
};

// --- Venue media ---

export const uploadVenueMedia = async (venueId: string, fileUri: string, type: 'image' | 'video' = 'image'): Promise<{ url: string }> => {
    const config = await getAuthHeaders(true);
    const formData = new FormData();
    const filename = fileUri.split('/').pop() ?? 'upload';
    const mimeType = type === 'video' ? 'video/mp4' : 'image/jpeg';
    formData.append('file', { uri: fileUri, name: filename, type: mimeType } as any);
    const response = await axios.post(`${API_URL}/venues/${venueId}/media?type=${type}`, formData, config);
    return response.data;
};

// --- Venue reviews ---

export interface VenueReview {
    id: string;
    userId: string;
    score: number;
    comment?: string;
    createdAt: string;
}

export interface VenueReviewsResponse {
    stats: { averageScore: number; totalReviews: number };
    reviews: VenueReview[];
}

export const submitVenueReview = async (venueId: string, score: number, comment?: string): Promise<{ id: string }> => {
    const config = await getAuthHeaders();
    const response = await axios.post(`${API_URL}/venues/${venueId}/reviews`, { score, comment }, config);
    return response.data;
};

export const getVenueReviews = async (venueId: string): Promise<VenueReviewsResponse> => {
    const response = await axios.get(`${API_URL}/venues/${venueId}/reviews`);
    return response.data;
};
