import axios from 'axios';
import { getAuthHeaders } from '../../auth/services/auth.service';
import { Message } from '../domain/chat.types';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Normalize raw message from server to app's Message shape.
// REST and socket send `userId` (group) or `fromUserId` (private), and `sentAt` instead of `createdAt`.
const normalizeMessage = (raw: any): Message => ({
    id: raw.id,
    fromUserId: raw.fromUserId || raw.userId,
    content: raw.content,
    createdAt: raw.createdAt || raw.sentAt,
    sender: raw.sender,
    deliveredAt: raw.deliveredAt,
    seenAt: raw.seenAt,
});

// GET /chats/:eventId/public/messages
export const getEventMessages = async (eventId: string): Promise<Message[]> => {
    try {
        const headers = await getAuthHeaders();
        const response = await axios.get(`${API_URL}/chats/${eventId}/public/messages`, headers);

        let raw: any[] = [];
        if (Array.isArray(response.data)) {
            raw = response.data;
        } else if (response.data && Array.isArray(response.data.messages)) {
            raw = response.data.messages;
        } else if (response.data && Array.isArray(response.data.data)) {
            raw = response.data.data;
        }

        return raw.map(normalizeMessage);
    } catch (error) {
        console.error('Error fetching group messages:', error);
        return [];
    }
};

// GET /chats/:eventId/private/:otherUserId/messages
export const getChatMessages = async (eventId: string, otherUserId: string): Promise<Message[]> => {
    try {
        const headers = await getAuthHeaders();
        const response = await axios.get(`${API_URL}/chats/${eventId}/private/${otherUserId}/messages`, headers);

        let raw: any[] = [];
        if (Array.isArray(response.data)) {
            raw = response.data;
        } else if (response.data && Array.isArray(response.data.messages)) {
            raw = response.data.messages;
        } else if (response.data && Array.isArray(response.data.data)) {
            raw = response.data.data;
        }

        return raw.map(normalizeMessage);
    } catch (error) {
        console.error('Error fetching private messages:', error);
        return [];
    }
};
