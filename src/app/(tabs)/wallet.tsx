import { useZync } from '@/application/ZyncContext';
import { MOCK_USERS, PaymentMethod } from '@/infrastructure/mock-data';
import { ScreenLayout } from '@/presentation/components/ScreenLayout';
import { AddCardSheet } from '@/presentation/components/sheets/AddCardSheet';
import { ThemedText } from '@/presentation/components/themed-text';
import { PaymentCard } from '@/presentation/components/ui/PaymentCard';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet from '@gorhom/bottom-sheet';
import { MotiView } from 'moti';
import React, { useRef, useState } from 'react';
import { Dimensions, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { interpolate, SharedValue, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

export default function WalletScreen() {
    const { width } = Dimensions.get('window');
    const ITEM_SIZE = width * 0.75;
    const EMPTY_ITEM_SIZE = (width - ITEM_SIZE) / 2;

    const { authState } = useZync();
    const user = authState.user || MOCK_USERS[0];
    const points = user.zyncPoints || 0;
    const balance = user.balance || 0;

    const [cards, setCards] = useState<PaymentMethod[]>(user.cards || []);
    const bottomSheetRef = useRef<BottomSheet>(null);
    const scrollX = useSharedValue(0);

    const [selectedAmount, setSelectedAmount] = useState<string>('');
    const [customAmount, setCustomAmount] = useState('');

    const activeAmount = customAmount || selectedAmount; // Logic: custom overrides preset if typed, or just one state?
    // Let's make it exclusive: if typing custom, clear preset. If picking preset, clear custom.

    const handlePresetPress = (amount: string) => {
        setSelectedAmount(amount);
        setCustomAmount('');
    };

    const handleCustomChange = (text: string) => {
        setCustomAmount(text);
        setSelectedAmount('');
    };

    const hasAmount = activeAmount && parseFloat(activeAmount) > 0;

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

    const openAddCardSheet = () => {
        bottomSheetRef.current?.expand();
    };

    const carouselData = [...cards, { id: 'add-btn', type: 'add' } as any];

    return (
        <ScreenLayout noPadding>
            <Animated.ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.container}>

                    {/* 1. TOTAL BALANCE */}
                    <View style={styles.balanceSection}>
                        <ThemedText style={styles.balanceLabel}>TOTAL BALANCE</ThemedText>
                        <View style={styles.balanceRow}>
                            <ThemedText style={styles.currency}>$</ThemedText>
                            <ThemedText style={styles.balanceAmount}>
                                {balance.toLocaleString()}
                            </ThemedText>
                            <ThemedText style={styles.cents}>.00</ThemedText>
                        </View>

                        {/* 2. ZYNC POINTS */}
                        <View style={styles.pointsBadge}>
                            <Ionicons name="flash" size={12} color={ZyncTheme.colors.primary} />
                            <ThemedText style={styles.pointsLabelSmall}>ZYNC POINTS ACUMULADOS</ThemedText>
                            <ThemedText style={styles.pointsValue}>{points.toLocaleString()} pts</ThemedText>
                        </View>
                    </View>

                    {/* 3. MY WALLET (CAROUSEL) */}
                    <View style={styles.carouselSection}>
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
                                paddingVertical: 10
                            }}
                            snapToInterval={ITEM_SIZE}
                            decelerationRate={0.8}
                            bounces={false}
                            onScroll={scrollHandler}
                            scrollEventThrottle={16}
                        />
                    </View>

                    {/* 4. QUICK TOP UP */}
                    <View style={styles.topUpSection}>
                        <ThemedText style={styles.sectionTitle}>QUICK TOP UP</ThemedText>
                        <View style={styles.presetRow}>
                            {['10', '50', '100'].map((val) => {
                                const isActive = selectedAmount === val;
                                return (
                                    <TouchableOpacity
                                        key={val}
                                        style={[styles.presetButton, isActive && styles.presetButtonActive]}
                                        onPress={() => handlePresetPress(val)}
                                    >
                                        <ThemedText style={[styles.presetText, isActive && styles.presetTextActive]}>
                                            ${val}
                                        </ThemedText>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* 5. CUSTOM AMOUNT */}
                        <View style={styles.inputContainer}>
                            <Ionicons name="cash-outline" size={20} color={ZyncTheme.colors.primary} style={{ marginRight: 10 }} />
                            <TextInput
                                style={styles.input}
                                placeholder="Otro Monto"
                                placeholderTextColor="#666"
                                keyboardType="numeric"
                                value={customAmount}
                                onChangeText={handleCustomChange}
                            />
                        </View>
                    </View>

                    {/* 6. ALIAS */}
                    <View style={styles.aliasContainer}>
                        <View style={styles.aliasIcon}>
                            <Ionicons name="at" size={24} color={ZyncTheme.colors.primary} />
                        </View>
                        <View style={styles.aliasContent}>
                            <ThemedText style={styles.aliasLabel}>MI ALIAS</ThemedText>
                            <ThemedText style={styles.aliasValue}>{user.handle.replace('@', '') || 'usuario.zync'}</ThemedText>
                        </View>
                        <Ionicons name="copy-outline" size={20} color="#666" />
                    </View>

                    {/* 7. CHARGE BUTTON (ANIMATED) */}
                    {hasAmount && (
                        <View style={styles.buttonContainer}>
                            {/* Ping/Glow Animation behind the button */}
                            <MotiView
                                from={{
                                    scale: 1,
                                    opacity: 0.8,
                                }}
                                animate={{
                                    scale: 1.15,
                                    opacity: 0,
                                }}
                                transition={{
                                    type: 'timing',
                                    duration: 2000,
                                    loop: true,
                                    repeatReverse: true,
                                }}
                                style={{
                                    position: 'absolute',
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: 30,
                                    backgroundColor: ZyncTheme.colors.primary,
                                    shadowColor: ZyncTheme.colors.primary,
                                    shadowOffset: { width: 0, height: 0 },
                                    shadowOpacity: 1,
                                    shadowRadius: 15,
                                    elevation: 10,

                                }}
                            />

                            <TouchableOpacity style={styles.chargeButton} activeOpacity={0.8}>
                                <MotiView
                                    from={{ opacity: 0.6 }}
                                    animate={{ opacity: 1 }}
                                    transition={{
                                        type: 'timing',
                                        duration: 800,
                                        loop: true,
                                        repeatReverse: true,
                                    }}
                                    style={{ marginRight: 10 }}
                                >
                                    <Ionicons name="flash" size={24} color="black" />
                                </MotiView>
                                <ThemedText style={styles.chargeButtonText}>Cargar Saldo</ThemedText>
                            </TouchableOpacity>
                        </View>
                    )}

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
            [0.9, 1, 0.9],
            'clamp'
        );

        const opacity = interpolate(
            scrollX.value,
            inputRange,
            [0.6, 1, 0.6],
            'clamp'
        );

        return {
            transform: [{ scale }],
            opacity: opacity,
            width: itemSize,
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
    scrollContent: {
        paddingBottom: 100,
    },
    container: {
        flex: 1,
        paddingTop: 20,
    },
    balanceSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    balanceLabel: {
        fontSize: 10,

        letterSpacing: 2,
        color: '#666',
        fontWeight: 'bold',
        marginBottom: 8,
    },
    balanceRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',

    },
    currency: {
        paddingTop: 10,
        fontSize: 32,
        color: '#666',
        marginTop: 10,
        marginRight: 4,
        overflow: "visible"
    },
    balanceAmount: {
        fontSize: 64,
        paddingTop: ZyncTheme.spacing.xxl,
        fontWeight: 'bold',
        color: ZyncTheme.colors.primary,
        letterSpacing: -2,
        overflow: "visible",
        shadowColor: ZyncTheme.shadowGlow.shadowColor,
        shadowOffset: ZyncTheme.shadowGlow.shadowOffset,
        shadowOpacity: ZyncTheme.shadowGlow.shadowOpacity,
        shadowRadius: ZyncTheme.shadowGlow.shadowRadius,
        elevation: ZyncTheme.shadowGlow.elevation,
    },
    cents: {
        fontSize: 32,
        color: '#666',
        marginTop: 18,
        paddingTop: 8
    },
    pointsBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 8,
        borderWidth: 1,
        borderColor: '#333',
        marginTop: 16,
    },
    pointsLabelSmall: {
        fontSize: 10,
        color: '#888',
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    pointsValue: {
        fontSize: 14,
        color: 'white',
        fontWeight: 'bold',
    },
    carouselSection: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: 1.5,
        marginLeft: ZyncTheme.spacing.l,
        marginBottom: ZyncTheme.spacing.m,
        textTransform: 'uppercase',
    },
    card: {
        width: '100%',
        height: 200,
    },
    topUpSection: {
        paddingHorizontal: ZyncTheme.spacing.l,
        marginBottom: 20,
    },
    presetRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 16,
    },
    presetButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#333',
        backgroundColor: '#0a0a0a',
        alignItems: 'center',
        justifyContent: 'center',
    },
    presetButtonActive: {
        borderColor: ZyncTheme.colors.primary,
        backgroundColor: 'rgba(204, 255, 0, 0.1)',
    },
    presetText: {
        fontSize: 18,
        color: ZyncTheme.colors.primary,
        fontWeight: 'bold',
    },
    presetTextActive: {
        color: ZyncTheme.colors.primary,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0a0a0a',
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 24,
        paddingHorizontal: 20,
        height: 60,
    },
    input: {
        flex: 1,
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    aliasContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: ZyncTheme.spacing.l,
        padding: 16,
        backgroundColor: '#0a0a0a',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#333',
        marginBottom: 30,
    },
    aliasIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    aliasContent: {
        flex: 1,
    },
    aliasLabel: {
        fontSize: 10,
        color: '#666',
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 2,
    },
    aliasValue: {
        fontSize: 16,
        color: 'white',
        fontWeight: 'bold',
    },
    buttonContainer: {
        marginHorizontal: ZyncTheme.spacing.l,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    buttonBorderGlow: {
        position: 'absolute',
        width: '102%',
        height: '110%',
        borderRadius: 30,
        opacity: 0.8,
    },
    chargeButton: {
        width: '100%',
        height: 60,
        backgroundColor: ZyncTheme.colors.primary,
        borderRadius: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        // Internal shadow to separate from border
        borderWidth: 4,
        borderColor: '#000',
    },
    chargeButtonText: {
        color: 'black',
        fontSize: 18,
        fontWeight: 'bold',
    }
});

