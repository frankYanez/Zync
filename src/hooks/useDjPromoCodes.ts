import { useCallback, useEffect, useState } from 'react';
import { PromoCode } from '@/features/dj/domain/dj.types';
import { generatePromoCode, getDjPromoCodes } from '@/features/dj/services/dj.service';

/**
 * Hook para gestionar los códigos de descuento (promo codes) de un DJ.
 * Incluye carga del listado y creación de nuevos códigos.
 *
 * @param djProfileId    - ID del perfil DJ. Si es undefined, no se realizan peticiones.
 * @returns promoCodes   - Lista de códigos de descuento del DJ
 * @returns isLoading    - true mientras se carga la lista
 * @returns isGenerating - true mientras se genera un nuevo código
 * @returns error        - Mensaje de error si alguna petición falla
 * @returns refetch      - Función para recargar manualmente la lista
 * @returns createPromoCode - Función para generar un nuevo código para un evento
 */
export function useDjPromoCodes(djProfileId: string | undefined) {
    const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPromoCodes = useCallback(async () => {
        if (!djProfileId) return;
        setIsLoading(true);
        setError(null);
        try {
            const data = await getDjPromoCodes(djProfileId);
            setPromoCodes(data);
        } catch (err) {
            console.error('Error al cargar códigos de descuento:', err);
            setError('No se pudieron cargar los códigos de descuento.');
        } finally {
            setIsLoading(false);
        }
    }, [djProfileId]);

    /**
     * Genera un nuevo código de descuento para el evento indicado.
     * Recarga la lista automáticamente al completarse la creación.
     *
     * @param eventId - ID del evento para el cual se genera el código
     * @throws Error si la creación falla, para que el componente pueda manejarlo
     */
    const createPromoCode = useCallback(async (eventId: string): Promise<void> => {
        if (!djProfileId) return;
        setIsGenerating(true);
        try {
            await generatePromoCode(djProfileId, eventId);
            // Recargar la lista para mostrar el nuevo código
            await fetchPromoCodes();
        } catch (err) {
            console.error('Error al generar código de descuento:', err);
            throw err;
        } finally {
            setIsGenerating(false);
        }
    }, [djProfileId, fetchPromoCodes]);

    useEffect(() => {
        fetchPromoCodes();
    }, [fetchPromoCodes]);

    return { promoCodes, isLoading, isGenerating, error, refetch: fetchPromoCodes, createPromoCode };
}
