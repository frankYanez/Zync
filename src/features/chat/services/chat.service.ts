import axios from 'axios';
import { getAuthHeaders } from '../../auth/services/auth.service';
import { Message } from '../domain/chat.types';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

//Historial del chat 1 a 1
export const getChatMessages = async (eventId: string, otherUserId: string): Promise<Message[]> => {
    try {
        const headers = await getAuthHeaders();
        const response = await axios.get(`${API_URL}/chats/${eventId}/private/${otherUserId}/messages`, headers);

        if (Array.isArray(response.data)) {
            return response.data;
        } else if (response.data && Array.isArray(response.data.messages)) {
            return response.data.messages;
        } else if (response.data && Array.isArray(response.data.data)) {
            return response.data.data;
        }

        return [];

    } catch (error) {
        console.log(error, "error en chat service");
        return [];

    }
};

//Lista de chats de un usuario
export const getChats = async (eventId: string): Promise<any[]> => {
    try {
        const headers = await getAuthHeaders();
        const response = await axios.get(`${API_URL}/chats/${eventId}/conversations`, headers);

        if (Array.isArray(response.data)) return response.data;
        if (response.data && Array.isArray(response.data.chats)) return response.data.chats;
        if (response.data && Array.isArray(response.data.data)) return response.data.data;

        return [];
    } catch (error) {
        console.log("Error fetching chats:", error);
        return [];
    }
};

//Termina el chat y limpia los mensajes
export const endChatEvent = async (eventId: string): Promise<any> => {
    const headers = await getAuthHeaders();
    // User requested POST for this endpoint
    const response = await axios.post(`${API_URL}/chats/${eventId}/cleanup`, {}, headers);
    return response.data;
};

export const getEventMessages = async (eventId: string): Promise<Message[]> => {
    try {
        const headers = await getAuthHeaders();
        // Updated to match backend doc: /event-chat/messages
        const response = await axios.get(`${API_URL}/chats/${eventId}/public/messages`, headers);

        if (Array.isArray(response.data)) {
            return response.data;
        } else if (response.data && Array.isArray(response.data.messages)) {
            return response.data.messages;
        } else if (response.data && Array.isArray(response.data.data)) {
            return response.data.data;
        }

        return [];
    } catch (error) {
        console.log(error, "error en getEventMessages");
        return [];
    }
};






export const enterEvent = async (eventId: string): Promise<boolean> => {
    try {
        const headers = await getAuthHeaders();
        const response = await axios.post(`${API_URL}/events/${eventId}/enter`, {}, headers);
        return response.data;
    } catch (error) {
        console.error("Error entering event:", error);
        return false;
    }
};

export const leaveEventApi = async (eventId: string): Promise<boolean> => {
    try {
        const headers = await getAuthHeaders();
        const response = await axios.post(`${API_URL}/events/${eventId}/leave`, {}, headers);
        return response.data;
    } catch (error) {
        console.error("Error leaving event:", error);
        return false;
    }
};
