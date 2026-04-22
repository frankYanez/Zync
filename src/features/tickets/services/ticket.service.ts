import axios from 'axios';
import { getAuthHeaders } from '@/features/auth/services/auth.service';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export type TicketStatus = 'VALID' | 'USED' | 'CANCELLED' | 'EXPIRED';

export interface TicketType {
    id: string;
    eventId: string;
    name: string;
    description?: string;
    price: string;
    capacity?: number;
    soldCount: number;
    saleStartAt?: string;
    saleEndAt?: string;
    isActive: boolean;
    createdAt: string;
}

export interface Ticket {
    id: string;
    qrToken: string;
    status: TicketStatus;
    pricePaid: string;
    ticketType: TicketType;
    event: {
        id: string;
        name: string;
        startsAt: string;
        endsAt: string;
        imageUrl?: string;
        venue?: { id: string; name: string; address: string };
    };
    createdAt: string;
    usedAt?: string;
}

export interface CreateTicketTypeDto {
    name: string;
    description?: string;
    price: number;
    capacity?: number;
    saleStartAt?: string;
    saleEndAt?: string;
}

// GET /events/:eventId/ticket-types
export const getTicketTypes = async (eventId: string): Promise<TicketType[]> => {
    const response = await axios.get(`${API_URL}/events/${eventId}/ticket-types`);
    return response.data;
};

// POST /events/:eventId/ticket-types  (ORGANIZER)
export const createTicketType = async (eventId: string, data: CreateTicketTypeDto): Promise<TicketType> => {
    const config = await getAuthHeaders();
    const response = await axios.post(`${API_URL}/events/${eventId}/ticket-types`, data, config);
    return response.data;
};

// PATCH /events/:eventId/ticket-types/:ticketTypeId  (ORGANIZER)
export const updateTicketType = async (eventId: string, ticketTypeId: string, data: Partial<CreateTicketTypeDto>): Promise<TicketType> => {
    const config = await getAuthHeaders();
    const response = await axios.patch(`${API_URL}/events/${eventId}/ticket-types/${ticketTypeId}`, data, config);
    return response.data;
};

// DELETE /events/:eventId/ticket-types/:ticketTypeId  (ORGANIZER)
export const deleteTicketType = async (eventId: string, ticketTypeId: string): Promise<void> => {
    const config = await getAuthHeaders();
    await axios.delete(`${API_URL}/events/${eventId}/ticket-types/${ticketTypeId}`, config);
};

// POST /tickets/purchase
export const purchaseTicket = async (ticketTypeId: string): Promise<Ticket> => {
    const config = await getAuthHeaders();
    const response = await axios.post(`${API_URL}/tickets/purchase`, { ticketTypeId }, config);
    return response.data;
};

// GET /tickets/me
export const getMyTickets = async (): Promise<Ticket[]> => {
    const config = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/tickets/me`, config);
    return response.data;
};

// GET /tickets/:ticketId
export const getTicketById = async (ticketId: string): Promise<Ticket> => {
    const config = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/tickets/${ticketId}`, config);
    return response.data;
};

// PATCH /tickets/:ticketId/cancel
export const cancelTicket = async (ticketId: string): Promise<Ticket> => {
    const config = await getAuthHeaders();
    const response = await axios.patch(`${API_URL}/tickets/${ticketId}/cancel`, {}, config);
    return response.data;
};

// POST /tickets/validate  (ORGANIZER or STAFF)
export const validateTicket = async (qrToken: string): Promise<Ticket> => {
    const config = await getAuthHeaders();
    const response = await axios.post(`${API_URL}/tickets/validate`, { qrToken }, config);
    return response.data;
};
