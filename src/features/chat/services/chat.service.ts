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

// Renamed to getMessages to reflect that it fetches messages
export const getChatMessages = async (eventId: string, otherUserId: string): Promise<Message[]> => {
    try {
        const headers = await getAuthHeaders();
        const response = await axios.get(`${API_URL}/events/${eventId}/chats/${otherUserId}/messages`, headers);

        console.log(response.data, "response en chat service");

        return response.data;

    } catch (error) {
        console.log(error, "error en chat service");
        return [];

    }
};

// Renamed to endEvent/endChat based on usage
export const endChatEvent = async (eventId: string): Promise<any> => {
    const headers = await getAuthHeaders();
    // User requested POST for this endpoint
    const response = await axios.post(`${API_URL}/events/${eventId}/end`, {}, headers);
    return response.data;
};


