import { ThemedText } from '@/components/themed-text';
import { useZync } from '@/context/ZyncContext';
import { Establishment } from '@/infrastructure/mock-data';
import { getEvents } from '@/features/dashboard/services/event.service';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

const CARD_WIDTH = 240;
const CARD_HEIGHT = 150;

export function EventsCarousel() {
    const { setEstablishment, currentEstablishment } = useZync();
    const [events, setEvents] = useState<Establishment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getEvents(0, 20)
            .then((data) => {
                const mapped: Establishment[] = data.map((event) => ({
                    id: event.id,
                    eventId: event.id,
                    venueId: event.venueId,
                    name: event.name,
                    location: event.venue
                        ? `${event.venue.name}${event.venue.address ? ` • ${event.venue.address}` : ''}`
                        : '',
                    image: event.imageUrl ?? '',
                    video: '',
                    rating: 0,
                    theme: 'cyber',
                    currentDj: event.isActive
                        ? { name: '', genre: '', startTime: '', endTime: '', isLive: true }
                        : undefined,
                }));
                setEvents(mapped);
            })
            .catch(() => setEvents([]))
            .finally(() => setLoading(false));
    }, []);

    if (!loading && events.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <ThemedText style={styles.sectionTitle}>ESTA NOCHE</ThemedText>
                <View style={styles.titleAccent} />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator color={ZyncTheme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={events}
                    horizontal
                    keyExtractor={(item) => item.id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.list}
                    renderItem={({ item }) => {
                        const isSelected = currentEstablishment?.id === item.id;
                        return (
                            <TouchableOpacity
                                onPress={() => setEstablishment(item)}
                                activeOpacity={0.8}
                                style={[styles.card, isSelected && styles.cardSelected]}
                            >
                                {item.image ? (
                                    <Image
                                        source={{ uri: item.image }}
                                        style={StyleSheet.absoluteFill}
                                        contentFit="cover"
                                        transition={300}
                                    />
                                ) : (
                                    <View style={[StyleSheet.absoluteFill, styles.cardFallback]} />
                                )}

                                <LinearGradient
                                    colors={['transparent', 'rgba(0,0,0,0.75)', 'rgba(0,0,0,0.95)']}
                                    locations={[0.2, 0.6, 1]}
                                    style={StyleSheet.absoluteFill}
                                />

                                {/* Selected indicator */}
                                {isSelected && (
                                    <View style={styles.selectedBorder} />
                                )}

                                {/* Active badge */}
                                {item.currentDj?.isLive && (
                                    <View style={styles.activeBadge}>
                                        <View style={styles.activeDot} />
                                        <ThemedText style={styles.activeBadgeText}>ACTIVO</ThemedText>
                                    </View>
                                )}

                                <View style={styles.cardContent}>
                                    <ThemedText style={styles.cardName} numberOfLines={2}>
                                        {item.name}
                                    </ThemedText>
                                    {item.location ? (
                                        <View style={styles.locationRow}>
                                            <Ionicons
                                                name="location-sharp"
                                                size={11}
                                                color={ZyncTheme.colors.primary}
                                            />
                                            <ThemedText style={styles.cardLocation} numberOfLines={1}>
                                                {item.location}
                                            </ThemedText>
                                        </View>
                                    ) : null}
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: ZyncTheme.spacing.l,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: ZyncTheme.spacing.l,
        marginBottom: ZyncTheme.spacing.m,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 2,
        color: ZyncTheme.colors.textSecondary,
    },
    titleAccent: {
        flex: 1,
        height: 1,
        backgroundColor: ZyncTheme.colors.border,
    },
    loadingContainer: {
        height: CARD_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center',
    },
    list: {
        paddingHorizontal: ZyncTheme.spacing.l,
        gap: ZyncTheme.spacing.m,
    },
    card: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: ZyncTheme.colors.card,
        justifyContent: 'flex-end',
        borderWidth: 1,
        borderColor: ZyncTheme.colors.border,
    },
    cardSelected: {
        borderColor: ZyncTheme.colors.primary,
        shadowColor: ZyncTheme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 12,
        elevation: 8,
    },
    cardFallback: {
        backgroundColor: '#1a1a1a',
    },
    selectedBorder: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: ZyncTheme.colors.primary,
    },
    activeBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(204,255,0,0.15)',
        borderWidth: 1,
        borderColor: ZyncTheme.colors.primary,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        gap: 4,
    },
    activeDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: ZyncTheme.colors.primary,
    },
    activeBadgeText: {
        color: ZyncTheme.colors.primary,
        fontSize: 9,
        fontWeight: '800',
        letterSpacing: 1,
    },
    cardContent: {
        padding: 12,
        gap: 4,
    },
    cardName: {
        fontSize: 16,
        fontWeight: '800',
        color: 'white',
        letterSpacing: -0.3,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
    },
    cardLocation: {
        fontSize: 11,
        color: '#bbb',
        fontWeight: '500',
        flex: 1,
    },
});
