import { NeonButton } from '@/components/NeonButton';
import { NeonInput } from '@/components/NeonInput';
import { ScreenLayout } from '@/components/ScreenLayout';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/features/auth/context/AuthContext';
import { updateOrganizerProfile } from '@/features/profile/services/profile.service';
import { useRole } from '@/context/RoleContext';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

const WELCOME_VIDEO_URI = 'https://www.pexels.com/es-es/download/video/854128/';
const WELCOME_DURATION_MS = 3800;

export default function CreateOrganizerProfileScreen() {
    const router = useRouter();
    const { refreshSession } = useAuth();
    const { switchRole } = useRole();

    const [organizationName, setOrganizationName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (!showWelcome) return;
        timerRef.current = setTimeout(async () => {
            setShowWelcome(false);
            await switchRole('business');
            router.replace('/(business)');
        }, WELCOME_DURATION_MS);
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [showWelcome, switchRole, router]);

    const handleSubmit = async () => {
        if (!organizationName.trim()) {
            Alert.alert('Error', 'Please enter your organization name.');
            return;
        }

        setIsSubmitting(true);
        try {
            await updateOrganizerProfile({
                organizationName: organizationName.trim(),
            });
            await refreshSession();
            setShowWelcome(true);
        } catch (error: any) {
            console.error('Organizer Profile Error:', error);
            const msg = error?.response?.data?.message;
            Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg || 'Failed to create Organizer profile.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <ScreenLayout style={styles.container} noPadding>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={ZyncTheme.colors.text} />
                    </TouchableOpacity>
                    <ThemedText style={styles.title}>Become an Organizer</ThemedText>
                </View>

                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <ThemedText style={styles.description}>
                            Create a business profile to start organizing and managing your own events on Zync.
                        </ThemedText>

                        <View style={styles.formGroup}>
                            <ThemedText style={styles.label}>Organization Name</ThemedText>
                            <NeonInput
                                placeholder="e.g. Sunset Club"
                                value={organizationName}
                                onChangeText={setOrganizationName}
                            />
                        </View>

                        <View style={styles.spacer} />

                        <NeonButton
                            title={isSubmitting ? 'Creating...' : 'Create Organizer Profile'}
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                        />
                        {isSubmitting && (
                            <ActivityIndicator size="small" color={ZyncTheme.colors.primary} style={{ marginTop: 16 }} />
                        )}
                    </ScrollView>
                </KeyboardAvoidingView>
            </ScreenLayout>

            <Modal
                visible={showWelcome}
                transparent={false}
                animationType="fade"
                statusBarTranslucent
            >
                <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
                <View style={styles.welcomeRoot}>
                    <Video
                        source={{ uri: WELCOME_VIDEO_URI }}
                        style={StyleSheet.absoluteFill}
                        resizeMode={ResizeMode.COVER}
                        shouldPlay
                        isLooping
                        isMuted
                    />

                    {/* Dark + cyan tinted overlay */}
                    <LinearGradient
                        colors={[
                            'rgba(0,18,36,0.55)',
                            'rgba(0,0,0,0.72)',
                            'rgba(0,0,0,0.88)',
                        ]}
                        locations={[0, 0.5, 1]}
                        style={StyleSheet.absoluteFill}
                    />

                    {/* Cyan glow ring behind badge */}
                    <MotiView
                        from={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1.6, opacity: 0 }}
                        transition={{ type: 'timing', duration: 2400, loop: true, repeatReverse: false }}
                        style={styles.glowRing}
                    />

                    {/* Content */}
                    <MotiView
                        from={{ opacity: 0, translateY: 28 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: 'timing', duration: 700, delay: 200 }}
                        style={styles.welcomeContent}
                    >
                        {/* Icon badge */}
                        <MotiView
                            from={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', delay: 300, damping: 14 }}
                            style={styles.iconBadge}
                        >
                            <Ionicons name="business" size={40} color="#000" />
                        </MotiView>

                        <MotiView
                            from={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ type: 'timing', duration: 500, delay: 600 }}
                        >
                            <ThemedText style={styles.welcomeLabel}>BIENVENIDO A</ThemedText>
                        </MotiView>

                        <MotiView
                            from={{ opacity: 0, translateY: 12 }}
                            animate={{ opacity: 1, translateY: 0 }}
                            transition={{ type: 'timing', duration: 600, delay: 800 }}
                        >
                            <ThemedText style={styles.welcomeTitle}>Perfil Organizador</ThemedText>
                        </MotiView>

                        <MotiView
                            from={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ type: 'timing', duration: 500, delay: 1100 }}
                        >
                            <ThemedText style={styles.welcomeSub}>
                                Ya podés crear y gestionar tus eventos en Zync
                            </ThemedText>
                        </MotiView>
                    </MotiView>
                </View>
            </Modal>
        </>
    );
}

const CYAN = '#00D4FF';

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: ZyncTheme.spacing.m,
        paddingTop: ZyncTheme.spacing.l,
        paddingBottom: ZyncTheme.spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    backButton: {
        marginRight: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
    },
    scrollContent: {
        padding: ZyncTheme.spacing.m,
        paddingBottom: 60,
    },
    description: {
        fontSize: 16,
        color: ZyncTheme.colors.textSecondary,
        marginBottom: ZyncTheme.spacing.xl,
        textAlign: 'center',
    },
    formGroup: {
        marginBottom: ZyncTheme.spacing.l,
    },
    label: {
        fontSize: 14,
        color: 'white',
        fontWeight: '600',
        marginBottom: 8,
    },
    spacer: {
        height: 20,
    },

    /* Welcome modal */
    welcomeRoot: {
        flex: 1,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
    },
    glowRing: {
        position: 'absolute',
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: CYAN,
        opacity: 0.18,
    },
    welcomeContent: {
        alignItems: 'center',
        paddingHorizontal: 32,
        gap: 12,
    },
    iconBadge: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: CYAN,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        shadowColor: CYAN,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.9,
        shadowRadius: 28,
        elevation: 16,
    },
    welcomeLabel: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 4,
        color: CYAN,
        textTransform: 'uppercase',
    },
    welcomeTitle: {
        fontSize: 38,
        fontWeight: '900',
        color: 'white',
        textAlign: 'center',
        letterSpacing: -0.5,
        textShadowColor: CYAN,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 18,
    },
    welcomeSub: {
        fontSize: 15,
        color: 'rgba(255,255,255,0.65)',
        textAlign: 'center',
        marginTop: 4,
        lineHeight: 22,
    },
});
