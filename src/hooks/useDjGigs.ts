import { useCallback, useEffect, useState } from 'react';
import { Gig } from '@/features/dj/domain/dj.types';
import { getDjGigs } from '@/features/dj/services/dj.service';

/**
 * Hook para obtener la lista de gigs (presentaciones) de un DJ.
 * Se ejecuta automáticamente cuando se provee un djProfileId válido.
 *
 * @param djProfileId - ID del perfil DJ a consultar. Si es undefined, no realiza peticiones.
 * @returns gigs       - Lista de gigs del DJ
 * @returns isLoading  - true mientras se cargan los gigs
 * @returns error      - Mensaje de error si la petición falla
 * @returns refetch    - Función para recargar manualmente los gigs
 */
export function useDjGigs(djProfileId: string | undefined) {
    const [gigs, setGigs] = useState<Gig[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchGigs = useCallback(async () => {
        if (!djProfileId) return;
        setIsLoading(true);
        setError(null);
        try {
            const data = await getDjGigs(djProfileId);
            setGigs(data);
        } catch (err) {
            console.error('Error al cargar gigs del DJ:', err);
            setError('No se pudieron cargar los gigs.');
        } finally {
            setIsLoading(false);
        }
    }, [djProfileId]);

    useEffect(() => {
        fetchGigs();
    }, [fetchGigs]);

    return { gigs, isLoading, error, refetch: fetchGigs };
}
