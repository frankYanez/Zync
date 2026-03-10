import axios from 'axios';
import { getAuthHeaders } from '../../auth/services/auth.service';
import { DjProfile, Gig, PromoCode } from '../domain/dj.types';

const API_URL = 'http://44.222.141.70:3000';

// 1. GET /dj - Query params: genre
export const getDjs = async (genre?: string): Promise<DjProfile[]> => {
    const response = await axios.get(`${API_URL}/dj`, {
        params: { genre }
    });
    return response.data;
};

// Fetch current user's DJ profile (helper using the above endpoint and filtering)
export const getMyDjProfile = async (userId: string): Promise<DjProfile | null> => {
    try {
        const djs = await getDjs();
        const myProfile = djs.find(dj => dj.userId === userId);
        return myProfile || null;
    } catch (error) {
        console.error("Error fetching my DJ profile:", error);
        return null;
    }
};

// 2. GET /dj/:djProfileId/gigs
export const getDjGigs = async (djProfileId: string): Promise<Gig[]> => {
    const response = await axios.get(`${API_URL}/dj/${djProfileId}/gigs`);
    return response.data;
};

// 3. POST /dj/:djProfileId/follow (auth)
export const followDj = async (djProfileId: string): Promise<{ success: boolean }> => {
    const headers = await getAuthHeaders();
    const response = await axios.post(`${API_URL}/dj/${djProfileId}/follow`, {}, headers);
    return response.data;
};

// 4. DELETE /dj/:djProfileId/follow (auth)
export const unfollowDj = async (djProfileId: string): Promise<{ success: boolean }> => {
    const headers = await getAuthHeaders();
    const response = await axios.delete(`${API_URL}/dj/${djProfileId}/follow`, headers);
    return response.data;
};

// 5. POST /dj/:djProfileId/events/:eventId/lineup (auth)
export const addDjToLineup = async (djProfileId: string, eventId: string): Promise<{ success: boolean }> => {
    const headers = await getAuthHeaders();
    const response = await axios.post(`${API_URL}/dj/${djProfileId}/events/${eventId}/lineup`, {}, headers);
    return response.data;
};

// 6. POST /dj/:djProfileId/promo-codes (auth)
export const generatePromoCode = async (djProfileId: string, eventId: string): Promise<{ code: string }> => {
    const headers = await getAuthHeaders();
    const response = await axios.post(`${API_URL}/dj/${djProfileId}/promo-codes`, { eventId }, headers);
    return response.data;
};

// 7. GET /dj/:djProfileId/promo-codes (auth)
export const getDjPromoCodes = async (djProfileId: string): Promise<PromoCode[]> => {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/dj/${djProfileId}/promo-codes`, headers);
    return response.data;
};

// 8. POST /dj/promo-codes/:code/redeem
export const redeemPromoCode = async (code: string): Promise<{ code: string; usedCount: number }> => {
    const response = await axios.post(`${API_URL}/dj/promo-codes/${code}/redeem`);
    return response.data;
};
