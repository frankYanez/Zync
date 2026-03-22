import axios from 'axios';
import { getAuthHeaders } from '../../auth/services/auth.service';
import { SpotifyTrack } from './spotify-service';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface SongRequest {
    id: string;
    trackName: string;
    artistName: string;
    albumCover?: string;
    spotifyUri?: string;
    status: 'pending' | 'accepted' | 'rejected' | 'played';
    createdAt: string;
}

export const submitSongRequest = async (
    djProfileId: string,
    track: SpotifyTrack,
): Promise<SongRequest> => {
    const config = await getAuthHeaders();
    const response = await axios.post(
        `${API_URL}/dj/${djProfileId}/song-requests`,
        {
            trackName: track.name,
            artistName: track.artists.map(a => a.name).join(', '),
            albumCover: track.album.images[0]?.url,
            spotifyUri: track.uri,
        },
        config,
    );
    return response.data;
};

export const getMySongRequests = async (djProfileId: string): Promise<SongRequest[]> => {
    const config = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/dj/${djProfileId}/song-requests`, config);
    return response.data;
};
