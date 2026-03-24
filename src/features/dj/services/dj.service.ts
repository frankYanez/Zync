import axios from 'axios';
import { getAuthHeaders } from '../../auth/services/auth.service';
import { CreateGigDto, CreatePromoCodeDto, DjProfile, DjReviewsResponse, DjStats, Gig, GigStatus, PromoCode } from '../domain/dj.types';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

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
        if (!myProfile) return null;
        // Fetch full profile to get logoUrl, bannerUrl and all fields
        return await getDjById(myProfile.id);
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

// GET /dj/:djProfileId/stats
export const getDjStats = async (djProfileId: string): Promise<DjStats> => {
    const config = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/dj/${djProfileId}/stats`, config);
    return response.data;
};

// PATCH /dj/:djProfileId  { acceptingRequests: boolean }
export const toggleAcceptingRequests = async (djProfileId: string, accepting: boolean): Promise<void> => {
    const config = await getAuthHeaders();
    await axios.patch(`${API_URL}/dj/${djProfileId}`, { acceptingRequests: accepting }, config);
};

// POST /dj/:djProfileId/gigs
// TODO: replace mock → await axios.post(`${API_URL}/dj/${djProfileId}/gigs`, data, await getAuthHeaders())
export const createGig = async (djProfileId: string, data: CreateGigDto): Promise<Gig> => {
    return {
        id: Math.random().toString(36).substring(2, 10),
        eventId: data.eventId ?? '',
        eventName: data.eventId ? 'Evento vinculado' : data.venueName,
        venueName: data.venueName,
        startsAt: data.startsAt,
        endsAt: data.endsAt,
        fee: data.fee,
        status: 'pending',
    };
};

// PATCH /dj/:djProfileId/gigs/:gigId
// TODO: replace mock → await axios.patch(`${API_URL}/dj/${djProfileId}/gigs/${gigId}`, data, await getAuthHeaders())
export const updateGigStatus = async (_djProfileId: string, gigId: string, status: GigStatus): Promise<{ id: string; status: GigStatus }> => {
    return { id: gigId, status };
};

// DELETE /dj/:djProfileId/gigs/:gigId
// TODO: replace mock → await axios.delete(`${API_URL}/dj/${djProfileId}/gigs/${gigId}`, await getAuthHeaders())
export const deleteGig = async (_djProfileId: string, _gigId: string): Promise<void> => {
    // mock: no-op
};

// POST /events/:eventId/broadcast
// TODO: replace mock → await axios.post(`${API_URL}/events/${eventId}/broadcast`, { message, type }, await getAuthHeaders())
export const sendBroadcast = async (_eventId: string, _message: string, _type: 'announcement' | 'song' = 'announcement'): Promise<void> => {
    // mock: no-op
};

// 3. POST /dj/:djProfileId/follow (auth)
export const followDj = async (djProfileId: string): Promise<{ success: boolean }> => {
    const headers = await getAuthHeaders();
    const response = await axios.post(`${API_URL}/dj/${djProfileId}/follow`, {}, headers);
    console.log(response.data, "response follow");

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

// Organizer: GET /events/:eventId/djs/:djProfileId/promo-codes
export const getEventPromoCodes = async (eventId: string, djProfileId: string): Promise<PromoCode[]> => {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/events/${eventId}/djs/${djProfileId}/promo-codes`, headers);
    return response.data;
};

// Organizer: POST /events/:eventId/djs/:djProfileId/promo-codes
export const createOrganizerPromoCode = async (
    eventId: string,
    djProfileId: string,
    dto?: Partial<CreatePromoCodeDto>,
): Promise<PromoCode> => {
    const headers = await getAuthHeaders();
    const djProfile = await getDjById(djProfileId);
    const artistName = (djProfile?.artistName ?? 'DJ')
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .substring(0, 8);
    const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase();
    const body: CreatePromoCodeDto = {
        code: dto?.code ?? `${artistName}_ZYNC_${randomChars}`,
        discountPercentage: dto?.discountPercentage ?? 10,
        maxUses: dto?.maxUses ?? 100,
        expiresAt: dto?.expiresAt ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    };
    const response = await axios.post(
        `${API_URL}/events/${eventId}/djs/${djProfileId}/promo-codes`,
        body,
        headers,
    );
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
