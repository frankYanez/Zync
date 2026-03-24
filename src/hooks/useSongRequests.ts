import { useCallback, useEffect, useState } from 'react';
import { SongRequest } from '@/features/music/services/song-request.service';
import { getDjSongRequests, updateSongRequestStatus } from '@/features/music/services/song-request.service';

export function useSongRequests(djProfileId: string | undefined) {
    const [requests, setRequests] = useState<SongRequest[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const fetchRequests = useCallback(async () => {
        if (!djProfileId) return;
        setIsLoading(true);
        try {
            const data = await getDjSongRequests(djProfileId);
            setRequests(data);
        } finally {
            setIsLoading(false);
        }
    }, [djProfileId]);

    useEffect(() => { fetchRequests(); }, [fetchRequests]);

    const updateStatus = useCallback(async (requestId: string, status: SongRequest['status']) => {
        if (!djProfileId) return;
        setIsUpdating(true);
        try {
            await updateSongRequestStatus(djProfileId, requestId, status);
            // Optimistic update — cuando el back esté listo esto sigue funcionando igual
            setRequests(prev =>
                prev.map(r => r.id === requestId ? { ...r, status } : r)
            );
        } finally {
            setIsUpdating(false);
        }
    }, [djProfileId]);

    const pending  = requests.filter(r => r.status === 'pending');
    const accepted = requests.filter(r => r.status === 'accepted');
    const history  = requests.filter(r => r.status === 'played' || r.status === 'rejected');

    return { requests, pending, accepted, history, isLoading, isUpdating, updateStatus, refetch: fetchRequests };
}
