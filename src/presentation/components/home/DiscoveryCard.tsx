import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import React from 'react';
import { ImageBackground, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '../themed-text';

export interface DiscoveryCardProps {
    id: string;
    image: string;
    title: string;
    subtitle: string;
    badge?: string;
    actionLabel?: string;
    onPress?: () => void;
    isLive?: boolean;
}

export function DiscoveryCard({
    image,
    title,
    subtitle,
    badge,
    actionLabel = "VER MÁS",
    onPress,
    isLive
}: DiscoveryCardProps) {

    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={onPress}
            style={styles.cardContainer}
        >
            <ImageBackground
                source={{ uri: image }}
                style={styles.imageBackground}
                imageStyle={{ borderRadius: 24 }}
            >
                {/* Gradient Overlay */}
                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.6)', '#000']}
                    style={StyleSheet.absoluteFill}
                    locations={[0.4, 0.7, 1]}
                />

                {/* Top Badge */}
                {badge && (
                    <View style={styles.badgeContainer}>
                        {isLive && <View style={styles.liveDot} />}
                        <ThemedText style={styles.badgeText}>{badge}</ThemedText>
                    </View>
                )}

                {/* Content */}
                <View style={styles.contentContainer}>
                    <ThemedText style={styles.title}>{title}</ThemedText>

                    {/* Subtitle / Music Genre / Location */}
                    {isLive ? (
                        <View style={styles.subtitleRow}>
                            <Ionicons name="musical-notes" size={14} color={ZyncTheme.colors.primary} />
                            <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
                        </View>
                    ) : (
                        <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
                    )}

                    {/* Action Button */}
                    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
                        <Ionicons name="scan-outline" size={16} color={ZyncTheme.colors.primary} style={{ marginRight: 8 }} />
                        <ThemedText style={styles.actionText}>{actionLabel}</ThemedText>
                    </TouchableOpacity>
                </View>

                {/* Glow Effect for Live Cards */}
                {isLive && (
                    <MotiView
                        from={{ opacity: 0.3 }}
                        animate={{ opacity: 0.6 }}
                        transition={{
                            type: 'timing',
                            duration: 1500,
                            loop: true,
                        }}
                        style={[StyleSheet.absoluteFill, styles.liveGlow]}
                    />
                )}

            </ImageBackground>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    cardContainer: {
        width: 280,
        height: 420,
        marginRight: 16,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: '#111',
        borderWidth: 1,
        borderColor: '#222',
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 5,
    },
    imageBackground: {
        flex: 1,
        justifyContent: 'space-between',
        padding: 20,
    },
    badgeContainer: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: ZyncTheme.colors.primary,
        marginRight: 6,
    },
    badgeText: {
        color: ZyncTheme.colors.primary,
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    contentContainer: {
        marginBottom: 10,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: 'white',
        letterSpacing: -1,
        marginBottom: 4,
    },
    subtitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    subtitle: {
        color: '#ccc',
        fontSize: 14,
        marginLeft: 6,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(204, 255, 0, 0.1)',
        paddingVertical: 12,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: ZyncTheme.colors.primary,
        marginTop: 10,
    },
    actionText: {
        color: ZyncTheme.colors.primary,
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    liveGlow: {
        borderWidth: 2,
        borderColor: ZyncTheme.colors.primary,
        borderRadius: 24,
        zIndex: -1,
    }
});
