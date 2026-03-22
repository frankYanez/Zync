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
    organizerId?: string;
    venueId?: string;
    venue?: Venue;
    lineup?: LineupEntry[];
}

export interface CreateEventDto {
    name: string;
    startsAt: string;
    endsAt: string;
    venueId: string;
    capacity?: number;
    imageUrl?: string;
}
