import axios from 'axios';
import { getAuthHeaders } from '@/features/auth/services/auth.service';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export type TicketStatus = 'valid' | 'used' | 'expired';

export interface Ticket {
    id: string;
    qrCode: string;
    eventId: string;
    eventName: string;
    eventDate: string;
    venueName: string;
    coverImageUrl?: string;
    holderName: string;
    purchasedAt: string;
    status: TicketStatus;
    price: number;
}

export interface PurchaseTicketResult {
    ticket: Ticket;
    newBalance: number;
}

const MOCK_TICKETS: Ticket[] = [
    {
        id: 'ticket-1',
        qrCode: 'ZYNC-TKT-A1B2C3D4E5F6',
        eventId: 'event-1',
        eventName: 'Noche Electrónica — Club Vértigo',
        eventDate: new Date(Date.now() + 2 * 24 * 3600000).toISOString(),
        venueName: 'Club Vértigo',
        coverImageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
        holderName: 'Frank',
        purchasedAt: new Date(Date.now() - 3600000).toISOString(),
        status: 'valid',
        price: 5000,
    },
    {
        id: 'ticket-2',
        qrCode: 'ZYNC-TKT-X9Y8Z7W6V5U4',
        eventId: 'event-2',
        eventName: 'Tech House Saturdays',
        eventDate: new Date(Date.now() - 7 * 24 * 3600000).toISOString(),
        venueName: 'Social Club',
        holderName: 'Frank',
        purchasedAt: new Date(Date.now() - 8 * 24 * 3600000).toISOString(),
        status: 'used',
        price: 3500,
    },
];

// POST /events/:eventId/tickets/purchase
// TODO: replace mock → await axios.post(`${API_URL}/events/${eventId}/tickets/purchase`, {}, await getAuthHeaders())
export const purchaseTicket = async (eventId: string, eventName: string, price: number, holderName: string): Promise<PurchaseTicketResult> => {
    const newTicket: Ticket = {
        id: `ticket-${Date.now()}`,
        qrCode: `ZYNC-TKT-${Math.random().toString(36).substring(2, 14).toUpperCase()}`,
        eventId,
        eventName,
        eventDate: new Date(Date.now() + 7 * 24 * 3600000).toISOString(),
        venueName: 'Venue',
        holderName,
        purchasedAt: new Date().toISOString(),
        status: 'valid',
        price,
    };
    MOCK_TICKETS.unshift(newTicket);
    return { ticket: newTicket, newBalance: 0 };
};

// GET /users/me/tickets
// TODO: replace mock → await axios.get(`${API_URL}/users/me/tickets`, await getAuthHeaders())
export const getMyTickets = async (): Promise<Ticket[]> => {
    return [...MOCK_TICKETS];
};

// GET /users/me/tickets/:ticketId
// TODO: replace mock → await axios.get(`${API_URL}/users/me/tickets/${ticketId}`, await getAuthHeaders())
export const getTicketById = async (ticketId: string): Promise<Ticket | null> => {
    return MOCK_TICKETS.find(t => t.id === ticketId) ?? null;
};

// POST /tickets/validate  (Business role)
// TODO: replace mock → await axios.post(`${API_URL}/tickets/validate`, { qrCode, eventId }, await getAuthHeaders())
export const validateTicket = async (qrCode: string, eventId: string): Promise<{
    valid: boolean;
    reason?: string;
    user?: { name: string; avatarUrl?: string };
}> => {
    const ticket = MOCK_TICKETS.find(t => t.qrCode === qrCode && t.eventId === eventId);
    if (!ticket) return { valid: false, reason: 'Ticket no encontrado' };
    if (ticket.status === 'used') return { valid: false, reason: 'Este ticket ya fue utilizado' };
    if (ticket.status === 'expired') return { valid: false, reason: 'Ticket expirado' };
    ticket.status = 'used';
    return { valid: true, user: { name: ticket.holderName } };
};
