import { useCart } from '@/application/CartContext';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import React from 'react';
import { Dimensions, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
    interpolate,
    SharedValue,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue
} from 'react-native-reanimated';
import { TicketCard } from '../TicketCard';
import { ThemedText } from '../themed-text';

interface OrderStatusModalProps {
    visible: boolean;
    onClose: () => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_SPACING = (width - CARD_WIDTH) / 2;

// --- COMPONENTES AUXILIARES PARA EVITAR ERRORES DE HOOKS ---

const ParallaxItem = React.memo(({ item, index, scrollX }: { item: any, index: number, scrollX: SharedValue<number> }) => {
    const animatedStyle = useAnimatedStyle(() => {
        const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
        ];

        const scale = interpolate(scrollX.value, inputRange, [0.9, 1, 0.9]);
        const opacity = interpolate(scrollX.value, inputRange, [0.6, 1, 0.6]);
        return {
            transform: [{ scale }],
            opacity
        };
    });

    return (
        <Animated.View style={[{ width: CARD_WIDTH }, animatedStyle]}>
            <TicketCard
                orderId={item.id}
                items={item.items}
                total={item.total}
                savings={item.savings}
                establishmentLogo={item.establishmentLogo}
            />
        </Animated.View>
    );
});

const PaginationDot = React.memo(({ index, scrollX }: { index: number, scrollX: SharedValue<number> }) => {
    const animatedDotStyle = useAnimatedStyle(() => {
        const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
        ];

        const opacity = interpolate(scrollX.value, inputRange, [0.3, 1, 0.3], 'clamp');
        const scale = interpolate(scrollX.value, inputRange, [0.8, 1.2, 0.8], 'clamp');

        return { opacity, transform: [{ scale }] };
    });

    return <Animated.View style={[styles.dot, animatedDotStyle]} />;
});

// --- COMPONENTE PRINCIPAL ---

export function OrderStatusModal({ visible, onClose }: OrderStatusModalProps) {
    const { activeOrders } = useCart();
    const scrollX = useSharedValue(0);

    const onScroll = useAnimatedScrollHandler((event) => {
        scrollX.value = event.contentOffset.x;
    });

    if (!activeOrders || activeOrders.length === 0) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />

                {/* Close Button */}
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>

                <View style={styles.content}>
                    <View style={styles.header}>
                        <View style={styles.liveBadge}>
                            <View style={styles.liveDot} />
                            <ThemedText style={styles.liveText}>
                                {activeOrders.length > 1 ? `${activeOrders.length} LIVE ORDERS` : 'LIVE ORDER'}
                            </ThemedText>
                        </View>
                        <ThemedText style={styles.statusText}>Preparing your drinks...</ThemedText>
                    </View>

                    {/* Parallax Carousel */}
                    <Animated.FlatList
                        data={activeOrders}
                        keyExtractor={(item) => item.id}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        snapToInterval={width}
                        decelerationRate="fast"
                        contentContainerStyle={{
                            paddingHorizontal: CARD_SPACING,
                            paddingVertical: 20
                        }}
                        snapToAlignment="center"
                        onScroll={onScroll}
                        scrollEventThrottle={16}
                        renderItem={({ item, index }) => (
                            <ParallaxItem item={item} index={index} scrollX={scrollX} />
                        )}
                    />
                </View>

                {/* Pagination Dots */}
                <View style={styles.pagination}>
                    {activeOrders.map((_, index) => (
                        <PaginationDot key={index} index={index} scrollX={scrollX} />
                    ))}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingTop: 60,
    },
    closeButton: {
        position: 'absolute',
        top: 60,
        right: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    content: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 10,
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(204, 255, 0, 0.1)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: ZyncTheme.colors.primary,
        marginBottom: 12,
    },
    liveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: ZyncTheme.colors.primary,
        marginRight: 8,
    },
    liveText: {
        color: ZyncTheme.colors.primary,
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    statusText: {
        color: '#ccc',
        fontSize: 14,
    },
    pagination: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: ZyncTheme.colors.primary,
        marginHorizontal: 4,
    }
});