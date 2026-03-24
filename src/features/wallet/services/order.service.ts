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

// GET /venues/:venueId/orders?status=PENDING  🔒 venue owner
export const getVenueOrders = async (venueId: string, status?: Order['status']): Promise<Order[]> => {
    const config = await getAuthHeaders();
    const response = await axios.get(`${API_URL}/venues/${venueId}/orders`, {
        ...config,
        params: status ? { status: status.toUpperCase() } : undefined,
    });
    // Normalize status to lowercase to match the frontend type
    return (response.data as any[]).map(o => ({ ...o, status: o.status?.toLowerCase() }));
};

// PATCH /orders/:orderId/status  { status }  — full flow: PENDING → CONFIRMED → READY → DELIVERED
export const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<{ id: string; status: Order['status'] }> => {
    const config = await getAuthHeaders();
    await axios.patch(`${API_URL}/orders/${orderId}/status`, { status: status.toUpperCase() }, config);
    return { id: orderId, status };
};
