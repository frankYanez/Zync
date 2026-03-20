import axios from 'axios';
import { getAuthHeaders } from '../../auth/services/auth.service';
import { DjProfile, DjReviewsResponse, Gig, PromoCode } from '../domain/dj.types';

const API_URL = 'http://44.222.141.70:3000';

// 1. GET /dj - Query params: genre
export const getDjs = async (genre?: string): Promise<DjProfile[]> => {
    const response = await axios.get(`${API_URL}/dj`, {
        params: { genre }
    });
    return response.data;
};

// Fetch a single DJ profile by its djProfileId
export const getDjById = async (djProfileId: string): Promise<DjProfile | null> => {
    try {
        const response = await axios.get(`${API_URL}/dj/${djProfileId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching DJ by ID:', error);
        return null;
    }
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

export const generatePromoCode = async (djProfileId: string, eventId: string): Promise<{ code: string }> => {
    const headers = await getAuthHeaders();
    
    // Fetch DJ profile to get artist name
    const djProfile = await getDjById(djProfileId);
    if (!djProfile) throw new Error("DJ Profile not found");

    const artistName = djProfile.artistName
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .substring(0, 8);
    
    const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase();
    const customCode = `${artistName}_ZYNC_${randomChars}`;

    const response = await axios.post(`${API_URL}/dj/${djProfileId}/promo-codes`, { 
        eventId,
        code: customCode 
    }, headers);
    
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

// 9. GET /dj/:djProfileId/reviews
export const getDjReviews = async (djProfileId: string): Promise<DjReviewsResponse> => {
    const response = await axios.get(`${API_URL}/dj/${djProfileId}/reviews`);
    return response.data;
};

// 10. POST /dj/:djProfileId/events/:eventId/reviews (auth)
export const submitDjReview = async (
    djProfileId: string,
    eventId: string,
    score: number,
    comment?: string,
): Promise<{ id: string }> => {
    const headers = await getAuthHeaders();
    const response = await axios.post(
        `${API_URL}/dj/${djProfileId}/events/${eventId}/reviews`,
        { score, comment },
        headers,
    );
    return response.data;
};
