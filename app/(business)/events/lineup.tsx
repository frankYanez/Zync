import { ScreenLayout } from '@/components/ScreenLayout';
import { ThemedText } from '@/components/themed-text';
import { getEventLineup, getMyEvents } from '@/features/dashboard/services/event.service';
import { LineupEntry } from '@/features/dashboard/domain/event.types';
import { DjProfile } from '@/features/dj/domain/dj.types';
import { addDjToLineup, getDjs } from '@/features/dj/services/dj.service';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

interface EventSummary {
    id: string;
    name: string;
    date: string;
}

export default function OrganizerLineupScreen() {
    const router = useRouter();
    const [events, setEvents] = useState<EventSummary[]>([]);
    const [djs, setDjs] = useState<DjProfile[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [lineup, setLineup] = useState<LineupEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lineupLoading, setLineupLoading] = useState(false);
    const [addingDjId, setAddingDjId] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [eventList, djList] = await Promise.all([getMyEvents(), getDjs()]);
                const mapped: EventSummary[] = eventList.map((e: any) => ({
                    id: e.id,
                    name: e.name,
                    date: e.startDate ?? e.startsAt ?? '',
                }));
                setEvents(mapped);
                setDjs(djList);
                if (mapped.length > 0) setSelectedEventId(mapped[0].id);
            } catch (error) {
                console.error('Error fetching data:', error);
                Alert.alert('Error', 'No se pudieron cargar los datos.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const fetchLineup = useCallback(async (eventId: string) => {
        setLineupLoading(true);
        try {
            const data = await getEventLineup(eventId);
            setLineup(data);
        } catch {
            setLineup([]);
        } finally {
            setLineupLoading(false);
        }
    }, []);

    useEffect(() => {
        if (selectedEventId) fetchLineup(selectedEventId);
    }, [selectedEventId, fetchLineup]);

    const lineupDjIds = new Set(lineup.map(e => e.djProfileId));

    const handleAddDj = async (dj: DjProfile) => {
        if (!selectedEventId) {
            Alert.alert('Seleccioná un evento', 'Primero seleccioná el evento al que querés agregar el DJ.');
            return;
        }
        if (lineupDjIds.has(dj.id)) {
            Alert.alert('Ya está en el lineup', `${dj.artistName} ya fue agregado a este evento.`);
            return;
        }

        setAddingDjId(dj.id);
        try {
            await addDjToLineup(dj.id, selectedEventId);
            await fetchLineup(selectedEventId);
            Alert.alert('¡Listo!', `${dj.artistName} fue agregado al lineup.`);
        } catch (error: any) {
            const msg = error?.response?.data?.message;
            Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg || 'No se pudo agregar el DJ al lineup.');
        } finally {
            setAddingDjId(null);
        }
    };

    if (isLoading) {
        return (
            <ScreenLayout style={styles.center} noPadding>
                <ActivityIndicator size="large" color={ZyncTheme.colors.primary} />
            </ScreenLayout>
        );
    }

    return (
        <ScreenLayout noPadding>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Manage Lineup</ThemedText>
            </View>

            {/* Event selector */}
            <View style={styles.sectionContainer}>
                <ThemedText style={styles.sectionLabel}>EVENTO</ThemedText>
                {events.length === 0 ? (
                    <ThemedText style={styles.emptyText}>Sin eventos activos.</ThemedText>
                ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
                        {events.map(event => (
                            <TouchableOpacity
                                key={event.id}
                                style={[styles.eventChip, selectedEventId === event.id && styles.eventChipActive]}
                                onPress={() => setSelectedEventId(event.id)}
                            >
                                <ThemedText style={[styles.eventChipText, selectedEventId === event.id && styles.eventChipTextActive]}>
                                    {event.name}
                                </ThemedText>
                                {event.date ? (
                                    <ThemedText style={[styles.eventChipDate, selectedEventId === event.id && { color: 'rgba(0,0,0,0.6)' }]}>
                                        {new Date(event.date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                                    </ThemedText>
                                ) : null}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </View>

            {/* Current lineup */}
            {selectedEventId && (
                <View style={styles.lineupSection}>
                    <ThemedText style={styles.sectionLabel}>
                        LINEUP ACTUAL {lineupLoading ? '' : `(${lineup.length})`}
                    </ThemedText>
                    {lineupLoading ? (
                        <ActivityIndicator color={ZyncTheme.colors.primary} size="small" style={{ marginVertical: 8 }} />
                    ) : lineup.length === 0 ? (
                        <ThemedText style={styles.emptyText}>Sin DJs en el lineup todavía.</ThemedText>
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
                            {lineup.map(entry => (
                                <View key={entry.id} style={styles.lineupChip}>
                                    {entry.logoUrl ? (
                                        <Image source={{ uri: entry.logoUrl }} style={styles.lineupAvatar} contentFit="cover" />
                                    ) : (
                                        <View style={[styles.lineupAvatar, styles.lineupAvatarFallback]}>
                                            <Ionicons name="musical-notes" size={12} color={ZyncTheme.colors.primary} />
                                        </View>
                                    )}
                                    <ThemedText style={styles.lineupChipText} numberOfLines={1}>{entry.artistName}</ThemedText>
                                </View>
                            ))}
                        </ScrollView>
                    )}
                </View>
            )}

            {/* DJ list */}
            <View style={styles.djListContainer}>
                <ThemedText style={styles.sectionLabel}>DJs DISPONIBLES</ThemedText>
                <FlatList
                    data={djs}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => {
                        const inLineup = lineupDjIds.has(item.id);
                        const isAdding = addingDjId === item.id;
                        return (
                            <View style={styles.djCard}>
                                {item.logoUrl ? (
                                    <Image source={{ uri: item.logoUrl }} style={styles.djAvatar} contentFit="cover" />
                                ) : (
                                    <View style={[styles.djAvatar, styles.djAvatarFallback]}>
                                        <Ionicons name="musical-notes-outline" size={20} color={ZyncTheme.colors.textSecondary} />
                                    </View>
                                )}
                                <View style={styles.djInfo}>
                                    <ThemedText style={styles.djName}>{item.artistName}</ThemedText>
                                    {item.genres?.length > 0 && (
                                        <ThemedText style={styles.djGenres} numberOfLines={1}>{item.genres.join(' · ')}</ThemedText>
                                    )}
                                </View>
                                <TouchableOpacity
                                    style={[
                                        styles.addButton,
                                        inLineup && styles.addButtonInLineup,
                                        (!selectedEventId || isAdding) && styles.addButtonDisabled,
                                    ]}
                                    onPress={() => handleAddDj(item)}
                                    disabled={!selectedEventId || isAdding || inLineup}
                                >
                                    {isAdding ? (
                                        <ActivityIndicator size="small" color="#000" />
                                    ) : inLineup ? (
                                        <Ionicons name="checkmark" size={18} color={ZyncTheme.colors.primary} />
                                    ) : (
                                        <>
                                            <Ionicons name="add" size={18} color="black" />
                                            <ThemedText style={styles.addButtonText}>Add</ThemedText>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        );
                    }}
                    contentContainerStyle={styles.listPadding}
                    refreshControl={
                        <RefreshControl
                            refreshing={false}
                            onRefresh={() => selectedEventId && fetchLineup(selectedEventId)}
                            tintColor={ZyncTheme.colors.primary}
                        />
                    }
                    ListEmptyComponent={
                        <ThemedText style={styles.emptyText}>No hay DJs disponibles.</ThemedText>
                    }
                />
            </View>
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: ZyncTheme.spacing.m,
        paddingTop: ZyncTheme.spacing.l,
        paddingBottom: ZyncTheme.spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: ZyncTheme.colors.border,
    },
    backButton: { marginRight: 16 },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: 'white' },
    sectionContainer: {
        paddingHorizontal: ZyncTheme.spacing.m,
        paddingTop: ZyncTheme.spacing.m,
        paddingBottom: ZyncTheme.spacing.s,
    },
    lineupSection: {
        paddingHorizontal: ZyncTheme.spacing.m,
        paddingBottom: ZyncTheme.spacing.s,
        borderBottomWidth: 1,
        borderBottomColor: ZyncTheme.colors.border,
    },
    djListContainer: { flex: 1, paddingHorizontal: ZyncTheme.spacing.m, paddingTop: ZyncTheme.spacing.m },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: ZyncTheme.colors.textSecondary,
        letterSpacing: 1.5,
        marginBottom: ZyncTheme.spacing.s,
        textTransform: 'uppercase',
    },
    chipScroll: { gap: ZyncTheme.spacing.s, paddingBottom: ZyncTheme.spacing.s },
    eventChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: ZyncTheme.colors.card,
        borderWidth: 1,
        borderColor: ZyncTheme.colors.border,
    },
    eventChipActive: { backgroundColor: ZyncTheme.colors.primary, borderColor: ZyncTheme.colors.primary },
    eventChipText: { fontSize: 13, color: ZyncTheme.colors.textSecondary, fontWeight: '600' },
    eventChipTextActive: { color: '#000', fontWeight: '700' },
    eventChipDate: { fontSize: 11, color: ZyncTheme.colors.textSecondary, marginTop: 2 },
    lineupChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(204,255,0,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(204,255,0,0.25)',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 6,
        maxWidth: 140,
    },
    lineupAvatar: { width: 22, height: 22, borderRadius: 11 },
    lineupAvatarFallback: { backgroundColor: ZyncTheme.colors.card, alignItems: 'center', justifyContent: 'center' },
    lineupChipText: { fontSize: 12, color: ZyncTheme.colors.primary, fontWeight: '600', flexShrink: 1 },
    djCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: ZyncTheme.colors.card,
        borderRadius: 14,
        marginBottom: ZyncTheme.spacing.s,
        borderWidth: 1,
        borderColor: ZyncTheme.colors.border,
        padding: ZyncTheme.spacing.m,
        gap: ZyncTheme.spacing.m,
    },
    djAvatar: { width: 48, height: 48, borderRadius: 24 },
    djAvatarFallback: {
        backgroundColor: '#1a1a1a',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: ZyncTheme.colors.border,
    },
    djInfo: { flex: 1 },
    djName: { fontSize: 15, fontWeight: '700', color: 'white' },
    djGenres: { fontSize: 12, color: ZyncTheme.colors.textSecondary, marginTop: 2 },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: ZyncTheme.colors.primary,
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        gap: 4,
        minWidth: 70,
        height: 36,
    },
    addButtonInLineup: { backgroundColor: 'transparent', borderWidth: 1, borderColor: ZyncTheme.colors.primary },
    addButtonDisabled: { opacity: 0.35, backgroundColor: ZyncTheme.colors.border },
    addButtonText: { color: 'black', fontWeight: '700', fontSize: 13 },
    listPadding: { paddingBottom: 60 },
    emptyText: { color: ZyncTheme.colors.textSecondary, fontSize: 13, marginVertical: 8 },
});
