import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { DjProfile } from '@/features/dj/domain/dj.types';
import { getMyDjProfile } from '@/features/dj/services/dj.service';

/**
 * Hook para gestionar el perfil del DJ autenticado.
 * Carga el perfil automáticamente cuando el usuario está disponible.
 *
 * @returns profile      - Datos del perfil DJ o null si no existe
 * @returns isLoading    - true mientras se obtiene el perfil del servidor
 * @returns error        - Mensaje de error si la petición falla
 * @returns refetch      - Función para recargar manualmente el perfil
 */
export function useDjProfile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<DjProfile | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Carga el perfil DJ usando el userId del token de autenticación
    const fetchProfile = useCallback(async () => {
        if (!user?.sub) return;
        setIsLoading(true);
        setError(null);
        try {
            const data = await getMyDjProfile(user.sub);
            setProfile(data);
        } catch (err) {
            console.error('Error al cargar perfil DJ:', err);
            setError('No se pudo cargar el perfil DJ.');
        } finally {
            setIsLoading(false);
        }
    }, [user?.sub]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    return { profile, isLoading, error, refetch: fetchProfile };
}
