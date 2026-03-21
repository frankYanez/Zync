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
}

export interface Gig {
    eventId: string;
    eventName: string;
    startsAt: string;
    endsAt: string;
}

export interface PromoCode {
    id: string;
    code: string;
    djProfileId: string;
    eventId: string;
    eventName: string;
    usedCount: number;
    createdAt: string;
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
