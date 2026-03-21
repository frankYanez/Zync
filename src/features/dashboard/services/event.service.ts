import axios from 'axios';
import { getAuthHeaders } from '../../auth/services/auth.service';
import { CreateEventDto, Event, LineupEntry } from '../domain/event.types';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const getEvents = async (skip: number = 0, take: number = 10): Promise<Event[]> => {
    const response = await axios.get(`${API_URL}/events`, { params: { skip, take } });
    return response.data;
};

export const getMyEvents = async (): Promise<Event[]> => {
    const config = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/events/my-events`, config);
    return response.data;
};

export const getEventById = async (eventId: string): Promise<Event> => {
    const response = await axios.get(`${API_URL}/events/${eventId}`);
    return response.data;
};

export const createEvent = async (data: CreateEventDto): Promise<Event> => {
    const config = await getAuthHeaders();
    const response = await axios.post(`${API_URL}/events`, data, config);
    return response.data;
};

export const updateEvent = async (eventId: string, data: Partial<CreateEventDto>): Promise<Event> => {
    const config = await getAuthHeaders();
    const response = await axios.patch(`${API_URL}/events/${eventId}`, data, config);
    return response.data;
};

export const deleteEvent = async (eventId: string): Promise<void> => {
    const config = await getAuthHeaders();
    await axios.delete(`${API_URL}/events/${eventId}`, config);
};

export const getEventLineup = async (eventId: string): Promise<LineupEntry[]> => {
    const response = await axios.get(`${API_URL}/events/${eventId}/lineup`);
    return response.data;
};

export const endEvent = async (eventId: string): Promise<void> => {
    const config = await getAuthHeaders();
    await axios.post(`${API_URL}/chats/${eventId}/cleanup`, {}, config);
};
