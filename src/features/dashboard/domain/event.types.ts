export interface Venue {
    id: string;
    name: string;
    address: string;
    description?: string;
}

export interface LineupEntry {
    id: string;
    djProfileId: string;
    artistName: string;
    logoUrl?: string;
    startTime?: string;
    endTime?: string;
}

export interface Event {
    id: string;
    name: string;
    startsAt: string;
    endsAt: string;
    isActive: boolean;
    imageUrl?: string;
    capacity?: number;
    ticketPrice?: number;
    description?: string;
    organizerId?: string;
    venueId?: string;
    venue?: Venue;
    lineup?: LineupEntry[];
}

export interface CreateEventDto {
    name: string;
    description?: string;
    startsAt: string;
    endsAt: string;
    venueId: string;
    djs?: string[];
    isPrivate?: boolean;
    capacity?: number;
    imageUrl?: string;
    ticketPrice?: number;
}

export interface CheckLocationDto {
    eventId: string;
    latitude: number;
    longitude: number;
    action: 'ENTER' | 'LEAVE';
}

export interface VenueStats {
    todayOrders: number;
    todayRevenue: number;
    activeCustomers: number;
    pendingOrdersCount: number;
}

export interface EventStats {
    ticketsSold: number;
    ticketRevenue: number;
    checkIns: number;
    capacity: number;
    activeDjs: number;
}
