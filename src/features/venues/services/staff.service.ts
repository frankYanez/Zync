import axios from 'axios';
import { getAuthHeaders } from '../../auth/services/auth.service';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface StaffMember {
    id: string;
    userId: string;
    email: string;
    name: string;
    role: 'STAFF';
    venueId: string;
    createdAt: string;
}

// GET /venues/:venueId/staff
export const getVenueStaff = async (venueId: string): Promise<StaffMember[]> => {
    const config = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/venues/${venueId}/staff`, config);
    return response.data;
};

// POST /venues/:venueId/staff  { email }
export const addStaffMember = async (venueId: string, email: string): Promise<StaffMember> => {
    const config = await getAuthHeaders();
    const response = await axios.post(`${API_URL}/venues/${venueId}/staff`, { email }, config);
    return response.data;
};

// DELETE /venues/:venueId/staff/:staffId
export const removeStaffMember = async (venueId: string, staffId: string): Promise<void> => {
    const config = await getAuthHeaders();
    await axios.delete(`${API_URL}/venues/${venueId}/staff/${staffId}`, config);
};