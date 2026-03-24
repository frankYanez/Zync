import { CyberCard } from '@/components/CyberCard';
import { NeonButton } from '@/components/NeonButton';
import { ScreenLayout } from '@/components/ScreenLayout';
import { ThemedText } from '@/components/themed-text';
import { Event, LineupEntry, deleteEvent, endEvent, getEventById, getEventLineup } from '@/features/dashboard/services/event.service';
import { DjProfile, PromoCode } from '@/features/dj/domain/dj.types';
import { addDjToLineup, createOrganizerPromoCode, getDjs, getEventPromoCodes } from '@/features/dj/services/dj.service';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, ScrollView, Share, StyleSheet, TouchableOpacity, View } from 'react-native';

type Tab = 'info' | 'lineup' | 'promos';

export default function OrganizerEventDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const [event, setEvent] = useState<Event | null>(null);
    const [lineup, setLineup] = useState<LineupEntry[]>([]);
    const [allDjs, setAllDjs] = useState<DjProfile[]>([]);
    const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
    const [tab, setTab] = useState<Tab>('info');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [generatingForDj, setGeneratingForDj] = useState<string | null>(null);

    const load = useCallback(async () => {
        if (!id) return;
        try {
            const [ev, lp, djs] = await Promise.all([
                getEventById(id),
                getEventLineup(id),
                getDjs(),
            ]);
            setEvent(ev);
            setLineup(lp);
            setAllDjs(djs);
            // Load promo codes for each DJ in the lineup in parallel
            try {
                const perDj = await Promise.all(
                    lp.map(entry => getEventPromoCodes(id, entry.djProfileId).catch(() => [] as PromoCode[]))
                );
                setPromoCodes(perDj.flat());
            } catch { /* ignore */ }
        } catch (e) {
            console.error('Failed to load event detail', e);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { load(); }, [load]);

    const handleAddDj = async (djId: string) => {
        if (!id) return;
        setActionLoading(true);
        try {
            await addDjToLineup(djId, id);
            const lp = await getEventLineup(id);
            setLineup(lp);
            Alert.alert('¡Listo!', 'DJ agregado al lineup.');
        } catch (e: any) {
            const msg = e?.response?.data?.message;
            Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg || 'No se pudo agregar el DJ.');
        } finally {
            setActionLoading(false);
        }
    };

    const handleEnd = () => {
        Alert.alert(
            'Finalizar evento',
            '¿Estás seguro? Esta acción terminará el evento y limpiará el chat grupal.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Finalizar',
                    style: 'destructive',
                    onPress: async () => {
                        if (!id) return;
                        setActionLoading(true);
                        try {
                            await endEvent(id);
                            router.back();
                        } catch (e: any) {
                            const msg = e?.response?.data?.message;
                            Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg || 'No se pudo finalizar.');
                        } finally {
                            setActionLoading(false);
                        }
                    },
                },
            ],
        );
    };

    const handleDelete = () => {
        Alert.alert(
            'Eliminar evento',
            '¿Seguro que querés eliminar este evento? Esta acción no se puede deshacer.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        if (!id) return;
                        setActionLoading(true);
                        try {
                            await deleteEvent(id);
                            router.back();
                        } catch (e: any) {
                            const msg = e?.response?.data?.message;
                            Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg || 'No se pudo eliminar.');
                        } finally {
                            setActionLoading(false);
                        }
                    },
                },
            ],
        );
    };

    const handleGeneratePromo = async (djProfileId: string, artistName: string) => {
        if (!id) return;
        setGeneratingForDj(djProfileId);
        try {
            const code = await createOrganizerPromoCode(id, djProfileId);
            setPromoCodes(prev => [code, ...prev]);
            Alert.alert('¡Listo!', `Código "${code.code}" generado para ${artistName}`);
        } catch (e: any) {
            const msg = e?.response?.data?.message;
            Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg || 'No se pudo generar el código.');
        } finally {
            setGeneratingForDj(null);
        }
    };

    if (loading) {
        return (
            <ScreenLayout style={styles.centered} noPadding>
                <ActivityIndicator size="large" color={ZyncTheme.colors.primary} />
            </ScreenLayout>
        );
    }

    if (!event) {
        return (
            <ScreenLayout style={styles.centered} noPadding>
                <ThemedText style={{ color: ZyncTheme.colors.textSecondary }}>Evento no encontrado</ThemedText>
            </ScreenLayout>
        );
    }

    const start = new Date(event.startsAt);
    const end = new Date(event.endsAt);
    const lineupIds = new Set(lineup.map(l => l.djProfileId));
    const availableDjs = allDjs.filter(d => !lineupIds.has(d.id));

    return (
        <ScreenLayout style={styles.container} noPadding>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={ZyncTheme.colors.text} />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle} numberOfLines={1}>{event.name}</ThemedText>
                <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
                    <Ionicons name="trash-outline" size={20} color={ZyncTheme.colors.error} />
                </TouchableOpacity>
            </View>

            {/* Banner */}
            {event.imageUrl ? (
                <Image source={{ uri: event.imageUrl }} style={styles.banner} contentFit="cover" />
            ) : (
                <View style={[styles.banner, styles.bannerFallback]}>
                    <Ionicons name="musical-notes" size={48} color={ZyncTheme.colors.textSecondary} />
                </View>
            )}

            {/* Active badge */}
            <View style={styles.statusRow}>
                <View style={[styles.statusBadge, { backgroundColor: event.isActive ? '#22C55E22' : ZyncTheme.colors.card, borderColor: event.isActive ? '#22C55E' : ZyncTheme.colors.border }]}>
                    <View style={[styles.dot, { backgroundColor: event.isActive ? '#22C55E' : ZyncTheme.colors.textSecondary }]} />
                    <ThemedText style={[styles.statusText, { color: event.isActive ? '#22C55E' : ZyncTheme.colors.textSecondary }]}>
                        {event.isActive ? 'En vivo' : 'Inactivo'}
                    </ThemedText>
                </View>
                {event.isActive && (
                    <NeonButton
                        title={actionLoading ? '...' : 'Finalizar evento'}
                        variant="outline"
                        onPress={handleEnd}
                        disabled={actionLoading}
                        style={styles.endBtn}
                        textStyle={{ fontSize: 13 }}
                    />
                )}
            </View>

            {/* Tabs */}
            <View style={styles.tabRow}>
                {([
                    { key: 'info', label: 'Info' },
                    { key: 'lineup', label: `Lineup (${lineup.length})` },
                    { key: 'promos', label: `Promos (${promoCodes.length})` },
                ] as { key: Tab; label: string }[]).map(({ key, label }) => (
                    <TouchableOpacity key={key} style={[styles.tabBtn, tab === key && styles.tabBtnActive]} onPress={() => setTab(key)}>
                        <ThemedText style={[styles.tabText, tab === key && styles.tabTextActive]}>
                            {label}
                        </ThemedText>
                    </TouchableOpacity>
                ))}
            </View>

            {tab === 'info' ? (
                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                    <CyberCard style={styles.infoCard}>
                        <InfoRow icon="business-outline" label="Venue" value={event.venue?.name ?? '—'} />
                        <InfoRow icon="location-outline" label="Dirección" value={event.venue?.address ?? '—'} />
                        <InfoRow
                            icon="calendar-outline"
                            label="Inicio"
                            value={start.toLocaleString('es-AR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        />
                        <InfoRow
                            icon="calendar-outline"
                            label="Fin"
                            value={end.toLocaleString('es-AR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        />
                        {event.capacity && <InfoRow icon="people-outline" label="Capacidad" value={String(event.capacity)} />}
                    </CyberCard>
                    <View style={{ height: 60 }} />
                </ScrollView>
            ) : (
                <View style={styles.lineupContainer}>
                    {/* Current lineup */}
                    {lineup.length > 0 && (
                        <>
                            <ThemedText style={styles.subSection}>EN EL LINEUP</ThemedText>
                            {lineup.map(entry => (
                                <View key={entry.id} style={styles.djRow}>
                                    {entry.logoUrl ? (
                                        <Image source={{ uri: entry.logoUrl }} style={styles.djAvatar} contentFit="cover" />
                                    ) : (
                                        <View style={[styles.djAvatar, styles.djAvatarFallback]}>
                                            <Ionicons name="musical-notes" size={16} color="#000" />
                                        </View>
                                    )}
                                    <View style={styles.djInfo}>
                                        <ThemedText style={styles.djName}>{entry.artistName}</ThemedText>
                                        {(entry.startTime || entry.endTime) && (
                                            <ThemedText style={styles.djTime}>
                                                {entry.startTime} – {entry.endTime}
                                            </ThemedText>
                                        )}
                                    </View>
                                    <View style={styles.inLineupBadge}>
                                        <ThemedText style={styles.inLineupText}>En lineup</ThemedText>
                                    </View>
                                </View>
                            ))}
                        </>
                    )}

                    {/* Add DJs */}
                    <ThemedText style={styles.subSection}>AGREGAR DJ</ThemedText>
                    <FlatList
                        data={availableDjs}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <View style={styles.djRow}>
                                {item.logoUrl ? (
                                    <Image source={{ uri: item.logoUrl }} style={styles.djAvatar} contentFit="cover" />
                                ) : (
                                    <View style={[styles.djAvatar, styles.djAvatarFallback]}>
                                        <Ionicons name="musical-notes" size={16} color="#000" />
                                    </View>
                                )}
                                <View style={styles.djInfo}>
                                    <ThemedText style={styles.djName}>{item.artistName}</ThemedText>
                                    <ThemedText style={styles.djGenres} numberOfLines={1}>{item.genres?.join(', ')}</ThemedText>
                                </View>
                                <TouchableOpacity
                                    style={[styles.addBtn, actionLoading && { opacity: 0.5 }]}
                                    onPress={() => handleAddDj(item.id)}
                                    disabled={actionLoading}
                                >
                                    <Ionicons name="add" size={18} color="#000" />
                                </TouchableOpacity>
                            </View>
                        )}
                        contentContainerStyle={styles.djList}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <ThemedText style={styles.emptyDjs}>
                                {lineup.length > 0 ? 'Todos los DJs ya están en el lineup.' : 'No hay DJs disponibles.'}
                            </ThemedText>
                        }
                    />
                </View>
            )}

            {tab === 'promos' && (
                <View style={styles.lineupContainer}>
                    {lineup.length === 0 ? (
                        <View style={styles.emptyPromosContainer}>
                            <Ionicons name="pricetag-outline" size={48} color={ZyncTheme.colors.textSecondary} />
                            <ThemedText style={styles.emptyDjs}>
                                Agregá DJs al lineup primero para generar códigos.
                            </ThemedText>
                        </View>
                    ) : (
                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.djList}>
                            {lineup.map(entry => {
                                const djCodes = promoCodes.filter(p => p.djProfileId === entry.djProfileId);
                                const isGenerating = generatingForDj === entry.djProfileId;
                                return (
                                    <View key={entry.id} style={styles.promoDjBlock}>
                                        {/* DJ header */}
                                        <View style={styles.promoDjHeader}>
                                            {entry.logoUrl ? (
                                                <Image source={{ uri: entry.logoUrl }} style={styles.djAvatar} contentFit="cover" />
                                            ) : (
                                                <View style={[styles.djAvatar, styles.djAvatarFallback]}>
                                                    <Ionicons name="musical-notes" size={16} color="#000" />
                                                </View>
                                            )}
                                            <ThemedText style={styles.djName}>{entry.artistName}</ThemedText>
                                            <TouchableOpacity
                                                style={[styles.addBtn, (isGenerating || !!generatingForDj) && { opacity: 0.5 }]}
                                                onPress={() => handleGeneratePromo(entry.djProfileId, entry.artistName)}
                                                disabled={isGenerating || !!generatingForDj}
                                            >
                                                {isGenerating
                                                    ? <ActivityIndicator size="small" color="#000" />
                                                    : <Ionicons name="add" size={18} color="#000" />}
                                            </TouchableOpacity>
                                        </View>

                                        {/* Promo codes for this DJ */}
                                        {djCodes.length === 0 ? (
                                            <ThemedText style={styles.noCodesText}>Sin códigos generados</ThemedText>
                                        ) : (
                                            djCodes.map(code => (
                                                <View key={code.id} style={styles.promoCodeRow}>
                                                    <View style={styles.promoCodeLeft}>
                                                        <ThemedText style={styles.promoCodeText}>{code.code}</ThemedText>
                                                        <ThemedText style={styles.promoCodeDate}>
                                                            {new Date(code.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })} · {code.usedCount} usos
                                                        </ThemedText>
                                                    </View>
                                                    <TouchableOpacity
                                                        style={styles.shareCodeBtn}
                                                        onPress={() => Share.share({ message: `Usá el código ${code.code} en Zync para obtener descuentos 🎉` })}
                                                    >
                                                        <Ionicons name="share-outline" size={16} color={ZyncTheme.colors.primary} />
                                                    </TouchableOpacity>
                                                </View>
                                            ))
                                        )}
                                    </View>
                                );
                            })}
                        </ScrollView>
                    )}
                </View>
            )}
        </ScreenLayout>
    );
}

function InfoRow({ icon, label, value }: { icon: any; label: string; value: string }) {
    return (
        <View style={infoStyles.row}>
            <Ionicons name={icon} size={16} color={ZyncTheme.colors.textSecondary} style={{ width: 20 }} />
            <ThemedText style={infoStyles.label}>{label}</ThemedText>
            <ThemedText style={infoStyles.value} numberOfLines={2}>{value}</ThemedText>
        </View>
    );
}

const infoStyles = StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingVertical: 6 },
    label: { fontSize: 13, color: ZyncTheme.colors.textSecondary, width: 72 },
    value: { fontSize: 13, color: 'white', flex: 1 },
});

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: ZyncTheme.spacing.m,
        paddingTop: ZyncTheme.spacing.l,
        paddingBottom: ZyncTheme.spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.08)',
    },
    backBtn: { marginRight: 12 },
    headerTitle: { flex: 1, fontSize: 18, fontWeight: 'bold', color: 'white' },
    deleteBtn: { padding: 4 },
    banner: { width: '100%', height: 160 },
    bannerFallback: { backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: ZyncTheme.spacing.m,
        paddingVertical: ZyncTheme.spacing.s,
    },
    statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4 },
    dot: { width: 7, height: 7, borderRadius: 4 },
    statusText: { fontSize: 12, fontWeight: '600' },
    endBtn: { paddingHorizontal: 16, height: 34 },
    tabRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: ZyncTheme.colors.border,
        marginHorizontal: ZyncTheme.spacing.m,
    },
    tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center' },
    tabBtnActive: { borderBottomWidth: 2, borderBottomColor: ZyncTheme.colors.primary },
    tabText: { fontSize: 14, color: ZyncTheme.colors.textSecondary },
    tabTextActive: { color: ZyncTheme.colors.primary, fontWeight: '700' },
    scroll: { padding: ZyncTheme.spacing.m },
    infoCard: { padding: ZyncTheme.spacing.m, gap: 2 },
    lineupContainer: { flex: 1, paddingHorizontal: ZyncTheme.spacing.m },
    subSection: {
        fontSize: 11,
        fontWeight: '700',
        color: ZyncTheme.colors.textSecondary,
        letterSpacing: 1,
        marginTop: ZyncTheme.spacing.m,
        marginBottom: ZyncTheme.spacing.s,
    },
    djList: { paddingBottom: 60 },
    djRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: ZyncTheme.spacing.s,
        borderBottomWidth: 1,
        borderBottomColor: ZyncTheme.colors.border,
        gap: ZyncTheme.spacing.s,
    },
    djAvatar: { width: 40, height: 40, borderRadius: 20 },
    djAvatarFallback: { backgroundColor: ZyncTheme.colors.primary, justifyContent: 'center', alignItems: 'center' },
    djInfo: { flex: 1 },
    djName: { fontSize: 14, fontWeight: '600', color: 'white' },
    djGenres: { fontSize: 12, color: ZyncTheme.colors.textSecondary },
    djTime: { fontSize: 12, color: ZyncTheme.colors.textSecondary },
    inLineupBadge: {
        backgroundColor: 'rgba(204,255,0,0.1)',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderWidth: 1,
        borderColor: ZyncTheme.colors.primary,
    },
    inLineupText: { fontSize: 11, color: ZyncTheme.colors.primary, fontWeight: '600' },
    addBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: ZyncTheme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyDjs: { color: ZyncTheme.colors.textSecondary, textAlign: 'center', paddingVertical: 24, fontSize: 14 },
    emptyPromosContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 12 },
    promoDjBlock: {
        borderBottomWidth: 1,
        borderBottomColor: ZyncTheme.colors.border,
        paddingBottom: ZyncTheme.spacing.m,
        marginBottom: ZyncTheme.spacing.m,
    },
    promoDjHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: ZyncTheme.spacing.s,
        marginBottom: ZyncTheme.spacing.s,
    },
    promoCodeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: ZyncTheme.colors.card,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: ZyncTheme.colors.border,
        padding: ZyncTheme.spacing.m,
        marginTop: ZyncTheme.spacing.s,
    },
    promoCodeLeft: { flex: 1 },
    promoCodeText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: ZyncTheme.colors.primary,
        letterSpacing: 1.5,
    },
    promoCodeDate: { fontSize: 11, color: ZyncTheme.colors.textSecondary, marginTop: 2 },
    shareCodeBtn: {
        padding: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: ZyncTheme.colors.primary,
    },
    noCodesText: {
        fontSize: 12,
        color: ZyncTheme.colors.textSecondary,
        fontStyle: 'italic',
        paddingLeft: 48,
        paddingTop: 4,
    },
});
