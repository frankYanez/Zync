import axios from 'axios';
import { getAuthHeaders } from '../../auth/services/auth.service';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    category: string;
    imageUrl?: string;
    isAvailable: boolean;
    venueId: string;
}

export interface CreateProductDto {
    name: string;
    description?: string;
    price: number;
    category: string;
    imageUrl?: string;
}

// GET /venues/:venueId/products?category=Tragos
export const getProductsByVenue = async (venueId: string, category?: string): Promise<Product[]> => {
    const response = await axios.get(`${API_URL}/venues/${venueId}/products`, {
        params: category ? { category } : undefined,
    });
    return response.data;
};

export const createProduct = async (venueId: string, data: CreateProductDto): Promise<Product> => {
    const config = await getAuthHeaders();
    const response = await axios.post(`${API_URL}/venues/${venueId}/products`, data, config);
    return response.data;
};

export const updateProduct = async (venueId: string, productId: string, data: Partial<CreateProductDto>): Promise<Product> => {
    const config = await getAuthHeaders();
    const response = await axios.patch(`${API_URL}/venues/${venueId}/products/${productId}`, data, config);
    return response.data;
};

export const deleteProduct = async (venueId: string, productId: string): Promise<void> => {
    const config = await getAuthHeaders();
    await axios.delete(`${API_URL}/venues/${venueId}/products/${productId}`, config);
};
