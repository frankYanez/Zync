import axios from 'axios';
import { getAuthHeaders } from '../../auth/services/auth.service';
import { CheckLocationDto, CreateEventDto, Event, EventStats, LineupEntry, VenueStats } from '../domain/event.types';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export const getEvents = async (skip: number = 0, take: number = 10): Promise<Event[]> => {
    const response = await axios.get(`${API_URL}/events`, { params: { skip, take } });
    return response.data;
};

export const getMyEvents = async (): Promise<Event[]> => {
    const config = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/events/my-events`, {
        ...config,
        params: { skip: 0, take: 100 },
    });
    return response.data;
};

export const getEventById = async (eventId: string): Promise<Event> => {
    const response = await axios.get(`${API_URL}/events/${eventId}`);
    return response.data;
};

export const createEvent = async (data: CreateEventDto): Promise<Event> => {
    console.log("data", data);
    const config = await getAuthHeaders();
    const response = await axios.post(`${API_URL}/events`, data, config);
    console.log("response", response.data);
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

export const enterEvent = async (eventId: string): Promise<void> => {
    const config = await getAuthHeaders();
    await axios.post(`${API_URL}/events/${eventId}/enter`, {}, config);
};

export const leaveEvent = async (eventId: string): Promise<void> => {
    const config = await getAuthHeaders();
    await axios.post(`${API_URL}/events/${eventId}/leave`, {}, config);
};

export const checkLocation = async (data: CheckLocationDto): Promise<void> => {
    const config = await getAuthHeaders();
    await axios.post(`${API_URL}/events/check-location`, data, config);
};

export const endEvent = async (eventId: string): Promise<void> => {
    const config = await getAuthHeaders();
    await axios.post(`${API_URL}/chats/${eventId}/cleanup`, {}, config);
};

// POST /events/:eventId/cover  (multipart)
// TODO: replace mock → const form = new FormData(); form.append('file', {...}); axios.post(...)
export const uploadEventCover = async (_eventId: string, _imageUri: string): Promise<{ coverImageUrl: string }> => {
    return { coverImageUrl: _imageUri };
};

// GET /venues/:venueId/active-event
export const getVenueActiveEvent = async (venueId: string): Promise<import('../domain/event.types').Event | null> => {
    const response = await axios.get(`${API_URL}/venues/${venueId}/active-event`);
    return response.data ?? null;
};

// GET /venues/:venueId/stats
// TODO: replace mock → axios.get(`${API_URL}/venues/${venueId}/stats`, await getAuthHeaders())
export const getVenueStats = async (_venueId: string): Promise<VenueStats> => {
    return { todayOrders: 0, todayRevenue: 0, activeCustomers: 0, pendingOrdersCount: 0 };
};

// GET /events/:eventId/stats
// TODO: replace mock → axios.get(`${API_URL}/events/${eventId}/stats`, await getAuthHeaders())
export const getEventStats = async (_eventId: string): Promise<EventStats> => {
    return { ticketsSold: 0, ticketRevenue: 0, checkIns: 0, capacity: 0, activeDjs: 0 };
};
