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
