
import { useAuth } from '@/features/auth/context/AuthContext';
import { TicketCard } from '@/features/dashboard/components/TicketCard';
import { useCart } from '@/features/wallet/context/CartContext';

import { ScreenLayout } from '@/components/ScreenLayout';
import { ThemedText } from '@/components/themed-text';

import { NeonButton } from '@/components/NeonButton';
import { ZyncLoader } from '@/components/ZyncLoader';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { MotiScrollView, MotiView } from 'moti';
import React, { useState } from 'react';
import { Image, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';

type PaymentStatus = 'idle' | 'processing' | 'success' | 'failed';

export default function CartScreen() {
    const router = useRouter();
    const { items, totalAmount, removeItemQuantity, addToCart, removeFromCart, clearCart, checkout } = useCart();
    const { user, updateBalance } = useAuth();
    const [usePoints, setUsePoints] = useState(false);
    const [status, setStatus] = useState<PaymentStatus>('idle');
    const [orderId, setOrderId] = useState<string>('');

    const userPoints = user?.zyncPoints || 0;

    // Logic: 1 Point = $1. Max discount is totalAmount.
    const discount = usePoints ? Math.min(totalAmount, userPoints) : 0;
    const finalTotal = totalAmount - discount;

    const handlePay = async () => {
        if (items.length === 0) return;

        setStatus('processing');

        try {
            const result = await checkout();

            if (result.success && result.orderId) {
                // Deduct points locally if used
                if (usePoints && user) {
                    // This is a minimal mock update since we don't have a real backend sync here
                    const newPoints = Math.max(0, userPoints - Math.round(discount));
                    // In a real app we'd await an updateBalance call
                }
                setOrderId(result.orderId);
                setStatus('success');
            } else {
                setStatus('failed');
            }
        } catch (error) {
            setStatus('failed');
            console.error(error);
        }
    };

    const handleFinish = () => {
        clearCart();
        router.back();
    };

    if (status === 'processing') {
        return (
            <ScreenLayout noPadding>
                <View style={[styles.centerContainer, { backgroundColor: 'black' }]}>
                    <ZyncLoader visible={true} type="overlay" />
                    <ThemedText style={styles.processingText}>Processing Payment...</ThemedText>
                </View>
            </ScreenLayout>
        );
    }

    if (status === 'success') {
        return (
            <ScreenLayout noPadding>
                <View style={styles.successContainer}>
                    <TouchableOpacity onPress={handleFinish} style={styles.closeButton}>
                        <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>

                    <View style={styles.successHeader}>
                        <View style={styles.successIconOuter}>
                            <View style={styles.successIconInner}>
                                <Ionicons name="checkmark" size={32} color={ZyncTheme.colors.primary} />
                            </View>
                        </View>
                        <ThemedText style={styles.successTitle}>¡Disfruta tu Zync!</ThemedText>
                        <ThemedText style={styles.successSubtitle}>Pago realizado con éxito.</ThemedText>
                    </View>

                    <View style={styles.ticketContainer}>
                        <TicketCard
                            orderId={orderId}
                            items={items}
                            total={finalTotal}
                            savings={discount}
                        />
                    </View>

                    <View style={styles.footer}>
                        <NeonButton
                            title="VER MIS PEDIDOS"
                            onPress={handleFinish}
                            style={{ width: '100%', height: 56 }}
                            textStyle={{ fontSize: 18, fontWeight: 'bold' }}
                            icon={<Ionicons name="arrow-forward" size={24} color="black" />}
                        />
                    </View>
                </View>
            </ScreenLayout>
        );
    }

    if (status === 'failed') {
        return (
            <ScreenLayout noPadding>
                <View style={styles.centerContainer}>
                    <Ionicons name="alert-circle" size={80} color="#ff3333" />
                    <ThemedText style={[styles.successTitle, { marginTop: 20 }]}>Payment Failed</ThemedText>
                    <ThemedText style={styles.successSubtitle}>Something went wrong. Please try again.</ThemedText>
                    <NeonButton
                        title="TRY AGAIN"
                        onPress={() => setStatus('idle')}
                        style={{ marginTop: 40, width: 200 }}
                    />
                    <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
                        <ThemedText style={{ color: '#666' }}>Cancel</ThemedText>
                    </TouchableOpacity>
                </View>
            </ScreenLayout>
        );
    }

    // Default Cart View
    if (items.length === 0) {
        return (
            <ScreenLayout>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <ThemedText style={styles.headerTitle}>Checkout</ThemedText>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.emptyContainer}>
                    <Ionicons name="cart-outline" size={80} color="#333" />
                    <ThemedText style={styles.emptyText}>Your cart is empty</ThemedText>
                    <NeonButton title="BROWSE MENU" onPress={() => router.back()} style={{ marginTop: 20 }} />
                </View>
            </ScreenLayout>
        );
    }

    return (
        <ScreenLayout noPadding>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Order Details</ThemedText>
                <TouchableOpacity onPress={clearCart}>
                    <ThemedText style={{ color: '#666' }}>Clear</ThemedText>
                </TouchableOpacity>
            </View>

            <MotiScrollView contentContainerStyle={styles.scrollContent}>
                {items.map((item, index) => (
                    <MotiView
                        key={item.id}
                        from={{ opacity: 0, translateX: -20 }}
                        animate={{ opacity: 1, translateX: 0 }}
                        transition={{ delay: index * 100 }}
                        style={styles.cartItem}
                    >
                        <View style={styles.itemImageContainer}>
                            {item.image ? (
                                <Image source={{ uri: item.image }} style={styles.itemImage} />
                            ) : (
                                <View style={[styles.itemImage, { backgroundColor: '#222', alignItems: 'center', justifyContent: 'center' }]}>
                                    <Ionicons name="wine" size={24} color="#666" />
                                </View>
                            )}
                        </View>
                        <View style={styles.itemDetails}>
                            <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                            <ThemedText style={styles.itemPrice}>${item.price.toLocaleString()}</ThemedText>
                        </View>

                        <View style={styles.quantityControls}>
                            <TouchableOpacity style={styles.qButton} onPress={() => removeItemQuantity(item.id)}>
                                <Ionicons name="remove" size={16} color="white" />
                            </TouchableOpacity>
                            <ThemedText style={styles.quantity}>{item.quantity}</ThemedText>
                            <TouchableOpacity style={styles.qButton} onPress={() => addToCart(item)}>
                                <Ionicons name="add" size={16} color="white" />
                            </TouchableOpacity>
                        </View>
                    </MotiView>
                ))}

                <View style={styles.summarySection}>
                    <View style={styles.summaryRow}>
                        <ThemedText style={styles.summaryLabel}>Subtotal</ThemedText>
                        <ThemedText style={styles.summaryValue}>${totalAmount.toLocaleString()}</ThemedText>
                    </View>

                    {/* Points Redemption */}
                    <View style={styles.pointsRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                            <View style={styles.iconBox}>
                                <Ionicons name="flash" size={16} color={ZyncTheme.colors.primary} />
                            </View>
                            <View>
                                <ThemedText style={styles.pointsTitle}>Use Zync Points</ThemedText>
                                <ThemedText style={styles.pointsSubtitle}>Available: {userPoints.toLocaleString()} pts</ThemedText>
                            </View>
                        </View>
                        <Switch
                            value={usePoints}
                            onValueChange={setUsePoints}
                            trackColor={{ false: '#333', true: ZyncTheme.colors.primary }}
                            thumbColor={usePoints ? '#000' : '#f4f3f4'}
                        />
                    </View>

                    {usePoints && (
                        <View style={styles.summaryRow}>
                            <ThemedText style={[styles.summaryLabel, { color: ZyncTheme.colors.primary }]}>Discount</ThemedText>
                            <ThemedText style={[styles.summaryValue, { color: ZyncTheme.colors.primary }]}>- ${discount.toLocaleString()}</ThemedText>
                        </View>
                    )}

                    <View style={styles.divider} />

                    <View style={styles.summaryRow}>
                        <ThemedText style={styles.totalLabel}>Total</ThemedText>
                        <View>
                            <ThemedText style={styles.totalValue}>${finalTotal.toLocaleString()}</ThemedText>
                            {usePoints && <ThemedText style={styles.savedText}>You saved ${discount.toLocaleString()}</ThemedText>}
                        </View>
                    </View>
                </View>

            </MotiScrollView>

            <View style={styles.footer}>
                <NeonButton
                    title={`PAY $${finalTotal.toLocaleString()}`}
                    onPress={handlePay}
                    style={{ width: '100%', height: 56 }}
                    textStyle={{ fontSize: 18, fontWeight: 'bold' }}
                    icon={<Ionicons name="card-outline" size={24} color="black" />}
                />
            </View>
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: ZyncTheme.spacing.m,
        paddingBottom: 20,
        backgroundColor: '#000',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#111',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: ZyncTheme.spacing.m,
        paddingBottom: 100,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        marginTop: 20,
        fontSize: 18,
        color: '#666',
    },
    cartItem: {
        flexDirection: 'row',
        backgroundColor: '#111',
        borderRadius: 16,
        padding: 12,
        marginBottom: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#222',
    },
    itemImageContainer: {
        width: 60,
        height: 60,
        borderRadius: 12,
        overflow: 'hidden',
        marginRight: 12,
    },
    itemImage: {
        width: '100%',
        height: '100%',
    },
    itemDetails: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    itemPrice: {
        color: ZyncTheme.colors.primary,
        fontWeight: 'bold',
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#222',
        borderRadius: 20,
        padding: 4,
    },
    qButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#333',
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantity: {
        marginHorizontal: 12,
        fontWeight: 'bold',
    },
    summarySection: {
        marginTop: 20,
        backgroundColor: '#111',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: '#222',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    summaryLabel: {
        color: '#888',
        fontSize: 16,
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    pointsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        padding: 12,
        borderRadius: 16,
        marginVertical: 12,
        borderWidth: 1,
        borderColor: '#333',
    },
    iconBox: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(204, 255, 0, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    pointsTitle: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    pointsSubtitle: {
        fontSize: 12,
        color: '#666',
    },
    divider: {
        height: 1,
        backgroundColor: '#222',
        marginVertical: 16,
    },
    totalLabel: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    totalValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: ZyncTheme.colors.primary,
        textAlign: 'right',
    },
    savedText: {
        fontSize: 12,
        color: ZyncTheme.colors.primary,
        textAlign: 'right',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#000',
        padding: 20,
        paddingBottom: 40,
        borderTopWidth: 1,
        borderTopColor: '#222',
    },
    // New Styles
    centerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    processingText: {
        color: ZyncTheme.colors.primary,
        marginTop: 20,
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    successContainer: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#222',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    successHeader: {
        alignItems: 'center',
        marginBottom: 30,

    },
    successIconOuter: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(204, 255, 0, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(204, 255, 0, 0.2)',
        shadowColor: ZyncTheme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
    },
    successIconInner: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(204, 255, 0, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    successTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    successSubtitle: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
    },
    ticketContainer: {
        width: '100%',
        alignItems: 'center',
        zIndex: 1,
    },
});
