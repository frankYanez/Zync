import {
    CreateProductDto,
    Product,
    createProduct,
    deleteProduct,
    getProductsByVenue,
    updateProduct,
} from '@/features/venues/services/product.service';
import { useCallback, useEffect, useState } from 'react';

export function useVenueProducts(venueId: string | undefined) {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const refresh = useCallback(async () => {
        if (!venueId) return;
        setIsLoading(true);
        try {
            const data = await getProductsByVenue(venueId);
            setProducts(data);
        } catch (e) {
            console.error('useVenueProducts: failed to load products', e);
        } finally {
            setIsLoading(false);
        }
    }, [venueId]);

    useEffect(() => { refresh(); }, [refresh]);

    const add = useCallback(async (data: CreateProductDto): Promise<Product> => {
        if (!venueId) throw new Error('venueId is required');
        const created = await createProduct(venueId, data);
        setProducts(prev => [...prev, created]);
        return created;
    }, [venueId]);

    const update = useCallback(async (productId: string, data: Partial<CreateProductDto>): Promise<Product> => {
        if (!venueId) throw new Error('venueId is required');
        const updated = await updateProduct(venueId, productId, data);
        setProducts(prev => prev.map(p => p.id === productId ? updated : p));
        return updated;
    }, [venueId]);

    const remove = useCallback(async (productId: string): Promise<void> => {
        if (!venueId) throw new Error('venueId is required');
        await deleteProduct(venueId, productId);
        setProducts(prev => prev.filter(p => p.id !== productId));
    }, [venueId]);

    return { products, isLoading, refresh, add, update, remove };
}
