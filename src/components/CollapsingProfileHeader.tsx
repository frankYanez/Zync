import { ThemedText } from '@/components/themed-text';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Platform,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const BANNER_HEIGHT = 280;
export const AVATAR_SIZE = 104;
const HEADER_THRESHOLD = BANNER_HEIGHT - 80;
const STICKY_HEIGHT = Platform.OS === 'ios' ? 88 : 60;

export type ProfileVariant = 'user' | 'dj' | 'business';

/** Accent color per role — all chosen from the Zync dark-club palette */
export const PROFILE_ACCENT: Record<ProfileVariant, string> = {
    user:     '#CCFF00',   // electric lime  — the Zync primary
    dj:       '#A855F7',   // vivid purple   — DJ / music energy
    business: '#00D4FF',   // electric cyan  — premium / venue
};

/** Banner fallback gradient per role */
const BANNER_GRADIENT: Record<ProfileVariant, readonly [string, string, string]> = {
    user:     ['#0f1f0a', '#080f08', ZyncTheme.colors.background],
    dj:       ['#1a0d2e', '#100820', ZyncTheme.colors.background],
    business: ['#071a2e', '#050f1e', ZyncTheme.colors.background],
};

const FALLBACK_ICON: Record<ProfileVariant, React.ComponentProps<typeof Ionicons>['name']> = {
    user:     'person',
    dj:       'musical-notes',
    business: 'business',
};

export interface CollapsingProfileHeaderProps {
    variant: ProfileVariant;
    /** Displayed in the sticky header and below the avatar */
    title: string;
    avatarUri?: string | null;
    bannerUri?: string | null;
    /** If provided the avatar becomes tappable and shows a camera badge */
    onAvatarPress?: () => void;
    /**
     * Rendered top-left of the banner (floating) **and** in the left slot
     * of the sticky header once it appears. Pass a back button here.
     */
    leftAction?: React.ReactNode;
    /**
     * Rendered in the right slot of the sticky header once it appears.
     * Also shown as a floating element top-right of the banner.
     */
    rightAction?: React.ReactNode;
    /** Extra overlay elements on top of the banner (e.g. "Vista previa" pill) */
    bannerOverlay?: React.ReactNode;
    /** Content rendered below the avatar + name */
    children: React.ReactNode;
}

export function CollapsingProfileHeader({
    variant,
    title,
    avatarUri,
    bannerUri,
    onAvatarPress,
    leftAction,
    rightAction,
    bannerOverlay,
    children,
}: CollapsingProfileHeaderProps) {
    const accent = PROFILE_ACCENT[variant];
    const scrollY = useRef(new Animated.Value(0)).current;

    // ── Neon pulse ────────────────────────────────────────────────────────────
    const pulse1 = useRef(new Animated.Value(0)).current;
    const pulse2 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Ring 1 — tighter, faster pulse
        const anim1 = Animated.loop(
            Animated.sequence([
                Animated.timing(pulse1, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(pulse1, {
                    toValue: 0,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ]),
        );
        // Ring 2 — wider, delayed so it alternates with ring 1
        const anim2 = Animated.loop(
            Animated.sequence([
                Animated.delay(750),
                Animated.timing(pulse2, {
                    toValue: 1,
                    duration: 1800,
                    useNativeDriver: true,
                }),
                Animated.timing(pulse2, {
                    toValue: 0,
                    duration: 1800,
                    useNativeDriver: true,
                }),
            ]),
        );
        anim1.start();
        anim2.start();
        return () => {
            anim1.stop();
            anim2.stop();
        };
    }, []);

    const ring1Scale   = pulse1.interpolate({ inputRange: [0, 1], outputRange: [1.0, 1.42] });
    const ring1Opacity = pulse1.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0.65, 0.25, 0.0] });

    const ring2Scale   = pulse2.interpolate({ inputRange: [0, 1], outputRange: [1.0, 1.75] });
    const ring2Opacity = pulse2.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0.40, 0.10, 0.0] });

    // ── Scroll animations ─────────────────────────────────────────────────────
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
    // Floating actions fade out as the sticky header fades in
    const floatingOpacity = scrollY.interpolate({
        inputRange: [HEADER_THRESHOLD - 40, HEADER_THRESHOLD],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    // ── Avatar with neon glow ─────────────────────────────────────────────────
    const avatarNode = (
        <View style={styles.avatarContainer}>
            {/* Outer wide pulse */}
            <Animated.View
                style={[
                    styles.glowRing,
                    {
                        borderColor: accent,
                        shadowColor: accent,
                        transform: [{ scale: ring2Scale }],
                        opacity: ring2Opacity,
                    },
                ]}
            />
            {/* Inner tight pulse */}
            <Animated.View
                style={[
                    styles.glowRing,
                    {
                        borderColor: accent,
                        shadowColor: accent,
                        transform: [{ scale: ring1Scale }],
                        opacity: ring1Opacity,
                    },
                ]}
            />

            {/* Avatar image or role-specific fallback */}
            {avatarUri ? (
                <Image
                    source={{ uri: avatarUri }}
                    style={[styles.avatar, { borderColor: accent }]}
                    contentFit="cover"
                    transition={300}
                />
            ) : (
                <View
                    style={[
                        styles.avatar,
                        styles.avatarFallback,
                        { borderColor: accent, backgroundColor: accent },
                    ]}
                >
                    <Ionicons name={FALLBACK_ICON[variant]} size={44} color="#000" />
                </View>
            )}

            {/* Camera badge — shown only when avatar is editable */}
            {onAvatarPress && (
                <View style={[styles.cameraBadge, { backgroundColor: accent }]}>
                    <Ionicons name="camera" size={12} color="#000" />
                </View>
            )}
        </View>
    );

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* ── Sticky header — fades in once banner scrolls off ── */}
            <Animated.View
                style={[
                    styles.stickyHeader,
                    {
                        opacity: headerOpacity,
                        borderBottomColor: accent + '44',
                    },
                ]}
            >
                <View style={styles.stickySlot}>
                    {leftAction ?? <View style={styles.slotSpacer} />}
                </View>

                <ThemedText
                    style={[styles.stickyTitle, { color: accent }]}
                    numberOfLines={1}
                >
                    {title}
                </ThemedText>

                <View style={[styles.stickySlot, { alignItems: 'flex-end' }]}>
                    {rightAction ?? <View style={styles.slotSpacer} />}
                </View>
            </Animated.View>

            {/* ── Floating left action (visible over banner) ── */}
            {leftAction && (
                <Animated.View
                    style={[styles.floatingLeft, { opacity: floatingOpacity }]}
                    pointerEvents="box-none"
                >
                    {leftAction}
                </Animated.View>
            )}

            {/* ── Floating right action (visible over banner) ── */}
            {rightAction && (
                <Animated.View
                    style={[styles.floatingRight, { opacity: floatingOpacity }]}
                    pointerEvents="box-none"
                >
                    {rightAction}
                </Animated.View>
            )}

            <Animated.ScrollView
                showsVerticalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: true },
                )}
                scrollEventThrottle={16}
            >
                {/* ── Banner with parallax ── */}
                <View style={styles.bannerWrapper}>
                    <Animated.View
                        style={[
                            styles.bannerInner,
                            { transform: [{ translateY: bannerTranslate }] },
                        ]}
                    >
                        {bannerUri ? (
                            <Image
                                source={{ uri: bannerUri }}
                                style={StyleSheet.absoluteFill}
                                contentFit="cover"
                                transition={400}
                            />
                        ) : (
                            <LinearGradient
                                colors={BANNER_GRADIENT[variant]}
                                style={StyleSheet.absoluteFill}
                            />
                        )}
                    </Animated.View>

                    {/* Fade gradient to background */}
                    <LinearGradient
                        colors={['transparent', 'rgba(10,10,10,0.5)', ZyncTheme.colors.background]}
                        locations={[0.2, 0.65, 1]}
                        style={StyleSheet.absoluteFill}
                    />

                    {/* Custom banner overlays (preview/edit pills, etc.) */}
                    {bannerOverlay}
                </View>

                {/* ── Profile content ── */}
                <View style={styles.content}>
                    {/* Avatar */}
                    {onAvatarPress ? (
                        <TouchableOpacity
                            onPress={onAvatarPress}
                            activeOpacity={0.85}
                            style={styles.avatarTouchTarget}
                        >
                            {avatarNode}
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.avatarTouchTarget}>{avatarNode}</View>
                    )}

                    {/* Name */}
                    <ThemedText style={styles.profileTitle}>{title}</ThemedText>

                    {/* Screen-specific content */}
                    {children}
                </View>
            </Animated.ScrollView>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: ZyncTheme.colors.background,
    },

    /* Sticky header */
    stickyHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 30,
        height: STICKY_HEIGHT,
        backgroundColor: ZyncTheme.colors.background,
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        paddingBottom: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
    },
    stickySlot: {
        width: 44,
        height: 44,
        justifyContent: 'center',
    },
    slotSpacer: {
        width: 44,
    },
    stickyTitle: {
        fontSize: 16,
        fontWeight: '700',
        flex: 1,
        textAlign: 'center',
        letterSpacing: 0.3,
    },

    /* Floating overlays */
    floatingLeft: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 52 : 32,
        left: 16,
        zIndex: 20,
    },
    floatingRight: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 52 : 32,
        right: 16,
        zIndex: 20,
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

    /* Content */
    content: {
        paddingHorizontal: 20,
        marginTop: -(AVATAR_SIZE / 2),
        alignItems: 'center',
    },
    avatarTouchTarget: {
        marginBottom: 16,
    },

    /* Avatar + neon rings */
    avatarContainer: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        justifyContent: 'center',
        alignItems: 'center',
    },
    glowRing: {
        position: 'absolute',
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: AVATAR_SIZE / 2,
        borderWidth: 2,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 18,
        elevation: 12,
    },
    avatar: {
        width: AVATAR_SIZE,
        height: AVATAR_SIZE,
        borderRadius: AVATAR_SIZE / 2,
        borderWidth: 3,
        zIndex: 2,
    },
    avatarFallback: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    cameraBadge: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: ZyncTheme.colors.background,
        zIndex: 3,
    },

    /* Profile title */
    profileTitle: {
        fontSize: 30,
        fontWeight: '800',
        letterSpacing: -0.5,
        textAlign: 'center',
        marginBottom: 10,
        color: '#fff',
    },
});
