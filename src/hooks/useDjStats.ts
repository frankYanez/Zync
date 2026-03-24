import { useCallback, useEffect, useState } from 'react';
import { DjStats } from '@/features/dj/domain/dj.types';
import { getDjStats } from '@/features/dj/services/dj.service';

export function useDjStats(djProfileId: string | undefined) {
    const [stats, setStats] = useState<DjStats | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchStats = useCallback(async () => {
        if (!djProfileId) return;
        setIsLoading(true);
        try {
            const data = await getDjStats(djProfileId);
            setStats(data);
        } finally {
            setIsLoading(false);
        }
    }, [djProfileId]);

    useEffect(() => { fetchStats(); }, [fetchStats]);

    return { stats, isLoading, refetch: fetchStats };
}
