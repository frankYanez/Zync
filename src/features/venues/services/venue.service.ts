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

const MOCK_VENUES: Venue[] = [
    { id: 'venue-mock-1', name: 'Club Vértigo', address: 'Av. Corrientes 1234, CABA', description: 'El mejor club de Buenos Aires' },
];

export const getVenues = async (): Promise<Venue[]> => {
    const response = await axios.get(`${API_URL}/venues`);
    return response.data;
};

// TODO: replace mock → axios.get(`${API_URL}/venues/my-venues`, config)
export const getMyVenues = async (): Promise<Venue[]> => {
    return [...MOCK_VENUES];
};

export const getVenueById = async (venueId: string): Promise<Venue> => {
    const response = await axios.get(`${API_URL}/venues/${venueId}`);
    return response.data;
};

// TODO: replace mock → axios.post(`${API_URL}/venues`, data, config)
export const createVenue = async (data: CreateVenueDto): Promise<Venue> => {
    const newVenue: Venue = { id: `venue-${Date.now()}`, ...data };
    MOCK_VENUES.push(newVenue);
    return newVenue;
};

export const updateVenue = async (venueId: string, data: Partial<CreateVenueDto>): Promise<Venue> => {
    const config = await getAuthHeaders();
    const response = await axios.patch(`${API_URL}/venues/${venueId}`, data, config);
    return response.data;
};

// TODO: replace mock → axios.delete(`${API_URL}/venues/${venueId}`, config)
export const deleteVenue = async (venueId: string): Promise<void> => {
    const idx = MOCK_VENUES.findIndex(v => v.id === venueId);
    if (idx !== -1) MOCK_VENUES.splice(idx, 1);
};
