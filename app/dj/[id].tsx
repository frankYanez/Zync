import { CollapsingProfileHeader } from '@/components/CollapsingProfileHeader';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/features/auth/context/AuthContext';
import { DjProfile, DjReviewsResponse, Gig } from '@/features/dj/domain/dj.types';
import {
    followDj,
    getDjById,
    getDjGigs,
    getDjReviews,
    unfollowDj,
} from '@/features/dj/services/dj.service';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
    Platform,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

type ActiveTab = 'gigs' | 'reviews';

export default function PublicDjProfileScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { user } = useAuth();
    const router = useRouter();

    const [dj, setDj] = useState<DjProfile | null>(null);
    const [gigs, setGigs] = useState<Gig[]>([]);
    const [reviewsData, setReviewsData] = useState<DjReviewsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<ActiveTab>('gigs');

    useEffect(() => {
        if (!id) return;
        Promise.all([getDjById(id), getDjGigs(id), getDjReviews(id)])
            .then(([profile, gigList, reviews]) => {
                setDj(profile);
                setIsFollowing(profile?.isFollowing ?? false);
                setGigs(gigList);
                setReviewsData(reviews);
            })
            .catch((err) => console.error('Error fetching DJ data:', err))
            .finally(() => setIsLoading(false));
    }, [id]);

    const handleFollowToggle = async () => {
        if (!user) {
            Alert.alert('Iniciá sesión', 'Necesitás una cuenta para seguir a este DJ.', [
                { text: 'Cancelar' },
                { text: 'Iniciar sesión', onPress: () => router.push('/(auth)') },
            ]);
            return;
        }
        if (!id) return;
        setIsActionLoading(true);
        try {
            if (isFollowing) {
                await unfollowDj(id);
                setIsFollowing(false);
            } else {
                await followDj(id);
                setIsFollowing(true);
            }
        } catch {
            Alert.alert('Error', 'No se pudo completar la acción. Intentá de nuevo.');
        } finally {
            setIsActionLoading(false);
        }
    };

    const openLink = async (url: string | null | undefined) => {
        if (!url) return;
        if (await Linking.canOpenURL(url)) Linking.openURL(url);
    };

    const renderStars = (score: number, size = 14) =>
        Array.from({ length: 5 }, (_, i) => {
            const name =
                i + 1 <= Math.floor(score) ? 'star' : i < score ? 'star-half' : 'star-outline';
            return (
                <Ionicons
                    key={i}
                    name={name as any}
                    size={size}
                    color={i < score ? ZyncTheme.colors.primary : '#383838'}
                />
            );
        });

    if (isLoading) {
        return (
            <View style={styles.loaderContainer}>
                <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
                <ActivityIndicator size="large" color={ZyncTheme.colors.primary} />
            </View>
        );
    }

    const avg = reviewsData?.stats.averageScore ?? 0;
    const total = reviewsData?.stats.totalReviews ?? 0;

    const backButton = (
        <TouchableOpacity style={styles.floatingBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
    );

    return (
        <CollapsingProfileHeader
            variant="dj"
            title={dj?.artistName ?? ''}
            avatarUri={dj?.logoUrl}
            bannerUri={dj?.bannerUrl}
            leftAction={backButton}
        >
            {/* Location + price */}
            <View style={styles.metaRow}>
                {dj?.city ? (
                    <View style={styles.metaChip}>
                        <Ionicons name="location-sharp" size={13} color={ZyncTheme.colors.textSecondary} />
                        <ThemedText style={styles.metaText}>{dj.city}</ThemedText>
                    </View>
                ) : null}
                {dj?.pricePerSong ? (
                    <View style={styles.metaChip}>
                        <Ionicons name="musical-note" size={13} color={ZyncTheme.colors.textSecondary} />
                        <ThemedText style={styles.metaText}>${dj.pricePerSong} / canción</ThemedText>
                    </View>
                ) : null}
            </View>

            {/* Genre chips */}
            {dj?.genres && dj.genres.length > 0 && (
                <View style={styles.genresRow}>
                    {dj.genres.map((g) => (
                        <View key={g} style={styles.genreChip}>
                            <ThemedText style={styles.genreText}>{g}</ThemedText>
                        </View>
                    ))}
                </View>
            )}

            {/* Rating */}
            {total > 0 && (
                <TouchableOpacity
                    style={styles.ratingRow}
                    onPress={() => setActiveTab('reviews')}
                    activeOpacity={0.7}
                >
                    <View style={styles.starsRow}>{renderStars(avg, 15)}</View>
                    <ThemedText style={styles.ratingScore}>{avg.toFixed(1)}</ThemedText>
                    <ThemedText style={styles.ratingCount}>· {total} reseñas</ThemedText>
                </TouchableOpacity>
            )}

            {/* Bio */}
            {dj?.bio ? <ThemedText style={styles.bio}>{dj.bio}</ThemedText> : null}

            {/* Follow + socials */}
            <View style={styles.actionsRow}>
                <TouchableOpacity
                    style={[styles.followBtn, isFollowing && styles.followingBtn]}
                    onPress={handleFollowToggle}
                    disabled={isActionLoading}
                    activeOpacity={0.8}
                >
                    {isActionLoading ? (
                        <ActivityIndicator size="small" color={isFollowing ? '#fff' : '#000'} />
                    ) : (
                        <>
                            <Ionicons
                                name={isFollowing ? 'checkmark' : 'person-add-outline'}
                                size={16}
                                color={isFollowing ? ZyncTheme.colors.primary : '#000'}
                            />
                            <ThemedText
                                style={[styles.followBtnText, isFollowing && styles.followingBtnText]}
                            >
                                {isFollowing ? 'Siguiendo' : 'Seguir'}
                            </ThemedText>
                        </>
                    )}
                </TouchableOpacity>

                <View style={styles.socialRow}>
                    {dj?.spotifyUrl ? (
                        <TouchableOpacity style={styles.socialBtn} onPress={() => openLink(dj.spotifyUrl)}>
                            <Ionicons name="logo-spotify" size={20} color="#1DB954" />
                        </TouchableOpacity>
                    ) : null}
                    {dj?.soundcloudUrl ? (
                        <TouchableOpacity style={styles.socialBtn} onPress={() => openLink(dj.soundcloudUrl)}>
                            <Ionicons name="cloud-outline" size={20} color="#FF5500" />
                        </TouchableOpacity>
                    ) : null}
                    {dj?.instagramUrl ? (
                        <TouchableOpacity style={styles.socialBtn} onPress={() => openLink(dj.instagramUrl)}>
                            <Ionicons name="logo-instagram" size={20} color="#E4405F" />
                        </TouchableOpacity>
                    ) : null}
                </View>
            </View>

            {/* Tab bar */}
            <View style={styles.tabBar}>
                <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('gigs')} activeOpacity={0.8}>
                    <ThemedText style={[styles.tabLabel, activeTab === 'gigs' && styles.tabLabelActive]}>
                        PRÓXIMOS GIGS
                    </ThemedText>
                    {activeTab === 'gigs' && <View style={styles.tabIndicator} />}
                </TouchableOpacity>
                <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('reviews')} activeOpacity={0.8}>
                    <ThemedText style={[styles.tabLabel, activeTab === 'reviews' && styles.tabLabelActive]}>
                        RESEÑAS{total > 0 ? ` (${total})` : ''}
                    </ThemedText>
                    {activeTab === 'reviews' && <View style={styles.tabIndicator} />}
                </TouchableOpacity>
            </View>

            {/* Gigs */}
            {activeTab === 'gigs' &&
                (gigs.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="calendar-outline" size={48} color="#2a2a2a" />
                        <ThemedText style={styles.emptyTitle}>Sin gigs próximos</ThemedText>
                        <ThemedText style={styles.emptySubtitle}>
                            Seguí a este DJ para enterarte cuando confirme fechas
                        </ThemedText>
                    </View>
                ) : (
                    gigs.map((gig) => {
                        const start = new Date(gig.startsAt);
                        const end = new Date(gig.endsAt);
                        return (
                            <TouchableOpacity key={gig.eventId} style={styles.gigCard} activeOpacity={0.75}>
                                <View style={styles.gigAccent} />
                                <View style={styles.gigDateBlock}>
                                    <ThemedText style={styles.gigDay}>{start.getDate()}</ThemedText>
                                    <ThemedText style={styles.gigMonth}>
                                        {start.toLocaleString('es', { month: 'short' }).toUpperCase()}
                                    </ThemedText>
                                </View>
                                <View style={styles.gigInfo}>
                                    <ThemedText style={styles.gigName} numberOfLines={1}>
                                        {gig.eventName}
                                    </ThemedText>
                                    <ThemedText style={styles.gigTime}>
                                        {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {' – '}
                                        {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </ThemedText>
                                </View>
                                <View style={styles.gigArrow}>
                                    <Ionicons name="arrow-forward" size={16} color={ZyncTheme.colors.primary} />
                                </View>
                            </TouchableOpacity>
                        );
                    })
                ))}

            {/* Reviews */}
            {activeTab === 'reviews' &&
                (!reviewsData || reviewsData.reviews.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="star-outline" size={48} color="#2a2a2a" />
                        <ThemedText style={styles.emptyTitle}>Sin reseñas aún</ThemedText>
                        <ThemedText style={styles.emptySubtitle}>
                            Las reseñas aparecen después de cada evento
                        </ThemedText>
                    </View>
                ) : (
                    reviewsData.reviews.map((review) => (
                        <View key={review.id} style={styles.reviewCard}>
                            <View style={styles.reviewHeader}>
                                <View style={styles.reviewAvatar}>
                                    <Ionicons name="person" size={15} color="#555" />
                                </View>
                                <View style={styles.reviewMeta}>
                                    <View style={styles.starsRow}>{renderStars(review.score)}</View>
                                    <ThemedText style={styles.reviewDate}>
                                        {new Date(review.createdAt).toLocaleDateString('es', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </ThemedText>
                                </View>
                                <View style={styles.reviewScoreBadge}>
                                    <ThemedText style={styles.reviewScoreText}>
                                        {review.score}/5
                                    </ThemedText>
                                </View>
                            </View>
                            {review.comment ? (
                                <ThemedText style={styles.reviewComment}>"{review.comment}"</ThemedText>
                            ) : null}
                        </View>
                    ))
                ))}

            <View style={{ height: 60 }} />
        </CollapsingProfileHeader>
    );
}

const styles = StyleSheet.create({
    loaderContainer: {
        flex: 1,
        backgroundColor: ZyncTheme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    floatingBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    metaRow: {
        flexDirection: 'row',
        gap: 14,
        marginBottom: 14,
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    metaText: { fontSize: 13, color: ZyncTheme.colors.textSecondary },
    genresRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        justifyContent: 'center',
        marginBottom: 16,
    },
    genreChip: {
        backgroundColor: 'rgba(204,255,0,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(204,255,0,0.22)',
        borderRadius: 999,
        paddingHorizontal: 13,
        paddingVertical: 5,
    },
    genreText: { fontSize: 12, fontWeight: '600', color: ZyncTheme.colors.primary },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
    starsRow: { flexDirection: 'row', gap: 2 },
    ratingScore: { fontSize: 15, fontWeight: '700', color: ZyncTheme.colors.primary },
    ratingCount: { fontSize: 13, color: ZyncTheme.colors.textSecondary },
    bio: {
        fontSize: 14,
        color: ZyncTheme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 22,
        maxWidth: 340,
    },
    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 28,
        justifyContent: 'center',
    },
    followBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: ZyncTheme.colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 28,
        borderRadius: 999,
        minWidth: 130,
        justifyContent: 'center',
    },
    followingBtn: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: ZyncTheme.colors.primary,
    },
    followBtnText: { fontSize: 14, fontWeight: '700', color: '#000' },
    followingBtnText: { color: ZyncTheme.colors.primary },
    socialRow: { flexDirection: 'row', gap: 10 },
    socialBtn: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabBar: {
        flexDirection: 'row',
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: ZyncTheme.colors.border,
        marginBottom: 20,
    },
    tab: { flex: 1, alignItems: 'center', paddingVertical: 14, position: 'relative' },
    tabLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2, color: ZyncTheme.colors.textSecondary },
    tabLabelActive: { color: ZyncTheme.colors.primary },
    tabIndicator: {
        position: 'absolute',
        bottom: 0,
        left: '20%',
        right: '20%',
        height: 2,
        backgroundColor: ZyncTheme.colors.primary,
        borderRadius: 1,
    },
    gigCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: ZyncTheme.colors.card,
        borderRadius: 16,
        marginBottom: 12,
        width: '100%',
        borderWidth: 1,
        borderColor: ZyncTheme.colors.border,
        overflow: 'hidden',
    },
    gigAccent: { width: 3, alignSelf: 'stretch', backgroundColor: ZyncTheme.colors.primary, opacity: 0.85 },
    gigDateBlock: {
        alignItems: 'center',
        minWidth: 52,
        paddingVertical: 18,
        paddingHorizontal: 12,
        borderRightWidth: 1,
        borderRightColor: ZyncTheme.colors.border,
    },
    gigDay: { fontSize: 22, fontWeight: '800', color: ZyncTheme.colors.primary, lineHeight: 26 },
    gigMonth: { fontSize: 11, fontWeight: '600', color: ZyncTheme.colors.textSecondary, letterSpacing: 1 },
    gigInfo: { flex: 1, paddingHorizontal: 14, paddingVertical: 18 },
    gigName: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
    gigTime: { fontSize: 12, color: ZyncTheme.colors.textSecondary },
    gigArrow: { paddingRight: 16 },
    reviewCard: {
        backgroundColor: ZyncTheme.colors.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        width: '100%',
        borderWidth: 1,
        borderColor: ZyncTheme.colors.border,
    },
    reviewHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
    reviewAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.06)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    reviewMeta: { flex: 1, gap: 3 },
    reviewDate: { fontSize: 11, color: ZyncTheme.colors.textSecondary },
    reviewScoreBadge: {
        backgroundColor: 'rgba(204,255,0,0.1)',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 3,
        alignSelf: 'flex-start',
    },
    reviewScoreText: { fontSize: 11, fontWeight: '700', color: ZyncTheme.colors.primary },
    reviewComment: {
        fontSize: 14,
        color: ZyncTheme.colors.textSecondary,
        fontStyle: 'italic',
        lineHeight: 21,
    },
    emptyState: { alignItems: 'center', paddingTop: 48, paddingBottom: 40, gap: 10 },
    emptyTitle: { fontSize: 16, fontWeight: '700', color: ZyncTheme.colors.textSecondary },
    emptySubtitle: { fontSize: 13, color: '#3a3a3a', textAlign: 'center', maxWidth: 260 },
});
