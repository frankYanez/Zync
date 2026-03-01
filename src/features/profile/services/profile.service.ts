import axios from 'axios';
import { getToken } from '../../auth/services/auth.service';

const API_URL = 'http://44.222.141.70:3000';

/**
 * Helper function to retrieve and format the authorization token for backend requests.
 * Parses the locally stored token and appends it to the Request headers.
 * 
 * @param {boolean} isMultipart - Flag indicating if the request body is `multipart/form-data`.
 * @returns {Promise<{headers: Record<string, string>}>} The configured Axios headers object.
 * @throws Will throw an error if the JWT is invalid or empty.
 */
const getAuthHeaders = async (isMultipart = false) => {
    const tokenRaw = await getToken();
    const jwt = typeof tokenRaw === 'string' ? tokenRaw : (tokenRaw as any)?.token;

    if (!jwt || typeof jwt !== 'string') {
        throw new Error('ProfileService: JWT inválido o vacío.');
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

/**
 * Fetches the public profile information for a given user ID.
 * This endpoint does not necessarily require authentication depending on backend config.
 * 
 * @param {string} userId - The unique identifier of the user to fetch.
 * @returns {Promise<any>} The user's public profile data.
 */
export const getPublicProfile = async (userId: string) => {
    const response = await axios.get(`${API_URL}/users/${userId}/profile`);
    return response.data;
};

/**
 * Submits a partial update of the authenticated user's profile to the backend.
 * 
 * @param {Record<string, any>} profileData - Object containing the fields to update (e.g., firstName, phone).
 * @returns {Promise<any>} The updated user object returned from the server.
 */
export const updateProfile = async (profileData: any) => {
    const config = await getAuthHeaders();
    const response = await axios.patch(`${API_URL}/users/me/profile`, profileData, config);
    return response.data;
};

export const changePassword = async (data: any) => {
    const config = await getAuthHeaders();
    const response = await axios.post(`${API_URL}/users/me/change-password`, data, config);
    return response.data;
};

export const uploadAvatar = async (formData: FormData) => {
    const config = await getAuthHeaders(true);
    const response = await axios.post(`${API_URL}/users/me/avatar`, formData, config);
    return response.data;
};

export const deleteMyAccount = async () => {
    const config = await getAuthHeaders();
    const response = await axios.delete(`${API_URL}/users/me`, config);
    return response.data;
};

export const updatePushToken = async (pushToken: string) => {
    const config = await getAuthHeaders();
    const response = await axios.put(`${API_URL}/users/push-token`, { pushToken }, config);
    return response.data;
};

export const updateDjProfile = async (djData: any) => {
    const config = await getAuthHeaders();
    const response = await axios.post(`${API_URL}/users/me/dj-profile`, djData, config);
    return response.data;
};

export const updateOrganizerProfile = async (organizerData: any) => {
    const config = await getAuthHeaders();
    const response = await axios.post(`${API_URL}/users/me/organizer-profile`, organizerData, config);
    return response.data;
};
