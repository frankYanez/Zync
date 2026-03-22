import { CyberCard } from '@/components/CyberCard';
import { NeonButton } from '@/components/NeonButton';
import { NeonInput } from '@/components/NeonInput';
import { ScreenLayout } from '@/components/ScreenLayout';
import { ThemedText } from '@/components/themed-text';
import { useZync } from '@/context/ZyncContext';
import { useAuth } from '@/features/auth/context/AuthContext';
import { DjProfile } from '@/features/dj/domain/dj.types';
import { followDj, getDjs, unfollowDj } from '@/features/dj/services/dj.service';
import { SongRequest, submitSongRequest } from '@/features/music/services/song-request.service';
import { SpotifyTrack, spotifyService } from '@/features/music/services/spotify-service';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';

type Tab = 'beats' | 'djs';

const ALL_GENRES = ['Todos', 'Techno', 'House', 'Tech House', 'Minimal', 'Trance', 'Hip-Hop', 'Reggaeton'];

// ─── BEATS TAB ───────────────────────────────────────────────────────────────

function BeatsTab() {
    const router = useRouter();
    const { user, refreshSession } = useAuth();
    const { currentEstablishment } = useZync();

    const [search, setSearch] = useState('');
    const [songs, setSongs] = useState<SpotifyTrack[]>([]);
    const [loading, setLoading] = useState(false);
    const [activeRequest, setActiveRequest] = useState<SongRequest | null>(null);
    const [isRequesting, setIsRequesting] = useState(false);

    const liveDj = currentEstablishment?.currentDj?.isLive ? currentEstablishment.currentDj : null;
    const djProfileId = liveDj?.djProfileId ?? null;

    // Debounced Spotify search
    useEffect(() => {
        const id = setTimeout(async () => {
            if (search.length >= 2) {
                setLoading(true);
                const results = await spotifyService.searchTracks(search);
                setSongs(results);
                setLoading(false);
            } else {
                setSongs([]);
            }
        }, 500);
        return () => clearTimeout(id);
    }, [search]);

    const handleRequest = async (track: SpotifyTrack) => {
        if (activeRequest) {
            Alert.alert('Pedido activo', 'Ya tenés un pedido en curso. Esperá a que el DJ lo toque.');
            return;
        }
        if (!djProfileId) {
            Alert.alert('Sin DJ', 'No hay un DJ activo en este momento.');
            return;
        }

        setIsRequesting(true);
        try {
            const req = await submitSongRequest(djProfileId, track);
            setActiveRequest(req);
            await refreshSession();
            setSearch('');
        } catch (error: any) {
            const msg = error?.response?.data?.message;
            Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg || 'No se pudo enviar el pedido.');
        } finally {
            setIsRequesting(false);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            {/* No DJ banner */}
            {!liveDj && (
                <View style={styles.noDjBanner}>
                    <Ionicons name="information-circle-outline" size={16} color={ZyncTheme.colors.textSecondary} />
                    <ThemedText style={styles.noDjText}>
                        {currentEstablishment
                            ? 'No hay DJ en vivo en este momento'
                            : 'Escaneá un QR para unirte a un evento'}
                    </ThemedText>
                </View>
            )}

            {/* Active request */}
            {activeRequest && (
                <View style={styles.section}>
                    <ThemedText style={styles.sectionLabel}>PLAYING NEXT</ThemedText>
                    <CyberCard style={styles.activeRequestCard}>
                        <View style={styles.trackRow}>
                            <View style={styles.coverArt}>
                                <Ionicons name="musical-note" size={24} color={ZyncTheme.colors.primary} />
                            </View>
                            <View style={styles.trackInfo}>
                                <ThemedText style={styles.trackTitle} numberOfLines={1}>{activeRequest.trackName}</ThemedText>
                                <ThemedText style={[styles.trackArtist, { color: ZyncTheme.colors.primary }]}>
                                    Pedido confirmado ✓
                                </ThemedText>
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => setActiveRequest(null)} style={styles.dismissBtn}>
                            <Ionicons name="close" size={18} color={ZyncTheme.colors.textSecondary} />
                        </TouchableOpacity>
                    </CyberCard>
                </View>
            )}

            {/* Search */}
            <View style={styles.section}>
                <NeonInput
                    placeholder="Buscar canción o artista..."
                    icon="search"
                    value={search}
                    onChangeText={setSearch}
                    containerStyle={{ marginBottom: 0 }}
                />
            </View>

            {loading || isRequesting ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={ZyncTheme.colors.primary} />
                    {isRequesting && (
                        <ThemedText style={styles.loadingText}>Enviando pedido...</ThemedText>
                    )}
                </View>
            ) : (
                <FlatList
                    data={songs}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <TrackCard
                            track={item}
                            isPending={!!activeRequest}
                            onRequest={() => handleRequest(item)}
                        />
                    )}
                    contentContainerStyle={styles.trackList}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.centered}>
                            {search.length > 0 ? (
                                <ThemedText style={styles.emptyText}>Sin resultados</ThemedText>
                            ) : (
                                <>
                                    <Ionicons name="musical-notes-outline" size={48} color={ZyncTheme.colors.textSecondary} style={{ opacity: 0.4 }} />
                                    <ThemedText style={styles.emptyText}>Buscá tu música favorita</ThemedText>
                                </>
                            )}
                        </View>
                    }
                />
            )}
        </View>
    );
}

function TrackCard({ track, isPending, onRequest }: { track: SpotifyTrack; isPending: boolean; onRequest: () => void }) {
    return (
        <CyberCard style={[styles.trackCard, isPending && { opacity: 0.55 }]}>
            <View style={styles.trackRow}>
                <View style={styles.coverArt}>
                    {track.album.images[0] ? (
                        <Image
                            source={{ uri: track.album.images[0].url }}
                            style={{ width: '100%', height: '100%', borderRadius: 4 }}
                            contentFit="cover"
                        />
                    ) : (
                        <Ionicons name="musical-note" size={20} color={ZyncTheme.colors.textSecondary} />
                    )}
                </View>
                <View style={styles.trackInfo}>
                    <ThemedText style={styles.trackTitle} numberOfLines={1}>{track.name}</ThemedText>
                    <ThemedText style={styles.trackArtist} numberOfLines={1}>
                        {track.artists.map(a => a.name).join(', ')}
                    </ThemedText>
                </View>
            </View>
            <NeonButton
                title={isPending ? 'PENDIENTE' : 'PEDIR'}
                onPress={onRequest}
                disabled={isPending}
                textStyle={{ fontSize: 11, fontWeight: 'bold' }}
                style={[styles.requestBtn, isPending && { borderColor: '#444', backgroundColor: 'transparent' }]}
            />
        </CyberCard>
    );
}

// ─── DJS TAB ──────────────────────────────────────────────────────────────────

function DjsTab() {
    const router = useRouter();
    const [djs, setDjs] = useState<DjProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [genre, setGenre] = useState('Todos');
    const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());
    const [togglingId, setTogglingId] = useState<string | null>(null);

    const load = useCallback(async (g?: string) => {
        setLoading(true);
        try {
            const data = await getDjs(g && g !== 'Todos' ? g : undefined);
            setDjs(data);
        } catch (e) {
            console.error('Failed to load DJs', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(genre); }, [genre]);

    const handleFollow = async (dj: DjProfile) => {
        setTogglingId(dj.id);
        const isFollowed = followedIds.has(dj.id);
        // Optimistic update
        setFollowedIds(prev => {
            const next = new Set(prev);
            isFollowed ? next.delete(dj.id) : next.add(dj.id);
            return next;
        });
        try {
            if (isFollowed) {
                await unfollowDj(dj.id);
            } else {
                await followDj(dj.id);
            }
        } catch (e) {
            // Revert on error
            setFollowedIds(prev => {
                const next = new Set(prev);
                isFollowed ? next.add(dj.id) : next.delete(dj.id);
                return next;
            });
        } finally {
            setTogglingId(null);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            {/* Genre filter */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.genreScroll}
            >
                {ALL_GENRES.map(g => (
                    <TouchableOpacity
                        key={g}
                        style={[styles.genreChip, genre === g && styles.genreChipActive]}
                        onPress={() => setGenre(g)}
                    >
                        <ThemedText style={[styles.genreChipText, genre === g && styles.genreChipTextActive]}>
                            {g}
                        </ThemedText>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={ZyncTheme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={djs}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <DjCard
                            dj={item}
                            isFollowed={followedIds.has(item.id)}
                            isToggling={togglingId === item.id}
                            onFollow={() => handleFollow(item)}
                            onPress={() => router.push(`/dj/${item.id}` as any)}
                        />
                    )}
                    contentContainerStyle={styles.djList}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.centered}>
                            <Ionicons name="musical-notes-outline" size={48} color={ZyncTheme.colors.textSecondary} style={{ opacity: 0.4 }} />
                            <ThemedText style={styles.emptyText}>Sin DJs para este género</ThemedText>
                        </View>
                    }
                />
            )}
        </View>
    );
}

function DjCard({
    dj,
    isFollowed,
    isToggling,
    onFollow,
    onPress,
}: {
    dj: DjProfile;
    isFollowed: boolean;
    isToggling: boolean;
    onFollow: () => void;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
            <CyberCard style={styles.djCard}>
                {/* Avatar */}
                {dj.logoUrl ? (
                    <Image source={{ uri: dj.logoUrl }} style={styles.djAvatar} contentFit="cover" />
                ) : (
                    <View style={[styles.djAvatar, styles.djAvatarFallback]}>
                        <Ionicons name="musical-notes" size={22} color="#000" />
                    </View>
                )}

                {/* Info */}
                <View style={styles.djInfo}>
                    <ThemedText style={styles.djName}>{dj.artistName}</ThemedText>
                    {dj.city && (
                        <ThemedText style={styles.djCity}>
                            <Ionicons name="location-outline" size={11} /> {dj.city}
                        </ThemedText>
                    )}
                    {dj.genres?.length > 0 && (
                        <View style={styles.djGenreRow}>
                            {dj.genres.slice(0, 3).map(g => (
                                <View key={g} style={styles.genreTag}>
                                    <ThemedText style={styles.genreTagText}>{g}</ThemedText>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                {/* Follow button */}
                <TouchableOpacity
                    style={[styles.followBtn, isFollowed && styles.followBtnActive]}
                    onPress={onFollow}
                    disabled={isToggling}
                >
                    {isToggling ? (
                        <ActivityIndicator size="small" color={isFollowed ? '#000' : ZyncTheme.colors.primary} />
                    ) : (
                        <ThemedText style={[styles.followBtnText, isFollowed && { color: '#000' }]}>
                            {isFollowed ? 'Siguiendo' : 'Seguir'}
                        </ThemedText>
                    )}
                </TouchableOpacity>
            </CyberCard>
        </TouchableOpacity>
    );
}

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────

export default function BeatsScreen() {
    const [tab, setTab] = useState<Tab>('beats');

    const pulseAnim = useSharedValue(0.1);
    useEffect(() => {
        pulseAnim.value = withRepeat(withTiming(0.2, { duration: 2000 }), -1, true);
    }, []);
    const animatedBgStyle = useAnimatedStyle(() => ({
        opacity: pulseAnim.value,
        transform: [{ scale: interpolate(pulseAnim.value, [0.1, 0.2], [1, 1.1]) }],
    }));

    return (
        <ScreenLayout noPadding>
            {/* Pulsing BG */}
            <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
                <View style={styles.bgContainer}>
                    <Animated.View style={[styles.pulseCircle, animatedBgStyle]}>
                        <Ionicons name="musical-notes" size={300} color={ZyncTheme.colors.primary} />
                    </Animated.View>
                </View>
            </View>

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Ionicons name="stats-chart" size={22} color={ZyncTheme.colors.primary} />
                    <ThemedText style={styles.headerTitle}>ZYNC BEATS</ThemedText>
                </View>
                <View style={styles.headerDot} />
            </View>

            {/* Tabs */}
            <View style={styles.tabRow}>
                <TouchableOpacity
                    style={[styles.tab, tab === 'beats' && styles.tabActive]}
                    onPress={() => setTab('beats')}
                >
                    <Ionicons name="musical-note" size={16} color={tab === 'beats' ? ZyncTheme.colors.primary : ZyncTheme.colors.textSecondary} />
                    <ThemedText style={[styles.tabText, tab === 'beats' && styles.tabTextActive]}>PEDIR</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, tab === 'djs' && styles.tabActive]}
                    onPress={() => setTab('djs')}
                >
                    <Ionicons name="people" size={16} color={tab === 'djs' ? ZyncTheme.colors.primary : ZyncTheme.colors.textSecondary} />
                    <ThemedText style={[styles.tabText, tab === 'djs' && styles.tabTextActive]}>DJS</ThemedText>
                </TouchableOpacity>
            </View>

            {tab === 'beats' ? <BeatsTab /> : <DjsTab />}
        </ScreenLayout>
    );
}

// ─── STYLES ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    bgContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', opacity: 0.1 },
    pulseCircle: { alignItems: 'center', justifyContent: 'center' },

    header: {
        paddingHorizontal: ZyncTheme.spacing.m,
        paddingVertical: ZyncTheme.spacing.m,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: ZyncTheme.colors.border,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', letterSpacing: 2 },
    headerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: ZyncTheme.colors.primary },

    tabRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: ZyncTheme.colors.border,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 12,
    },
    tabActive: { borderBottomWidth: 2, borderBottomColor: ZyncTheme.colors.primary },
    tabText: { fontSize: 13, fontWeight: '700', color: ZyncTheme.colors.textSecondary, letterSpacing: 1 },
    tabTextActive: { color: ZyncTheme.colors.primary },

    // Beats tab
    noDjBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: ZyncTheme.colors.card,
        marginHorizontal: ZyncTheme.spacing.m,
        marginTop: ZyncTheme.spacing.m,
        padding: ZyncTheme.spacing.m,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: ZyncTheme.colors.border,
    },
    noDjText: { fontSize: 13, color: ZyncTheme.colors.textSecondary, flex: 1 },
    section: { paddingHorizontal: ZyncTheme.spacing.m, paddingTop: ZyncTheme.spacing.m },
    sectionLabel: {
        fontSize: 11,
        color: ZyncTheme.colors.primary,
        fontWeight: '700',
        letterSpacing: 1.5,
        marginBottom: ZyncTheme.spacing.s,
    },
    activeRequestCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: ZyncTheme.spacing.s,
        borderColor: ZyncTheme.colors.primary,
        borderWidth: 1,
        backgroundColor: 'rgba(204,255,0,0.04)',
    },
    dismissBtn: { padding: 6 },
    trackList: { padding: ZyncTheme.spacing.m, gap: ZyncTheme.spacing.m, paddingBottom: 100 },
    trackCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: ZyncTheme.spacing.s,
    },
    trackRow: { flexDirection: 'row', alignItems: 'center', gap: ZyncTheme.spacing.m, flex: 1, marginRight: 8 },
    coverArt: {
        width: 48,
        height: 48,
        backgroundColor: '#222',
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    trackInfo: { flex: 1 },
    trackTitle: { fontSize: 14, fontWeight: 'bold', color: 'white' },
    trackArtist: { fontSize: 12, color: ZyncTheme.colors.textSecondary, marginTop: 2 },
    requestBtn: { height: 34, paddingHorizontal: ZyncTheme.spacing.m, minWidth: 80 },

    // DJs tab
    genreScroll: { paddingHorizontal: ZyncTheme.spacing.m, paddingVertical: ZyncTheme.spacing.m, gap: ZyncTheme.spacing.s },
    genreChip: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        backgroundColor: ZyncTheme.colors.card,
        borderWidth: 1,
        borderColor: ZyncTheme.colors.border,
    },
    genreChipActive: { backgroundColor: ZyncTheme.colors.primary, borderColor: ZyncTheme.colors.primary },
    genreChipText: { fontSize: 13, color: ZyncTheme.colors.textSecondary, fontWeight: '600' },
    genreChipTextActive: { color: '#000' },
    djList: { paddingHorizontal: ZyncTheme.spacing.m, gap: ZyncTheme.spacing.s, paddingBottom: 100 },
    djCard: { flexDirection: 'row', alignItems: 'center', padding: ZyncTheme.spacing.m, gap: ZyncTheme.spacing.m },
    djAvatar: { width: 52, height: 52, borderRadius: 26 },
    djAvatarFallback: { backgroundColor: ZyncTheme.colors.primary, justifyContent: 'center', alignItems: 'center' },
    djInfo: { flex: 1, gap: 3 },
    djName: { fontSize: 15, fontWeight: '700', color: 'white' },
    djCity: { fontSize: 12, color: ZyncTheme.colors.textSecondary },
    djGenreRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 2 },
    genreTag: {
        paddingHorizontal: 7,
        paddingVertical: 2,
        backgroundColor: 'rgba(168,85,247,0.15)',
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(168,85,247,0.4)',
    },
    genreTagText: { fontSize: 10, color: '#A855F7', fontWeight: '600' },
    followBtn: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: ZyncTheme.colors.primary,
        minWidth: 80,
        alignItems: 'center',
    },
    followBtnActive: { backgroundColor: ZyncTheme.colors.primary },
    followBtnText: { fontSize: 13, fontWeight: '700', color: ZyncTheme.colors.primary },

    // Shared
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 48, gap: 12 },
    emptyText: { color: ZyncTheme.colors.textSecondary, fontSize: 15 },
    loadingText: { marginTop: 10, color: ZyncTheme.colors.primary, fontSize: 13, letterSpacing: 1 },
});
