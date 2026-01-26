import axios from 'axios';
import { getToken } from '../../auth/services/auth.service';
import { Message } from '../domain/chat.types';

const API_URL = 'http://44.222.141.70:3000';

const getAuthHeaders = async () => {
    const tokenRaw = await getToken();

    console.log('ChatService tokenRaw type:', typeof tokenRaw);
    console.log('ChatService tokenRaw preview:', String(tokenRaw).slice(0, 12), '...');

    // soporta string o { token: string }
    const jwt =
        typeof tokenRaw === 'string'
            ? tokenRaw
            : (tokenRaw as any)?.token;

    if (!jwt || typeof jwt !== 'string') {
        throw new Error('ChatService: JWT inválido o vacío. Revisá getToken().');
    }

    // por si el token ya viene con "Bearer "
    const cleanJwt = jwt.startsWith('Bearer ') ? jwt.replace('Bearer ', '') : jwt;

    return {
        headers: {
            Authorization: `Bearer ${cleanJwt}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    };
};

//Historial del chat 1 a 1
export const getChatMessages = async (eventId: string, otherUserId: string): Promise<Message[]> => {
    try {
        const headers = await getAuthHeaders();
        const response = await axios.get(`${API_URL}/events/${eventId}/chats/${otherUserId}/messages`, headers);

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
        const response = await axios.get(`${API_URL}/events/${eventId}/chats`, headers);

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
    const response = await axios.post(`${API_URL}/events/${eventId}/end`, {}, headers);
    return response.data;
};

export const getEventMessages = async (eventId: string): Promise<Message[]> => {
    try {
        const headers = await getAuthHeaders();
        // Updated to match backend doc: /event-chat/messages
        const response = await axios.get(`${API_URL}/events/${eventId}/event-chat/messages`, headers);

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

export const sendPrivateMessage = async (eventId: string, otherUserId: string, content: string): Promise<Message> => {
    try {
        const headers = await getAuthHeaders();
        const response = await axios.post(
            `${API_URL}/events/${eventId}/chats/${otherUserId}/messages`,
            { content },
            headers
        );
        return response.data;
    } catch (error) {
        console.error("Error sending private message:", error);
        throw error;
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
