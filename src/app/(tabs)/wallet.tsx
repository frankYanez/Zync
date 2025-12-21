import { useZync } from '@/application/ZyncContext';
import { MOCK_USERS, PaymentMethod } from '@/infrastructure/mock-data';
import { ScreenLayout } from '@/presentation/components/ScreenLayout';
import { AddCardSheet } from '@/presentation/components/sheets/AddCardSheet';
import { ThemedText } from '@/presentation/components/themed-text';
import { PaymentCard } from '@/presentation/components/ui/PaymentCard';
import { ZyncTheme } from '@/shared/constants/theme';
import BottomSheet from '@gorhom/bottom-sheet';
import React, { useRef, useState } from 'react';
import { Dimensions, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { interpolate, SharedValue, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';


export default function WalletScreen() {
    const { width } = Dimensions.get('window');
    const ITEM_SIZE = width * 0.75;
    const SPACING = 15;
    const EMPTY_ITEM_SIZE = (width - ITEM_SIZE) / 2;

    const { authState } = useZync();
    const user = authState.user || MOCK_USERS[0];
    const points = user.zyncPoints || 0;

    const [cards, setCards] = useState<PaymentMethod[]>(user.cards || []);
    const bottomSheetRef = useRef<BottomSheet>(null);
    const scrollX = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler(event => {
        scrollX.value = event.contentOffset.x;
    });

    const handleAddCard = (newCardData: any) => {
        const newCard: PaymentMethod = {
            id: `c${Date.now()}`,
            type: 'mastercard',
            last4: newCardData.cardNumber.slice(-4) || '0000',
            expiry: newCardData.expiry || '00/00',
            holderName: newCardData.holderName.toUpperCase() || 'USER'
        };
        setCards([...cards, newCard]);
    };

    const [customAmount, setCustomAmount] = useState('');

    const openAddCardSheet = () => {
        bottomSheetRef.current?.expand();
    };

    const carouselData = [...cards, { id: 'add-btn', type: 'add' } as any];

    return (
        <ScreenLayout noPadding>
            <Animated.ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.container}>

                    {/* Points Section */}
                    <View style={styles.pointsContainer}>
                        <ThemedText style={styles.pointsLabel}>ZYNC POINTS</ThemedText>
                        <View style={styles.pointsValueContainer}>
                            <ThemedText style={styles.pointsValue}>{points.toLocaleString()}</ThemedText>
                            <ThemedText style={styles.pointsSub}>pts</ThemedText>
                        </View>
                        <ThemedText style={styles.pointsDesc}>Earned from your payments</ThemedText>
                    </View>

                    {/* Cards Carousel */}
                    <View style={styles.carouselContainer}>
                        <ThemedText style={styles.sectionTitle}>MY WALLET</ThemedText>
                        <Animated.FlatList
                            data={carouselData}
                            keyExtractor={item => item.id}
                            renderItem={({ item, index }) => (
                                <WalletCarouselItem
                                    item={item}
                                    index={index}
                                    scrollX={scrollX}
                                    itemSize={ITEM_SIZE}
                                    onPressAdd={openAddCardSheet}
                                    onPressCard={() => { }}
                                />
                            )}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{
                                paddingHorizontal: EMPTY_ITEM_SIZE,
                                paddingVertical: 20
                            }}
                            snapToInterval={ITEM_SIZE}
                            decelerationRate={0.8}
                            bounces={false}
                            onScroll={scrollHandler}
                            scrollEventThrottle={16}
                        />
                    </View>

                    {/* Top Up Section */}
                    <View style={styles.topUpContainer}>
                        <ThemedText style={styles.sectionTitle}>QUICK TOP UP</ThemedText>

                        <View style={styles.presetRow}>
                            {['$10', '$50', '$100'].map((amount) => (
                                <TouchableOpacity
                                    key={amount}
                                    style={styles.presetButton}
                                    activeOpacity={0.7}
                                    onPress={() => setCustomAmount(amount.replace('$', ''))}
                                >
                                    <ThemedText style={styles.presetText}>{amount}</ThemedText>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.inputWrapper}>
                            <ThemedText style={styles.currencyPrefix}>$</ThemedText>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter custom amount"
                                placeholderTextColor="#666"
                                keyboardType="numeric"
                                value={customAmount}
                                onChangeText={setCustomAmount}
                            />
                        </View>
                    </View>

                </View>
            </Animated.ScrollView>

            <AddCardSheet
                bottomSheetRef={bottomSheetRef}
                onAddCard={handleAddCard}
            />
        </ScreenLayout>
    );
}

// Extracted component to safely use hooks
interface WalletCarouselItemProps {
    item: PaymentMethod | any;
    index: number;
    scrollX: SharedValue<number>;
    itemSize: number;
    onPressAdd: () => void;
    onPressCard: (card: PaymentMethod) => void;
}

const WalletCarouselItem = ({ item, index, scrollX, itemSize, onPressAdd, onPressCard }: WalletCarouselItemProps) => {
    // Reanimated style for scroll interpolation
    const animatedStyle = useAnimatedStyle(() => {
        const inputRange = [
            (index - 1) * itemSize,
            index * itemSize,
            (index + 1) * itemSize,
        ];

        const scale = interpolate(
            scrollX.value,
            inputRange,
            [0.85, 1, 0.85],
            'clamp'
        );

        const opacity = interpolate(
            scrollX.value,
            inputRange,
            [0.5, 1, 0.5],
            'clamp'
        );

        const translateY = interpolate(
            scrollX.value,
            inputRange,
            [10, 0, 10], // Slight floating effect for active card
            'clamp'
        );

        return {
            transform: [{ scale }, { translateY }],
            opacity: opacity,
            width: itemSize, // Explicit width
        };
    });

    if (item.id === 'add-btn') {
        return (
            <Animated.View style={[{ alignItems: 'center' }, animatedStyle]}>
                <PaymentCard
                    isAddMode
                    onPress={onPressAdd}
                    style={styles.card}
                />
            </Animated.View>
        );
    }

    return (
        <Animated.View style={[{ alignItems: 'center' }, animatedStyle]}>
            <PaymentCard
                card={item}
                onPress={() => onPressCard(item)}
                style={styles.card}
            />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,

    },
    pointsContainer: {
        alignItems: 'center',
        marginBottom: 40,

    },
    pointsLabel: {
        fontSize: 14,
        color: ZyncTheme.colors.textSecondary,
        letterSpacing: 2,
        marginBottom: 8,

    },
    pointsValueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',

    },
    pointsValue: {
        textAlign: 'center',
        fontSize: 64,
        fontWeight: '900',
        color: ZyncTheme.colors.primary,
        textShadowColor: 'rgba(204, 255, 0, 0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
        paddingTop: ZyncTheme.spacing.xxl,
    },
    pointsSub: {
        fontSize: 24,
        fontWeight: 'bold',
        color: ZyncTheme.colors.primary,
        marginLeft: 4,
    },
    pointsDesc: {
        fontSize: 12,
        color: '#666',
        marginTop: 8,
    },
    carouselContainer: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        letterSpacing: 1,
        marginLeft: ZyncTheme.spacing.l,
        marginBottom: ZyncTheme.spacing.m,
    },
    carouselContent: {
        paddingHorizontal: 20, // Center first item
        paddingVertical: 20,
        gap: 20,
    },
    cardWrapper: {
        width: 400,
        alignItems: 'center',
    },
    card: {
        width: '100%',
        height: 200,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    topUpContainer: {
        marginTop: ZyncTheme.spacing.xl,
        paddingHorizontal: ZyncTheme.spacing.l,
    },
    presetRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: ZyncTheme.spacing.l,
        gap: 12,
    },
    presetButton: {
        flex: 1,
        paddingVertical: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        // Glow effect
        shadowColor: ZyncTheme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    presetText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: ZyncTheme.colors.primary,
        textShadowColor: 'rgba(204, 255, 0, 0.5)',
        textShadowRadius: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderWidth: 1,
        borderColor: ZyncTheme.colors.primary,
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 56,
        // Glow effect for input
        shadowColor: ZyncTheme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 2,
    },
    currencyPrefix: {
        fontSize: 20,
        fontWeight: 'bold',
        color: ZyncTheme.colors.primary,
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        letterSpacing: 1,
    }
});

