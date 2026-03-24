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

export interface SetDjLiveModeDto {
    isLive: boolean;
}

export interface DjFeedEvent {
    id: string;
    name: string;
    startDate?: string;
    endDate?: string;
    startsAt?: string;
    endsAt?: string;
    imageUrl?: string;
    venue?: { id: string; name: string; address?: string };
    dj?: { id: string; artistName: string; logoUrl?: string };
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

export type PromoCodeType = 'DRINK' | 'ENTRY' | 'MERCH' | 'OTHER';
export type PromoCodeDiscountType = 'PERCENTAGE' | 'FIXED' | 'FREE';

export interface PromoCode {
    id: string;
    code: string;
    djProfileId: string;
    eventId: string;
    eventName?: string;
    type: PromoCodeType;
    discountType: PromoCodeDiscountType;
    discountValue: number | null;
    description?: string;
    maxUses?: number;
    expiresAt?: string;
    usedCount: number;
    createdAt: string;
}

export interface CreatePromoCodeDto {
    type: PromoCodeType;
    discountType: PromoCodeDiscountType;
    discountValue: number | null;
    description?: string;
    maxUses?: number;
    expiresAt?: string;
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
