import { CyberCard } from '@/components/CyberCard';
import { NeonButton } from '@/components/NeonButton';
import { ScreenLayout } from '@/components/ScreenLayout';
import { ThemedText } from '@/components/themed-text';
import { getMyEvents } from '@/features/dashboard/services/event.service';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Event } from '../domain/event.types';

function EventCard({ event, onPress }: { event: Event; onPress: () => void }) {
    const start = new Date(event.startsAt);
    const isActive = event.isActive;

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
            <CyberCard style={styles.card}>
                {event.imageUrl ? (
                    <Image source={{ uri: event.imageUrl }} style={styles.cardImage} contentFit="cover" />
                ) : (
                    <View style={styles.cardImageFallback}>
                        <Ionicons name="musical-notes" size={32} color={ZyncTheme.colors.textSecondary} />
                    </View>
                )}
                <View style={styles.cardBody}>
                    <View style={styles.cardTop}>
                        <ThemedText style={styles.cardName} numberOfLines={1}>{event.name}</ThemedText>
                        <View style={[styles.activeBadge, { backgroundColor: isActive ? '#22C55E22' : ZyncTheme.colors.card, borderColor: isActive ? '#22C55E' : ZyncTheme.colors.border }]}>
                            <View style={[styles.activeDot, { backgroundColor: isActive ? '#22C55E' : ZyncTheme.colors.textSecondary }]} />
                            <ThemedText style={[styles.activeBadgeText, { color: isActive ? '#22C55E' : ZyncTheme.colors.textSecondary }]}>
                                {isActive ? 'En vivo' : 'Inactivo'}
                            </ThemedText>
                        </View>
                    </View>
                    <ThemedText style={styles.cardVenue} numberOfLines={1}>
                        {event.venue?.name ?? '—'}
                    </ThemedText>
                    <View style={styles.cardMeta}>
                        <View style={styles.metaItem}>
                            <Ionicons name="calendar-outline" size={13} color={ZyncTheme.colors.textSecondary} />
                            <ThemedText style={styles.metaText}>
                                {start.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                            </ThemedText>
                        </View>
                        <View style={styles.metaItem}>
                            <Ionicons name="time-outline" size={13} color={ZyncTheme.colors.textSecondary} />
                            <ThemedText style={styles.metaText}>
                                {start.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                            </ThemedText>
                        </View>
                        {event.capacity && (
                            <View style={styles.metaItem}>
                                <Ionicons name="people-outline" size={13} color={ZyncTheme.colors.textSecondary} />
                                <ThemedText style={styles.metaText}>{event.capacity}</ThemedText>
                            </View>
                        )}
                    </View>
                </View>
            </CyberCard>
        </TouchableOpacity>
    );
}

export default function OrganizerEventsScreen() {
    const router = useRouter();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async () => {
        try {
            const data = await getMyEvents();
            setEvents(data);
        } catch (e) {
            console.error('Failed to load events', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const onRefresh = () => { setRefreshing(true); load(); };

    return (
        <ScreenLayout style={styles.container} noPadding>
            <View style={styles.header}>
                <ThemedText style={styles.title}>Mis Eventos</ThemedText>
                <TouchableOpacity
                    style={styles.createBtn}
                    onPress={() => router.push('/(business)/events/create' as any)}
                >
                    <Ionicons name="add" size={22} color="#000" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={ZyncTheme.colors.primary} />
                </View>
            ) : events.length === 0 ? (
                <View style={styles.centered}>
                    <Ionicons name="calendar-outline" size={56} color={ZyncTheme.colors.textSecondary} />
                    <ThemedText style={styles.emptyText}>Aún no creaste ningún evento</ThemedText>
                    <NeonButton
                        title="Crear evento"
                        onPress={() => router.push('/(business)/events/create' as any)}
                        style={{ marginTop: ZyncTheme.spacing.m, paddingHorizontal: 32 }}
                    />
                </View>
            ) : (
                <FlatList
                    data={events}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <EventCard
                            event={item}
                            onPress={() => router.push(`/(business)/events/${item.id}` as any)}
                        />
                    )}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ZyncTheme.colors.primary} />}
                />
            )}
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: ZyncTheme.spacing.m,
        paddingTop: ZyncTheme.spacing.l,
        paddingBottom: ZyncTheme.spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.08)',
    },
    title: { fontSize: 22, fontWeight: 'bold', color: 'white' },
    createBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: ZyncTheme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: { padding: ZyncTheme.spacing.m, gap: ZyncTheme.spacing.s },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    emptyText: { color: ZyncTheme.colors.textSecondary, fontSize: 15 },
    card: { padding: 0, overflow: 'hidden', flexDirection: 'row', gap: 0 },
    cardImage: { width: 90, height: 90 },
    cardImageFallback: {
        width: 90,
        height: 90,
        backgroundColor: ZyncTheme.colors.card,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardBody: { flex: 1, padding: ZyncTheme.spacing.m, gap: 4 },
    cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
    cardName: { fontSize: 15, fontWeight: '700', color: 'white', flex: 1 },
    activeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        borderRadius: 8,
        borderWidth: 1,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    activeDot: { width: 6, height: 6, borderRadius: 3 },
    activeBadgeText: { fontSize: 10, fontWeight: '600' },
    cardVenue: { fontSize: 12, color: ZyncTheme.colors.textSecondary },
    cardMeta: { flexDirection: 'row', gap: ZyncTheme.spacing.m, marginTop: 4 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { fontSize: 12, color: ZyncTheme.colors.textSecondary },
});
