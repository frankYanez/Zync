import { Buffer } from 'buffer';

const CLIENT_ID = 'e11abe3738f34ac28dcd2ade25d1cfb4';
const CLIENT_SECRET = 'ec39c89a04364c028630d0811f41c982';

interface SpotifyToken {
    access_token: string;
    token_type: string;
    expires_in: number;
}

export interface SpotifyTrack {
    id: string;
    name: string;
    artists: { name: string }[];
    album: {
        images: { url: string; height: number; width: number }[];
        name: string;
    };
    uri: string;
}

class SpotifyService {
    private token: string | null = null;
    private tokenExpiration: number = 0;

    private async getAccessToken(): Promise<string> {
        if (this.token && Date.now() < this.tokenExpiration) {
            return this.token;
        }

        try {
            const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
            const response = await fetch('https://accounts.spotify.com/api/token', {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'grant_type=client_credentials',
            });

            const data: SpotifyToken = await response.json();
            this.token = data.access_token;
            // Set expiration a bit earlier than actual to be safe
            this.tokenExpiration = Date.now() + (data.expires_in * 1000) - 60000;
            return this.token;
        } catch (error) {
            console.error('Error fetching Spotify token:', error);
            throw error;
        }
    }

    async searchTracks(query: string): Promise<SpotifyTrack[]> {
        if (!query || query.length < 2) return [];

        try {
            const token = await this.getAccessToken();
            const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            return data.tracks?.items || [];
        } catch (error) {
            console.error('Error searching tracks:', error);
            return [];
        }
    }
}

export const spotifyService = new SpotifyService();
