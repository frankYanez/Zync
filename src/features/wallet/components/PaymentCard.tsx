import { PaymentMethod } from '@/infrastructure/mock-data';
import { ThemedText } from '@/components/themed-text';
import { CyberCard } from '@/components/CyberCard';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface PaymentCardProps {
    card?: PaymentMethod;
    isAddMode?: boolean;
    onPress: () => void;
    style?: any;
}

export function PaymentCard({ card, isAddMode, onPress, style }: PaymentCardProps) {
    if (isAddMode) {
        return (
            <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={style}>
                <CyberCard style={styles.cardContainer}>
                    <View style={[styles.cardContent, styles.addCardContent]}>
                        <View style={styles.addIconContainer}>
                            <Ionicons name="add" size={40} color={ZyncTheme.colors.primary} />
                        </View>
                        <ThemedText style={styles.addText}>ADD NEW CARD</ThemedText>
                    </View>
                </CyberCard>
            </TouchableOpacity>
        );
    }

    if (!card) return null;

    const getCardIcon = (type: string) => {
        switch (type) {
            case 'visa': return 'logo-visa'; // Simplified fallback if icon not found
            case 'mastercard': return 'card'; // Fallback
            default: return 'card';
        }
    };

    const getGradientColors = (type: string): [string, string, ...string[]] => {
        // Unified Dark "Void" aesthetic for all cards
        return ['#1a1a1a', '#000000'];
    };

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={style}>
            <CyberCard style={[styles.cardContainer, styles.glowContainer]} >
                <LinearGradient
                    colors={getGradientColors(card.type)}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
                <View style={styles.cardContent}>
                    {/* Header: Chip + Logo */}
                    <View style={styles.cardHeader}>
                        <Ionicons name="hardware-chip-outline" size={32} color={ZyncTheme.colors.primary} style={{ opacity: 0.9 }} />
                        {/* Text fallback for brand if icon unavailable */}
                        <ThemedText style={{ fontWeight: '900', color: 'rgba(255,255,255,0.8)', letterSpacing: 2 }}>
                            {card.type.toUpperCase()}
                        </ThemedText>
                    </View>

                    {/* Number */}
                    <View style={styles.cardNumberContainer}>
                        <ThemedText style={styles.cardNumber}>•••• •••• •••• {card.last4}</ThemedText>
                    </View>

                    {/* Footer: Name + Expiry */}
                    <View style={styles.cardFooter}>
                        <View>
                            <ThemedText style={styles.label}>CARD HOLDER</ThemedText>
                            <ThemedText style={styles.value}>{card.holderName}</ThemedText>
                        </View>
                        <View>
                            <ThemedText style={styles.label}>EXPIRES</ThemedText>
                            <ThemedText style={styles.value}>{card.expiry}</ThemedText>
                        </View>
                    </View>

                    {/* Decorative shine */}
                    <View style={styles.shine} />
                </View>
            </CyberCard>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        height: 200,
        width: 320,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    glowContainer: {
        shadowColor: ZyncTheme.colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 12,
        backgroundColor: '#000', // Ensure shadow is visible
    },
    cardContent: {
        flex: 1,
        padding: 24,
        justifyContent: 'space-between',
    },
    addCardContent: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(20, 20, 20, 0.8)',
        borderStyle: 'dashed',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
        borderRadius: 24,
    },
    addIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: 'rgba(204, 255, 0, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: ZyncTheme.colors.primary,
        shadowColor: ZyncTheme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
    },
    addText: {
        color: ZyncTheme.colors.primary,
        fontWeight: 'bold',
        letterSpacing: 2,
        textShadowColor: ZyncTheme.colors.primary,
        textShadowRadius: 5,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardNumberContainer: {
        marginTop: 10,
    },
    cardNumber: {
        fontSize: 22,
        fontFamily: 'monospace',
        color: 'white',
        letterSpacing: 3,
        textShadowColor: 'rgba(0,0,0,0.8)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 4,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    label: {
        fontSize: 10,
        color: ZyncTheme.colors.textSecondary,
        marginBottom: 4,
        letterSpacing: 1.5,
        fontWeight: '600',
    },
    value: {
        fontSize: 14,
        fontWeight: 'bold',
        color: 'white',
        letterSpacing: 1,
    },
    shine: {
        position: 'absolute',
        top: -60,
        right: -60,
        width: 180,
        height: 180,
        backgroundColor: 'rgba(204, 255, 0, 0.03)',
        borderRadius: 90,
        transform: [{ scaleX: 2 }],
    }
});
