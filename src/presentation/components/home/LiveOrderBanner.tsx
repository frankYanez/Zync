import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../themed-text';

interface LiveOrderBannerProps {
    onPress: () => void;
    count?: number;
}

export function LiveOrderBanner({ onPress, count = 1 }: LiveOrderBannerProps) {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
            <View style={styles.content}>
                <View style={styles.indicatorContainer}>
                    <MotiView
                        from={{ opacity: 0.5, scale: 0.8 }}
                        animate={{ opacity: 0, scale: 1.2 }}
                        transition={{
                            type: 'timing',
                            duration: 1000,
                            loop: true,
                        }}
                        style={styles.pulseDot}
                    />
                    <View style={styles.solidDot} />
                </View>
                <ThemedText style={styles.text}>
                    {count > 1 ? `${count} LIVE ORDERS` : 'LIVE ORDER'}
                </ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={16} color={ZyncTheme.colors.primary} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 60, // Adjust based on header height
        right: 20,
        backgroundColor: '#111',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(204, 255, 0, 0.3)',
        zIndex: 100,
        // Glass/Shadow
        shadowColor: ZyncTheme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 8,
    },
    indicatorContainer: {
        width: 12,
        height: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    pulseDot: {
        position: 'absolute',
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: 'rgba(204, 255, 0, 0.4)',
    },
    solidDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: ZyncTheme.colors.primary,
    },
    text: {
        fontSize: 10,
        fontWeight: 'bold',
        color: ZyncTheme.colors.primary,
        letterSpacing: 1,
    },
});
