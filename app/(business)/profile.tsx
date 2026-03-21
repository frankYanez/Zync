import { RoleSelector } from '@/components/profile/RoleSelector';
import { ScreenLayout } from '@/components/ScreenLayout';
import { ThemedText } from '@/components/themed-text';
import { DjReviewsResponse } from '@/features/dj/domain/dj.types';
import { getDjReviews } from '@/features/dj/services/dj.service';
import { useDjGigs } from '@/hooks/useDjGigs';
import { useDjProfile } from '@/hooks/useDjProfile';
import { useRoleManager } from '@/hooks/useRoleManager';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    Linking,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_HEIGHT = 260;
const AVATAR_SIZE = 104;
const HEADER_THRESHOLD = BANNER_HEIGHT - 80;

type ActiveTab = 'gigs' | 'reviews';

// ─── Pantalla principal ────────────────────────────────────────────────────────
export default function BusinessProfileScreen() {
    const router = useRouter();
    const { currentRole } = useRoleManager();

    const { profile: djProfile, isLoading: djLoading } = useDjProfile();
    const { gigs } = useDjGigs(djProfile?.id);

    const scrollY = useRef(new Animated.Value(0)).current;
    const [activeTab, setActiveTab] = useState<ActiveTab>('gigs');
    const [reviewsData, setReviewsData] = useState<DjReviewsResponse | null>(null);

    useEffect(() => {
        if (!djProfile?.id) return;
        getDjReviews(djProfile.id)
            .then(setReviewsData)
            .catch(() => {});
    }, [djProfile?.id]);

    /* ── Animaciones (mismas que vista pública) ── */
    const bannerTranslate = scrollY.interpolate({
        inputRange: [0, BANNER_HEIGHT],
        outputRange: [0, -BANNER_HEIGHT * 0.35],
        extrapolate: 'clamp',
    });
    const headerOpacity = scrollY.interpolate({
        inputRange: [HEADER_THRESHOLD - 30, HEADER_THRESHOLD + 30],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

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

    // ─── Vista DJ ──────────────────────────────────────────────────────────────
    const renderDjProfile = () => {
        if (djLoading) {
            return (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color={ZyncTheme.colors.primary} />
                </View>
            );
        }

        const avg = reviewsData?.stats.averageScore ?? 0;
        const total = reviewsData?.stats.totalReviews ?? 0;

        return (
            <View style={styles.root}>
                <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

                {/* ── Compact sticky header ── */}
                <Animated.View style={[styles.stickyHeader, { opacity: headerOpacity }]}>
                    <View style={{ width: 44 }} />
                    <ThemedText style={styles.stickyTitle} numberOfLines={1}>
                        {djProfile?.artistName || 'Mi perfil DJ'}
                    </ThemedText>
                    <TouchableOpacity
                        style={styles.stickyEdit}
                        onPress={() => router.push('/profile/edit-dj' as any)}
                    >
                        <Ionicons name="create-outline" size={20} color={ZyncTheme.colors.primary} />
                    </TouchableOpacity>
                </Animated.View>

                <Animated.ScrollView
                    showsVerticalScrollIndicator={false}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: true },
                    )}
                    scrollEventThrottle={16}
                >
                    {/* ── Banner con parallax ── */}
                    <View style={styles.bannerWrapper}>
                        <Animated.View
                            style={[
                                styles.bannerInner,
                                { transform: [{ translateY: bannerTranslate }] },
                            ]}
                        >
                            {djProfile?.bannerUrl ? (
                                <Image
                                    source={{ uri: djProfile.bannerUrl }}
                                    style={StyleSheet.absoluteFill}
                                    contentFit="cover"
                                    transition={400}
                                />
                            ) : (
                                <View style={[StyleSheet.absoluteFill, styles.bannerFallback]} />
                            )}
                        </Animated.View>

                        <LinearGradient
                            colors={[
                                'transparent',
                                'rgba(10,10,10,0.45)',
                                ZyncTheme.colors.background,
                            ]}
                            locations={[0.25, 0.65, 1]}
                            style={StyleSheet.absoluteFill}
                        />

                        {/* 👁 Vista previa — esquina superior izquierda */}
                        <TouchableOpacity
                            style={styles.bannerBtn}
                            onPress={() => router.push(`/dj/${djProfile?.id}` as any)}
                            disabled={!djProfile?.id}
                        >
                            <Ionicons name="eye-outline" size={16} color="#fff" />
                            <ThemedText style={styles.bannerBtnText}>Vista previa</ThemedText>
                        </TouchableOpacity>

                        {/* ✏️ Editar — esquina superior derecha */}
                        <TouchableOpacity
                            style={[styles.bannerBtn, styles.bannerBtnRight]}
                            onPress={() => router.push('/profile/edit-dj' as any)}
                        >
                            <Ionicons name="create-outline" size={16} color="#fff" />
                            <ThemedText style={styles.bannerBtnText}>Editar</ThemedText>
                        </TouchableOpacity>
                    </View>

                    {/* ── Contenido ── */}
                    <View style={styles.content}>

                        {/* Avatar con overlay de cámara */}
                        <TouchableOpacity
                            style={styles.avatarWrapper}
                            onPress={() => router.push('/profile/edit-dj' as any)}
                            activeOpacity={0.85}
                        >
                            <View style={styles.avatarGlow} />
                            {djProfile?.logoUrl ? (
                                <Image
                                    source={{ uri: djProfile.logoUrl }}
                                    style={styles.avatar}
                                    contentFit="cover"
                                    transition={300}
                                />
                            ) : (
                                <View style={[styles.avatar, styles.avatarFallback]}>
                                    <Ionicons name="musical-notes" size={46} color="#000" />
                                </View>
                            )}
                            {/* Indicador de cámara — solo en perfil propio */}
                            <View style={styles.cameraOverlay}>
                                <Ionicons name="camera" size={13} color="#fff" />
                            </View>
                        </TouchableOpacity>

                        {/* Nombre artístico */}
                        <ThemedText style={styles.artistName}>
                            {djProfile?.artistName || 'Sin nombre artístico'}
                        </ThemedText>

                        {/* Ubicación + precio */}
                        <View style={styles.metaRow}>
                            {djProfile?.city ? (
                                <View style={styles.metaChip}>
                                    <Ionicons
                                        name="location-sharp"
                                        size={13}
                                        color={ZyncTheme.colors.textSecondary}
                                    />
                                    <ThemedText style={styles.metaText}>{djProfile.city}</ThemedText>
                                </View>
                            ) : null}
                            {djProfile?.pricePerSong ? (
                                <View style={styles.metaChip}>
                                    <Ionicons
                                        name="musical-note"
                                        size={13}
                                        color={ZyncTheme.colors.textSecondary}
                                    />
                                    <ThemedText style={styles.metaText}>
                                        ${djProfile.pricePerSong} / canción
                                    </ThemedText>
                                </View>
                            ) : null}
                        </View>

                        {/* Géneros */}
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

                        {/* Redes sociales + acción de editar (donde estaría el Follow en vista pública) */}
                        <View style={styles.actionsRow}>
                            <TouchableOpacity
                                style={styles.editProfileBtn}
                                onPress={() => router.push('/profile/edit-dj' as any)}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="create-outline" size={16} color={ZyncTheme.colors.primary} />
                                <ThemedText style={styles.editProfileBtnText}>Editar perfil</ThemedText>
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

                        {/* ── Tab bar ── */}
                        <View style={styles.tabBar}>
                            <TouchableOpacity
                                style={styles.tab}
                                onPress={() => setActiveTab('gigs')}
                                activeOpacity={0.8}
                            >
                                <ThemedText
                                    style={[
                                        styles.tabLabel,
                                        activeTab === 'gigs' && styles.tabLabelActive,
                                    ]}
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
                                    style={[
                                        styles.tabLabel,
                                        activeTab === 'reviews' && styles.tabLabelActive,
                                    ]}
                                >
                                    RESEÑAS{total > 0 ? ` (${total})` : ''}
                                </ThemedText>
                                {activeTab === 'reviews' && <View style={styles.tabIndicator} />}
                            </TouchableOpacity>
                        </View>

                        {/* ── Gigs ── */}
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
                                                <ThemedText style={styles.gigDay}>
                                                    {start.getDate()}
                                                </ThemedText>
                                                <ThemedText style={styles.gigMonth}>
                                                    {start
                                                        .toLocaleString('es', { month: 'short' })
                                                        .toUpperCase()}
                                                </ThemedText>
                                            </View>
                                            <View style={styles.gigInfo}>
                                                <ThemedText style={styles.gigName} numberOfLines={1}>
                                                    {gig.eventName}
                                                </ThemedText>
                                                <ThemedText style={styles.gigTime}>
                                                    {start.toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                    {' – '}
                                                    {end.toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </ThemedText>
                                            </View>
                                        </View>
                                    );
                                })
                            ))}

                        {/* ── Reviews ── */}
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
                                                <View style={styles.starsRow}>
                                                    {renderStars(review.score)}
                                                </View>
                                                <ThemedText style={styles.reviewDate}>
                                                    {new Date(review.createdAt).toLocaleDateString(
                                                        'es',
                                                        {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric',
                                                        },
                                                    )}
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

                        {/* ── Sección de ajustes DJ (solo en perfil propio) ── */}
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

                        {/* ── Selector de rol ── */}
                        <View style={styles.roleSelectorContainer}>
                            <RoleSelector />
                        </View>

                        <View style={{ height: 60 }} />
                    </View>
                </Animated.ScrollView>
            </View>
        );
    };

    // ─── Vista Business ────────────────────────────────────────────────────────
    const renderBusinessProfile = () => (
        <ScrollView>
            <View style={styles.businessHeader}>
                <View style={styles.businessAvatar}>
                    <Ionicons name="business" size={40} color={ZyncTheme.colors.background} />
                </View>
                <ThemedText style={styles.artistName}>Mi Negocio</ThemedText>
                <ThemedText style={styles.metaText}>Detalles no configurados</ThemedText>
            </View>

            <View style={styles.content}>
                <View style={styles.roleSelectorContainer}>
                    <RoleSelector />
                </View>

                <View style={styles.settingsSection}>
                    <ThemedText style={styles.settingsTitle}>AJUSTES NEGOCIO</ThemedText>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => router.push('/(business)/events/lineup' as any)}
                    >
                        <View style={styles.menuItemLeft}>
                            <View style={[styles.menuIcon, { backgroundColor: 'rgba(139,92,246,0.15)' }]}>
                                <Ionicons name="list-outline" size={18} color={ZyncTheme.colors.primary} />
                            </View>
                            <ThemedText style={styles.menuLabel}>Gestionar Lineups</ThemedText>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={ZyncTheme.colors.textSecondary} />
                    </TouchableOpacity>
                    <View style={styles.menuItem}>
                        <View style={styles.menuItemLeft}>
                            <View style={[styles.menuIcon, { backgroundColor: 'rgba(251,191,36,0.15)' }]}>
                                <Ionicons name="information-circle-outline" size={18} color="#FBB724" />
                            </View>
                            <ThemedText style={styles.menuLabel}>Detalles del negocio</ThemedText>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={ZyncTheme.colors.textSecondary} />
                    </View>
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
            </View>
        </ScrollView>
    );

    return (
        <ScreenLayout style={{ flex: 1 }} noPadding>
            {currentRole === 'dj' ? renderDjProfile() : renderBusinessProfile()}
        </ScreenLayout>
    );
}

/* ─────────────────────────────────────── STYLES ─── */
const STICKY_HEIGHT = Platform.OS === 'ios' ? 88 : 60;

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: ZyncTheme.colors.background,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 120,
    },

    /* Sticky header */
    stickyHeader: {
        position: 'absolute',
        top: 0, left: 0, right: 0,
        zIndex: 30,
        height: STICKY_HEIGHT,
        backgroundColor: ZyncTheme.colors.background,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        paddingBottom: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: ZyncTheme.colors.border,
    },
    stickyTitle: {
        fontSize: 16,
        fontWeight: '700',
        flex: 1,
        textAlign: 'center',
    },
    stickyEdit: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },

    /* Banner */
    bannerWrapper: {
        height: BANNER_HEIGHT,
        overflow: 'hidden',
    },
    bannerInner: {
        height: BANNER_HEIGHT + 80,
        width: SCREEN_WIDTH,
    },
    bannerFallback: {
        backgroundColor: '#0d0d1f',
    },

    /* Banner buttons */
    bannerBtn: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 52 : 32,
        left: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(0,0,0,0.55)',
        paddingVertical: 7,
        paddingHorizontal: 13,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
    },
    bannerBtnRight: {
        left: undefined,
        right: 16,
    },
    bannerBtnText: {
        fontSize: 13,
        color: '#fff',
        fontWeight: '600',
    },

    /* Content */
    content: {
        paddingHorizontal: 20,
        marginTop: -(AVATAR_SIZE / 2),
        alignItems: 'center',
    },

    /* Avatar */
    avatarWrapper: {
        marginBottom: 16,
        position: 'relative',
    },
    avatar: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: AVATAR_SIZE / 2,
        borderWidth: 3,
        borderColor: ZyncTheme.colors.primary,
    },
    avatarFallback: {
        backgroundColor: ZyncTheme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarGlow: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: AVATAR_SIZE / 2,
        shadowColor: ZyncTheme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.65,
        shadowRadius: 20,
        elevation: 14,
    },
    cameraOverlay: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: ZyncTheme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: ZyncTheme.colors.background,
    },

    /* Info */
    artistName: {
        fontSize: 30,
        fontWeight: '800',
        letterSpacing: -0.5,
        textAlign: 'center',
        marginBottom: 10,
        color: '#fff',
    },
    metaRow: {
        flexDirection: 'row',
        gap: 14,
        marginBottom: 14,
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    metaChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 13,
        color: ZyncTheme.colors.textSecondary,
    },
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
    genreText: {
        fontSize: 12,
        fontWeight: '600',
        color: ZyncTheme.colors.primary,
    },

    /* Rating */
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 16,
    },
    starsRow: {
        flexDirection: 'row',
        gap: 2,
    },
    ratingScore: {
        fontSize: 15,
        fontWeight: '700',
        color: ZyncTheme.colors.primary,
    },
    ratingCount: {
        fontSize: 13,
        color: ZyncTheme.colors.textSecondary,
    },

    /* Bio */
    bio: {
        fontSize: 14,
        color: ZyncTheme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 22,
        maxWidth: 340,
    },

    /* Actions row */
    actionsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 28,
        justifyContent: 'center',
    },
    editProfileBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: ZyncTheme.colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 28,
        borderRadius: 999,
        minWidth: 130,
        justifyContent: 'center',
    },
    editProfileBtnText: {
        fontSize: 14,
        fontWeight: '700',
        color: ZyncTheme.colors.primary,
    },
    socialRow: {
        flexDirection: 'row',
        gap: 10,
    },
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

    /* Tab bar */
    tabBar: {
        flexDirection: 'row',
        width: '100%',
        borderBottomWidth: 1,
        borderBottomColor: ZyncTheme.colors.border,
        marginBottom: 20,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 14,
        position: 'relative',
    },
    tabLabel: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.2,
        color: ZyncTheme.colors.textSecondary,
    },
    tabLabelActive: {
        color: ZyncTheme.colors.primary,
    },
    tabIndicator: {
        position: 'absolute',
        bottom: 0,
        left: '20%',
        right: '20%',
        height: 2,
        backgroundColor: ZyncTheme.colors.primary,
        borderRadius: 1,
    },

    /* Gig cards */
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
    gigAccent: {
        width: 3,
        alignSelf: 'stretch',
        backgroundColor: ZyncTheme.colors.primary,
        opacity: 0.85,
    },
    gigDateBlock: {
        alignItems: 'center',
        minWidth: 52,
        paddingVertical: 18,
        paddingHorizontal: 12,
        borderRightWidth: 1,
        borderRightColor: ZyncTheme.colors.border,
    },
    gigDay: {
        fontSize: 22,
        fontWeight: '800',
        color: ZyncTheme.colors.primary,
        lineHeight: 26,
    },
    gigMonth: {
        fontSize: 11,
        fontWeight: '600',
        color: ZyncTheme.colors.textSecondary,
        letterSpacing: 1,
    },
    gigInfo: {
        flex: 1,
        paddingHorizontal: 14,
        paddingVertical: 18,
    },
    gigName: {
        fontSize: 15,
        fontWeight: '700',
        marginBottom: 4,
        color: '#fff',
    },
    gigTime: {
        fontSize: 12,
        color: ZyncTheme.colors.textSecondary,
    },

    /* Review cards */
    reviewCard: {
        backgroundColor: ZyncTheme.colors.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        width: '100%',
        borderWidth: 1,
        borderColor: ZyncTheme.colors.border,
    },
    reviewHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        marginBottom: 10,
    },
    reviewAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.06)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    reviewMeta: {
        flex: 1,
        gap: 3,
    },
    reviewDate: {
        fontSize: 11,
        color: ZyncTheme.colors.textSecondary,
    },
    reviewScoreBadge: {
        backgroundColor: 'rgba(204,255,0,0.1)',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 3,
        alignSelf: 'flex-start',
    },
    reviewScoreText: {
        fontSize: 11,
        fontWeight: '700',
        color: ZyncTheme.colors.primary,
    },
    reviewComment: {
        fontSize: 14,
        color: ZyncTheme.colors.textSecondary,
        fontStyle: 'italic',
        lineHeight: 21,
    },

    /* Empty states */
    emptyState: {
        alignItems: 'center',
        paddingTop: 48,
        paddingBottom: 32,
        gap: 10,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: ZyncTheme.colors.textSecondary,
    },
    emptySubtitle: {
        fontSize: 13,
        color: '#3a3a3a',
        textAlign: 'center',
        maxWidth: 260,
    },

    /* Settings section */
    settingsSection: {
        width: '100%',
        marginTop: 32,
        marginBottom: 8,
        gap: 8,
    },
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
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    menuIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuLabel: {
        fontSize: 15,
        color: '#fff',
        fontWeight: '500',
    },
    menuSub: {
        fontSize: 12,
        color: ZyncTheme.colors.textSecondary,
        marginTop: 2,
    },

    /* Role selector */
    roleSelectorContainer: {
        width: '100%',
        marginTop: 16,
    },

    /* Business profile */
    businessHeader: {
        alignItems: 'center',
        paddingTop: ZyncTheme.spacing.xl,
        paddingBottom: ZyncTheme.spacing.l,
    },
    businessAvatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: ZyncTheme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: ZyncTheme.spacing.m,
        borderWidth: 3,
        borderColor: ZyncTheme.colors.border,
    },
});
