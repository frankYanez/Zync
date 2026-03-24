import { CollapsingProfileHeader } from '@/components/CollapsingProfileHeader';
import { RoleSelector } from '@/components/profile/RoleSelector';
import { ScreenLayout } from '@/components/ScreenLayout';
import { ThemedText } from '@/components/themed-text';
import { DjReviewsResponse } from '@/features/dj/domain/dj.types';
import { getDjReviews } from '@/features/dj/services/dj.service';
import { getOrganizerProfile } from '@/features/profile/services/profile.service';
import { useDjGigs } from '@/hooks/useDjGigs';
import { useDjProfile } from '@/hooks/useDjProfile';
import { useRoleManager } from '@/hooks/useRoleManager';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

interface OrganizerProfile {
    organizationName?: string;
    description?: string;
    address?: string;
    websiteUrl?: string;
    contactEmail?: string;
    logoUrl?: string;
    bannerUrl?: string;
}

type ActiveTab = 'gigs' | 'reviews';

export default function BusinessProfileScreen() {
    const router = useRouter();
    const { currentRole } = useRoleManager();

    const { profile: djProfile, isLoading: djLoading } = useDjProfile();
    const { gigs } = useDjGigs(djProfile?.id);

    const [activeTab, setActiveTab] = useState<ActiveTab>('gigs');
    const [reviewsData, setReviewsData] = useState<DjReviewsResponse | null>(null);
    const [organizerProfile, setOrganizerProfile] = useState<OrganizerProfile | null>(null);

    useEffect(() => {
        if (!djProfile?.id) return;
        getDjReviews(djProfile.id)
            .then(setReviewsData)
            .catch(() => {});
    }, [djProfile?.id]);

    useEffect(() => {
        if (currentRole !== 'business') return;
        getOrganizerProfile()
            .then(setOrganizerProfile)
            .catch(() => {});
    }, [currentRole]);

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

    // ─── Vista DJ ─────────────────────────────────────────────────────────────
    if (currentRole === 'dj') {
        if (djLoading) {
            return (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={ZyncTheme.colors.primary} />
                </View>
            );
        }

        const avg = reviewsData?.stats.averageScore ?? 0;
        const total = reviewsData?.stats.totalReviews ?? 0;

        const editButton = (
            <TouchableOpacity
                style={styles.floatingBtn}
                onPress={() => router.push('/profile/edit-dj' as any)}
            >
                <Ionicons name="create-outline" size={20} color="#fff" />
            </TouchableOpacity>
        );

        const bannerPills = (
            <>
                <TouchableOpacity
                    style={[styles.bannerPill, { top: Platform.OS === 'ios' ? 52 : 32, left: 16 }]}
                    onPress={() => router.push(`/dj/${djProfile?.id}` as any)}
                    disabled={!djProfile?.id}
                >
                    <Ionicons name="eye-outline" size={14} color="#fff" />
                    <ThemedText style={styles.bannerPillText}>Vista previa</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.bannerPill, { top: Platform.OS === 'ios' ? 52 : 32, right: 16 }]}
                    onPress={() => router.push('/profile/edit-dj' as any)}
                >
                    <Ionicons name="create-outline" size={14} color="#fff" />
                    <ThemedText style={styles.bannerPillText}>Editar</ThemedText>
                </TouchableOpacity>
            </>
        );

        return (
            <CollapsingProfileHeader
                variant="dj"
                title={djProfile?.artistName ?? 'Mi perfil DJ'}
                avatarUri={djProfile?.logoUrl}
                bannerUri={djProfile?.bannerUrl}
                onAvatarPress={() => router.push('/profile/edit-dj' as any)}
                rightAction={editButton}
                bannerOverlay={bannerPills}
            >
                {/* Location + price */}
                <View style={styles.metaRow}>
                    {djProfile?.city ? (
                        <View style={styles.metaChip}>
                            <Ionicons name="location-sharp" size={13} color={ZyncTheme.colors.textSecondary} />
                            <ThemedText style={styles.metaText}>{djProfile.city}</ThemedText>
                        </View>
                    ) : null}
                    {djProfile?.pricePerSong ? (
                        <View style={styles.metaChip}>
                            <Ionicons name="musical-note" size={13} color={ZyncTheme.colors.textSecondary} />
                            <ThemedText style={styles.metaText}>
                                ${djProfile.pricePerSong} / canción
                            </ThemedText>
                        </View>
                    ) : null}
                </View>

                {/* Genres */}
                {djProfile?.genres && djProfile.genres.length > 0 && (
                    <View style={styles.genresRow}>
                        {djProfile.genres.map((g) => (
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
                {djProfile?.bio ? (
                    <ThemedText style={styles.bio}>{djProfile.bio}</ThemedText>
                ) : null}

                {/* Edit + socials */}
                <View style={styles.actionsRow}>
                    <TouchableOpacity
                        style={styles.editBtn}
                        onPress={() => router.push('/profile/edit-dj' as any)}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="create-outline" size={16} color={ZyncTheme.colors.primary} />
                        <ThemedText style={styles.editBtnText}>Editar perfil</ThemedText>
                    </TouchableOpacity>

                    <View style={styles.socialRow}>
                        {djProfile?.spotifyUrl ? (
                            <TouchableOpacity
                                style={styles.socialBtn}
                                onPress={() => Linking.openURL(djProfile.spotifyUrl!)}
                            >
                                <Ionicons name="logo-spotify" size={20} color="#1DB954" />
                            </TouchableOpacity>
                        ) : null}
                        {djProfile?.soundcloudUrl ? (
                            <TouchableOpacity
                                style={styles.socialBtn}
                                onPress={() => Linking.openURL(djProfile.soundcloudUrl!)}
                            >
                                <Ionicons name="cloud-outline" size={20} color="#FF5500" />
                            </TouchableOpacity>
                        ) : null}
                        {djProfile?.instagramUrl ? (
                            <TouchableOpacity
                                style={styles.socialBtn}
                                onPress={() => Linking.openURL(djProfile.instagramUrl!)}
                            >
                                <Ionicons name="logo-instagram" size={20} color="#E4405F" />
                            </TouchableOpacity>
                        ) : null}
                    </View>
                </View>

                {/* Tab bar */}
                <View style={styles.tabBar}>
                    <TouchableOpacity
                        style={styles.tab}
                        onPress={() => setActiveTab('gigs')}
                        activeOpacity={0.8}
                    >
                        <ThemedText
                            style={[styles.tabLabel, activeTab === 'gigs' && styles.tabLabelActive]}
                        >
                            PRÓXIMOS GIGS
                        </ThemedText>
                        {activeTab === 'gigs' && <View style={styles.tabIndicator} />}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.tab}
                        onPress={() => setActiveTab('reviews')}
                        activeOpacity={0.8}
                    >
                        <ThemedText
                            style={[styles.tabLabel, activeTab === 'reviews' && styles.tabLabelActive]}
                        >
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
                            <ThemedText style={styles.emptyTitle}>Sin gigs confirmados</ThemedText>
                            <ThemedText style={styles.emptySubtitle}>
                                Tus próximas fechas aparecerán aquí
                            </ThemedText>
                        </View>
                    ) : (
                        gigs.map((gig) => {
                            const start = new Date(gig.startsAt);
                            const end = new Date(gig.endsAt);
                            return (
                                <View key={gig.eventId} style={styles.gigCard}>
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
                                </View>
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
                                Las reseñas de tu público aparecerán aquí
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
                                    <ThemedText style={styles.reviewComment}>
                                        "{review.comment}"
                                    </ThemedText>
                                ) : null}
                            </View>
                        ))
                    ))}

                {/* DJ Settings */}
                <View style={styles.settingsSection}>
                    <ThemedText style={styles.settingsTitle}>AJUSTES DJ</ThemedText>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => router.push('/(business)/dj/gigs' as any)}
                    >
                        <View style={styles.menuItemLeft}>
                            <View style={[styles.menuIcon, { backgroundColor: 'rgba(251,183,36,0.15)' }]}>
                                <Ionicons name="calendar-outline" size={18} color="#FBB724" />
                            </View>
                            <View>
                                <ThemedText style={styles.menuLabel}>Mis gigs</ThemedText>
                                {gigs.length > 0 && (
                                    <ThemedText style={styles.menuSub}>
                                        {gigs.length} próxima{gigs.length !== 1 ? 's' : ''} fecha{gigs.length !== 1 ? 's' : ''}
                                    </ThemedText>
                                )}
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={ZyncTheme.colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => router.push('/(business)/dj/promo-codes' as any)}
                    >
                        <View style={styles.menuItemLeft}>
                            <View style={[styles.menuIcon, { backgroundColor: 'rgba(16,185,129,0.15)' }]}>
                                <Ionicons name="pricetag-outline" size={18} color="#10B981" />
                            </View>
                            <ThemedText style={styles.menuLabel}>Códigos de descuento</ThemedText>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={ZyncTheme.colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.roleSelectorContainer}>
                    <RoleSelector />
                </View>

                <View style={{ height: 60 }} />
            </CollapsingProfileHeader>
        );
    }

    // ─── Vista Business ───────────────────────────────────────────────────────
    const orgEditButton = (
        <TouchableOpacity
            style={styles.floatingBtn}
            onPress={() => router.push('/profile/edit-organizer' as any)}
        >
            <Ionicons name="create-outline" size={20} color="#fff" />
        </TouchableOpacity>
    );

    const orgBannerPills = (
        <>
            <TouchableOpacity
                style={[styles.bannerPill, { top: Platform.OS === 'ios' ? 52 : 32, right: 16 }]}
                onPress={() => router.push('/profile/edit-organizer' as any)}
            >
                <Ionicons name="create-outline" size={14} color="#fff" />
                <ThemedText style={styles.bannerPillText}>Editar</ThemedText>
            </TouchableOpacity>
        </>
    );

    return (
        <ScreenLayout style={{ flex: 1 }} noPadding>
            <CollapsingProfileHeader
                variant="business"
                title={organizerProfile?.organizationName ?? 'Mi Negocio'}
                avatarUri={organizerProfile?.logoUrl}
                bannerUri={organizerProfile?.bannerUrl}
                onAvatarPress={() => router.push('/profile/edit-organizer' as any)}
                rightAction={orgEditButton}
                bannerOverlay={orgBannerPills}
            >
                {/* Description / meta */}
                {organizerProfile?.description ? (
                    <ThemedText style={styles.orgDescription}>{organizerProfile.description}</ThemedText>
                ) : null}

                <View style={styles.metaRow}>
                    {organizerProfile?.address ? (
                        <View style={styles.metaChip}>
                            <Ionicons name="location-sharp" size={13} color={ZyncTheme.colors.textSecondary} />
                            <ThemedText style={styles.metaText}>{organizerProfile.address}</ThemedText>
                        </View>
                    ) : null}
                    {organizerProfile?.contactEmail ? (
                        <View style={styles.metaChip}>
                            <Ionicons name="mail-outline" size={13} color={ZyncTheme.colors.textSecondary} />
                            <ThemedText style={styles.metaText}>{organizerProfile.contactEmail}</ThemedText>
                        </View>
                    ) : null}
                </View>

                {/* Edit button */}
                <TouchableOpacity
                    style={styles.orgEditBtn}
                    onPress={() => router.push('/profile/edit-organizer' as any)}
                    activeOpacity={0.8}
                >
                    <Ionicons name="create-outline" size={16} color="#00D4FF" />
                    <ThemedText style={styles.orgEditBtnText}>Editar perfil</ThemedText>
                </TouchableOpacity>

                <View style={styles.settingsSection}>
                    <ThemedText style={styles.settingsTitle}>AJUSTES NEGOCIO</ThemedText>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => router.push('/(business)/events/lineup' as any)}
                    >
                        <View style={styles.menuItemLeft}>
                            <View style={[styles.menuIcon, { backgroundColor: 'rgba(0,212,255,0.12)' }]}>
                                <Ionicons name="list-outline" size={18} color="#00D4FF" />
                            </View>
                            <ThemedText style={styles.menuLabel}>Gestionar Lineups</ThemedText>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={ZyncTheme.colors.textSecondary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => router.push('/profile/edit-organizer' as any)}
                    >
                        <View style={styles.menuItemLeft}>
                            <View style={[styles.menuIcon, { backgroundColor: 'rgba(251,191,36,0.15)' }]}>
                                <Ionicons name="information-circle-outline" size={18} color="#FBB724" />
                            </View>
                            <View>
                                <ThemedText style={styles.menuLabel}>Detalles del negocio</ThemedText>
                                {organizerProfile?.organizationName ? (
                                    <ThemedText style={styles.menuSub}>{organizerProfile.organizationName}</ThemedText>
                                ) : (
                                    <ThemedText style={styles.menuSub}>No configurado</ThemedText>
                                )}
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={ZyncTheme.colors.textSecondary} />
                    </TouchableOpacity>

                    <View style={styles.menuItem}>
                        <View style={styles.menuItemLeft}>
                            <View style={[styles.menuIcon, { backgroundColor: 'rgba(16,185,129,0.15)' }]}>
                                <Ionicons name="people-outline" size={18} color="#10B981" />
                            </View>
                            <ThemedText style={styles.menuLabel}>Gestión de staff</ThemedText>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={ZyncTheme.colors.textSecondary} />
                    </View>
                </View>

                <View style={styles.roleSelectorContainer}>
                    <RoleSelector />
                </View>

                <View style={{ height: 60 }} />
            </CollapsingProfileHeader>
        </ScreenLayout>
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
    bannerPill: {
        position: 'absolute',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(0,0,0,0.55)',
        paddingVertical: 7,
        paddingHorizontal: 13,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    bannerPillText: { fontSize: 13, color: '#fff', fontWeight: '600' },
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
        backgroundColor: 'rgba(168,85,247,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(168,85,247,0.3)',
        borderRadius: 999,
        paddingHorizontal: 13,
        paddingVertical: 5,
    },
    genreText: { fontSize: 12, fontWeight: '600', color: '#A855F7' },
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
    editBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: '#A855F7',
        paddingVertical: 12,
        paddingHorizontal: 28,
        borderRadius: 999,
        minWidth: 130,
        justifyContent: 'center',
    },
    editBtnText: { fontSize: 14, fontWeight: '700', color: '#A855F7' },
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
    tabLabelActive: { color: '#A855F7' },
    tabIndicator: {
        position: 'absolute',
        bottom: 0,
        left: '20%',
        right: '20%',
        height: 2,
        backgroundColor: '#A855F7',
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
    gigAccent: { width: 3, alignSelf: 'stretch', backgroundColor: '#A855F7', opacity: 0.85 },
    gigDateBlock: {
        alignItems: 'center',
        minWidth: 52,
        paddingVertical: 18,
        paddingHorizontal: 12,
        borderRightWidth: 1,
        borderRightColor: ZyncTheme.colors.border,
    },
    gigDay: { fontSize: 22, fontWeight: '800', color: '#A855F7', lineHeight: 26 },
    gigMonth: { fontSize: 11, fontWeight: '600', color: ZyncTheme.colors.textSecondary, letterSpacing: 1 },
    gigInfo: { flex: 1, paddingHorizontal: 14, paddingVertical: 18 },
    gigName: { fontSize: 15, fontWeight: '700', marginBottom: 4, color: '#fff' },
    gigTime: { fontSize: 12, color: ZyncTheme.colors.textSecondary },
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
        backgroundColor: 'rgba(168,85,247,0.12)',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 3,
        alignSelf: 'flex-start',
    },
    reviewScoreText: { fontSize: 11, fontWeight: '700', color: '#A855F7' },
    reviewComment: {
        fontSize: 14,
        color: ZyncTheme.colors.textSecondary,
        fontStyle: 'italic',
        lineHeight: 21,
    },
    emptyState: { alignItems: 'center', paddingTop: 48, paddingBottom: 32, gap: 10 },
    emptyTitle: { fontSize: 16, fontWeight: '700', color: ZyncTheme.colors.textSecondary },
    emptySubtitle: { fontSize: 13, color: '#3a3a3a', textAlign: 'center', maxWidth: 260 },
    settingsSection: { width: '100%', marginTop: 32, marginBottom: 8, gap: 8 },
    settingsTitle: {
        fontSize: 11,
        color: ZyncTheme.colors.textSecondary,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
        marginBottom: 4,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: ZyncTheme.spacing.m,
        paddingHorizontal: ZyncTheme.spacing.m,
        backgroundColor: ZyncTheme.colors.card,
        borderRadius: ZyncTheme.borderRadius.m,
        borderWidth: 1,
        borderColor: ZyncTheme.colors.border,
    },
    menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    menuIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    menuLabel: { fontSize: 15, color: '#fff', fontWeight: '500' },
    menuSub: { fontSize: 12, color: ZyncTheme.colors.textSecondary, marginTop: 2 },
    roleSelectorContainer: { width: '100%', marginTop: 16 },
    orgDescription: {
        fontSize: 14,
        color: ZyncTheme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 16,
        maxWidth: 340,
    },
    orgEditBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: '#00D4FF',
        paddingVertical: 12,
        paddingHorizontal: 28,
        borderRadius: 999,
        minWidth: 130,
        justifyContent: 'center',
        marginBottom: 8,
    },
    orgEditBtnText: { fontSize: 14, fontWeight: '700', color: '#00D4FF' },
});
