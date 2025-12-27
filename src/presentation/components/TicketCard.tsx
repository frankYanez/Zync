import { CartItem } from '@/application/CartContext';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { ThemedText } from './themed-text';

interface TicketCardProps {
    orderId: string;
    items: CartItem[];
    total: number;
    savings: number;
    establishmentLogo?: string;
}

export function TicketCard({ orderId, items, total, savings, establishmentLogo }: TicketCardProps) {
    const rotate = useSharedValue(0);

    const handleFlip = () => {
        rotate.value = withTiming(rotate.value === 0 ? 1 : 0, { duration: 800 });
    };

    const frontStyle = useAnimatedStyle(() => {
        const rotateValue = interpolate(rotate.value, [0, 1], [0, 180]);
        return {
            transform: [
                { perspective: 1000 },
                { rotateY: `${rotateValue}deg` },
            ],
            backfaceVisibility: 'hidden',
        };
    });

    const backStyle = useAnimatedStyle(() => {
        const rotateValue = interpolate(rotate.value, [0, 1], [180, 360]);
        return {
            transform: [
                { perspective: 1000 },
                { rotateY: `${rotateValue}deg` },
            ],
            backfaceVisibility: 'hidden',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
        };
    });

    return (
        <TouchableOpacity activeOpacity={1} onPress={handleFlip} style={styles.container}>
            {/* Front Side */}
            <Animated.View style={[styles.card, frontStyle]}>
                {establishmentLogo && (
                    <Image
                        source={{ uri: establishmentLogo }}
                        style={StyleSheet.absoluteFill}
                        resizeMode="cover"
                        blurRadius={30}
                        opacity={0.3}
                    />
                )}

                <View style={styles.cardHeader}>
                    <View>
                        <ThemedText style={styles.label}>TICKET DIGITAL</ThemedText>
                        <ThemedText style={styles.title}>Tu Pedido</ThemedText>
                    </View>
                    <View style={styles.iconContainer}>
                        <Ionicons name="receipt-outline" size={20} color={ZyncTheme.colors.primary} />
                    </View>
                </View>

                {/* Hero Image (First item or generic) */}
                <View style={styles.heroImageContainer}>
                    {items[0]?.image ? (
                        <Image source={{ uri: items[0].image }} style={styles.heroImage} resizeMode="cover" />
                    ) : (
                        <View style={[styles.heroImage, { backgroundColor: '#222', alignItems: 'center', justifyContent: 'center' }]}>
                            <Ionicons name="wine" size={40} color="#666" />
                        </View>
                    )}
                    <View style={styles.overlay} />
                    <View style={styles.orderNumberContainer}>
                        <ThemedText style={styles.orderLabel}>ORDEN #</ThemedText>
                        <ThemedText style={styles.orderValue}>{orderId}</ThemedText>
                    </View>
                </View>

                {/* Item List (Truncated if too long) */}
                <View style={styles.itemList}>
                    {items.slice(0, 3).map((item) => (
                        <View key={item.id} style={styles.itemRow}>
                            <View style={styles.quantityBadge}>
                                <ThemedText style={styles.quantityText}>{item.quantity}</ThemedText>
                            </View>
                            <View style={{ flex: 1, marginHorizontal: 12 }}>
                                <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                                <ThemedText style={styles.itemDesc}>Standard</ThemedText>
                            </View>
                            <ThemedText style={styles.itemPrice}>${item.price.toLocaleString()}</ThemedText>
                        </View>
                    ))}
                    {items.length > 3 && (
                        <ThemedText style={styles.moreItems}>+ {items.length - 3} more items...</ThemedText>
                    )}
                </View>

                <View style={styles.divider} />

                <View style={styles.totalRow}>
                    <ThemedText style={styles.totalLabel}>Total pagado</ThemedText>
                    <ThemedText style={styles.totalValue}>${total.toLocaleString()}</ThemedText>
                </View>

                <View style={styles.flipHint}>
                    <Ionicons name="hand-left-outline" size={16} color="#666" style={{ marginRight: 6 }} />
                    <ThemedText style={styles.flipText}>Toca la tarjeta para voltear</ThemedText>
                </View>
            </Animated.View>

            {/* Back Side */}
            <Animated.View style={[styles.card, backStyle]}>
                <View style={styles.backContent}>
                    <View style={styles.qrContainer}>
                        {/* Visual Simulation of a QR Code using localized blocks/icons if no library, 
                             but here simpler to just use a massive icon or placeholder image for 'Scan' */}
                        <Ionicons name="qr-code" size={200} color="white" />
                    </View>
                    <ThemedText style={styles.scanText}>Escanea para retirar</ThemedText>
                    <ThemedText style={styles.orderValueBack}>#{orderId}</ThemedText>
                </View>

                <View style={styles.flipHint}>
                    <Ionicons name="refresh-outline" size={16} color="#666" style={{ marginRight: 6 }} />
                    <ThemedText style={styles.flipText}>Toca para ver el detalle</ThemedText>
                </View>
            </Animated.View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 520, // Adjust based on content
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        width: '100%',
        height: '100%',
        backgroundColor: '#111',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1,
        borderColor: '#333',
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    label: {
        fontSize: 12,
        color: ZyncTheme.colors.primary,
        fontWeight: 'bold',
        marginBottom: 4,
        letterSpacing: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1a1a1a',
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroImageContainer: {
        height: 140,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 24,
        position: 'relative',
        justifyContent: 'center',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    orderNumberContainer: {
        position: 'absolute',
        left: 20,
        bottom: 20,
    },
    orderLabel: {
        color: '#aaa',
        fontSize: 12,
        marginBottom: 4,
    },
    orderValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
    },
    itemList: {
        flex: 1,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    quantityBadge: {
        width: 24,
        height: 24,
        borderRadius: 6,
        backgroundColor: '#333',
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantityText: {
        fontWeight: 'bold',
        fontSize: 12,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
    itemDesc: {
        fontSize: 12,
        color: '#666',
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
    moreItems: {
        fontSize: 12,
        color: '#666',
        textAlign: 'center',
        marginTop: 4,
    },
    divider: {
        height: 1,
        backgroundColor: '#222',
        marginVertical: 16,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    totalLabel: {
        color: '#888',
        fontSize: 16,
    },
    totalValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: ZyncTheme.colors.primary,
    },
    flipHint: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 'auto',
    },
    flipText: {
        color: '#666',
        fontSize: 12,
    },
    // Back styles
    backContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    qrContainer: {
        padding: 20,
        backgroundColor: '#000',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#333',
        marginBottom: 24,
    },
    scanText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
    },
    orderValueBack: {
        fontSize: 24,
        fontWeight: 'bold',
        color: ZyncTheme.colors.primary,
    }

});
