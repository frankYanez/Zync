import { createOrder } from '@/features/wallet/services/order.service';
import { Product } from '@/infrastructure/mock-data';
import React, { createContext, useContext, useMemo, useState } from 'react';

export interface CartItem extends Product {
    quantity: number;
}

export interface ActiveOrder {
    id: string;
    items: CartItem[];
    total: number;
    savings: number;
    status: 'pending' | 'ready';
    establishmentName?: string;
    establishmentLogo?: string;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    removeItemQuantity: (productId: string) => void;
    clearCart: () => void;
    totalAmount: number;
    totalItems: number;
    checkout: (params?: { establishmentId?: string; promoCode?: string; usePoints?: boolean }) => Promise<{ success: boolean; orderId?: string; error?: string }>;
    activeOrders: ActiveOrder[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>([]);

    const addToCart = (product: Product) => {
        setItems(currentItems => {
            const existingItem = currentItems.find(item => item.id === product.id);
            if (existingItem) {
                return currentItems.map(item =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...currentItems, { ...product, quantity: 1 }];
        });
    };

    const removeItemQuantity = (productId: string) => {
        setItems(currentItems => {
            const existingItem = currentItems.find(item => item.id === productId);
            if (existingItem && existingItem.quantity > 1) {
                return currentItems.map(item =>
                    item.id === productId
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                );
            }
            return currentItems.filter(item => item.id !== productId);
        });
    };

    const removeFromCart = (productId: string) => {
        setItems(currentItems => currentItems.filter(item => item.id !== productId));
    };

    const clearCart = () => {
        setItems([]);
    };

    const totalAmount = useMemo(() => {
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }, [items]);

    const totalItems = useMemo(() => {
        return items.reduce((toal, item) => toal + item.quantity, 0);
    }, [items]);

    const checkout = async (params?: { establishmentId?: string; promoCode?: string; usePoints?: boolean }): Promise<{ success: boolean; orderId?: string; error?: string }> => {
        try {
            const orderItems = items.map(item => ({
                productId: item.id,
                quantity: item.quantity,
                unitPrice: item.price,
            }));

            const order = await createOrder({
                establishmentId: params?.establishmentId ?? '',
                items: orderItems,
                promoCode: params?.promoCode,
                usePoints: params?.usePoints,
            });

            setActiveOrders(prev => [{
                id: order.id,
                items: [...items],
                total: order.total,
                savings: order.discount,
                status: 'pending',
                establishmentName: order.establishmentName,
            }, ...prev]);

            return { success: true, orderId: order.id };
        } catch (error: any) {
            const msg = error?.response?.data?.message;
            return { success: false, error: Array.isArray(msg) ? msg.join('\n') : msg || 'Payment failed' };
        }
    };

    return (
        <CartContext.Provider value={{
            items,
            addToCart,
            removeFromCart,
            removeItemQuantity,
            clearCart,
            totalAmount,
            totalItems,
            checkout,
            activeOrders
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
