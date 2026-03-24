import axios from 'axios';
import { getAuthHeaders } from '../../auth/services/auth.service';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

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
    const response = await axios.patch(`${API_URL}/users/profile`, profileData, config);
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
    console.log(response.data, 'response updateDjProfile');

    return response.data;
};

export const getOrganizerProfile = async () => {
    const config = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/users/me/organizer-profile`, config);
    return response.data;
};

export const updateOrganizerProfile = async (organizerData: any) => {
    const config = await getAuthHeaders();
    const response = await axios.post(`${API_URL}/users/me/organizer-profile`, organizerData, config);
    return response.data;
};

export const patchOrganizerProfile = async (data: any) => {
    const config = await getAuthHeaders();
    const response = await axios.patch(`${API_URL}/users/me/organizer-profile`, data, config);
    return response.data;
};

export const uploadOrganizerLogo = async (formData: FormData) => {
    const config = await getAuthHeaders(true);
    const response = await axios.patch(`${API_URL}/users/me/organizer-profile/logo`, formData, config);
    return response.data;
};

export const uploadOrganizerBanner = async (formData: FormData) => {
    const config = await getAuthHeaders(true);
    const response = await axios.patch(`${API_URL}/users/me/organizer-profile/banner`, formData, config);
    return response.data;
};

export const patchDjProfile = async (djData: any) => {
    const config = await getAuthHeaders();
    const response = await axios.patch(`${API_URL}/users/me/dj-profile`, djData, config);
    return response.data;
};

export const uploadDjLogo = async (formData: FormData) => {
    const config = await getAuthHeaders(true);
    const response = await axios.patch(`${API_URL}/users/me/dj-profile/logo`, formData, config);
    return response.data;
};

export const uploadDjBanner = async (formData: FormData) => {
    const config = await getAuthHeaders(true);
    const response = await axios.patch(`${API_URL}/users/me/dj-profile/banner`, formData, config);
    return response.data;
};
