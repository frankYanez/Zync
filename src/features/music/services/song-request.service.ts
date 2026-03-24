import axios from 'axios';
import { getAuthHeaders } from '../../auth/services/auth.service';
import { SpotifyTrack } from './spotify-service';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface SongRequest {
    id: string;
    trackName: string;
    artistName: string;
    albumCover?: string;
    albumArt?: string;
    spotifyUri?: string;
    status: 'pending' | 'accepted' | 'rejected' | 'played';
    createdAt: string;
}

export const submitSongRequest = async (
    djProfileId: string,
    track: SpotifyTrack,
    eventId: string,
    pricePaid: number,
): Promise<SongRequest> => {
    const config = await getAuthHeaders();
    const response = await axios.post(
        `${API_URL}/dj/${djProfileId}/song-requests`,
        {
            djProfileId,
            eventId,
            trackId: track.uri,
            trackName: track.name,
            artistName: track.artists.map(a => a.name).join(', '),
            albumArt: track.album.images[0]?.url,
            pricePaid,
        },
        config,
    );
    return response.data;
};

// GET /dj/:djProfileId/song-requests?status=...
export const getMySongRequests = async (djProfileId: string): Promise<SongRequest[]> => {
    const config = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/dj/${djProfileId}/song-requests`, config);
    return response.data;
};

// GET /dj/:djProfileId/song-requests?status=PENDING|ACCEPTED|REJECTED|PLAYED
export const getDjSongRequests = async (djProfileId: string, status?: SongRequest['status']): Promise<SongRequest[]> => {
    const config = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/dj/${djProfileId}/song-requests`, {
        ...config,
        params: status ? { status: status.toUpperCase() } : undefined,
    });
    // Normalize: lowercase status, map albumArt → albumCover for screen compatibility
    return (response.data as any[]).map(r => ({
        ...r,
        status: r.status?.toLowerCase(),
        albumCover: r.albumCover ?? r.albumArt,
    }));
};

// PATCH /dj/:djProfileId/song-requests/:requestId  { status: "ACCEPTED" | "REJECTED" | "PLAYED" }
export const updateSongRequestStatus = async (
    djProfileId: string,
    requestId: string,
    status: SongRequest['status'],
): Promise<{ id: string; status: SongRequest['status'] }> => {
    const config = await getAuthHeaders();
    await axios.patch(
        `${API_URL}/dj/${djProfileId}/song-requests/${requestId}`,
        { status: status.toUpperCase() },
        config,
    );
    return { id: requestId, status };
};
