import axios from 'axios';
import { getAuthHeaders } from '../../auth/services/auth.service';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface OrderItemDto {
    productId: string;
    quantity: number;
    unitPrice: number;
}

export interface CreateOrderDto {
    establishmentId: string;
    items: OrderItemDto[];
    promoCode?: string;
    usePoints?: boolean;
}

export interface OrderItem {
    id: string;
    productId: string;
    name: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
}

export interface Order {
    id: string;
    status: 'pending' | 'confirmed' | 'ready' | 'delivered' | 'cancelled';
    items: OrderItem[];
    subtotal: number;
    discount: number;
    total: number;
    createdAt: string;
    establishmentId?: string;
    establishmentName?: string;
}

export const createOrder = async (data: CreateOrderDto): Promise<Order> => {
    const config = await getAuthHeaders();
    const response = await axios.post(`${API_URL}/orders`, data, config);
    return response.data;
};

export const getMyOrders = async (): Promise<Order[]> => {
    const config = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/orders/my-orders`, config);
    return response.data;
};

export const getOrderById = async (orderId: string): Promise<Order> => {
    const config = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/orders/${orderId}`, config);
    return response.data;
};
