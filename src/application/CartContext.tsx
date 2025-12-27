import { Product } from '@/infrastructure/mock-data';
import React, { createContext, useContext, useMemo, useState } from 'react';

export interface CartItem extends Product {
    quantity: number;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    removeItemQuantity: (productId: string) => void;
    clearCart: () => void;
    totalAmount: number;
    totalItems: number;
    checkout: () => Promise<{ success: boolean; orderId?: string; error?: string }>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

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

    const checkout = async (): Promise<{ success: boolean; orderId?: string; error?: string }> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Mock 90% success rate
                const isSuccess = Math.random() > 0.1;
                if (isSuccess) {
                    resolve({ success: true, orderId: Math.floor(1000 + Math.random() * 9000).toString() });
                } else {
                    resolve({ success: false, error: 'Payment declined by bank' });
                }
            }, 2000);
        });
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
            checkout
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
