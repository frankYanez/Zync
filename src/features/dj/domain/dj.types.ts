export interface DjProfile {
    id: string;
    userId: string;
    artistName: string;
    genres: string[];
    pricePerSong: string;
    soundcloudUrl: string | null;
    spotifyUrl: string | null;
    instagramUrl: string | null;
    bio: string | null;
    city: string | null;
    logoUrl: string | null;
    bannerUrl: string | null;
    isFollowing?: boolean;
}

export type GigStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Gig {
    id: string;
    eventId: string;
    eventName: string;
    venueName: string;
    startsAt: string;
    endsAt: string;
    fee?: number;
    status: GigStatus;
}

export interface CreateGigDto {
    venueName: string;
    eventId?: string;
    startsAt: string;
    endsAt: string;
    fee?: number;
}

export interface DjStats {
    totalRequests: number;
    pendingRequests: number;
    acceptedRequests: number;
    rejectedRequests: number;
    playedRequests: number;
    // Not returned by the API yet — kept optional for screen compatibility
    totalEarnings?: number;
    activeEvents?: { id: string; name: string }[];
}

export interface PromoCode {
    id: string;
    code: string;
    djProfileId: string;
    eventId: string;
    eventName?: string;
    discountPercentage?: number;
    maxUses?: number;
    expiresAt?: string;
    usedCount: number;
    createdAt: string;
}

export interface CreatePromoCodeDto {
    code: string;
    discountPercentage: number;
    maxUses: number;
    expiresAt: string;
}

export interface PromoCodeRedeemResponse {
    code: string;
    usedCount: number;
}

export interface DjReview {
    id: string;
    eventId: string;
    userId: string;
    score: number;
    comment: string | null;
    createdAt: string;
}

export interface DjReviewsResponse {
    stats: {
        averageScore: number;
        totalReviews: number;
    };
    reviews: DjReview[];
}
