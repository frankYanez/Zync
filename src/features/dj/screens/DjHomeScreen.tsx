import { ScreenLayout } from '@/components/ScreenLayout';
import { ThemedText } from '@/components/themed-text';
import { VideoBackground } from '@/components/VideoBackground';
import { useAuth } from '@/features/auth/context/AuthContext';
import { sendBroadcast, toggleAcceptingRequests } from '@/features/dj/services/dj.service';
import { useZync } from '@/context/ZyncContext';
import { useDjProfile } from '@/hooks/useDjProfile';
import { useDjStats } from '@/hooks/useDjStats';
import { useSongRequests } from '@/hooks/useSongRequests';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function DjHomeScreen() {
    const { user } = useAuth();
    const { currentEstablishment } = useZync();
    const router = useRouter();
    const [isReceivingSongs, setIsReceivingSongs] = useState(true);
    const [trackMessage, setTrackMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    const { profile } = useDjProfile();
    const { stats, isLoading: statsLoading } = useDjStats(profile?.id);
    const { pending: pendingRequests, updateStatus } = useSongRequests(profile?.id);

    const topRequests = pendingRequests.slice(0, 3);

    const activeEventId = stats?.activeEvents?.[0]?.id ?? null;
    const activeEventName = stats?.activeEvents?.[0]?.name ?? currentEstablishment?.name ?? 'Sin evento activo';

    const toggleReceivingSongs = async () => {
        const next = !isReceivingSongs;
        setIsReceivingSongs(next);
        if (profile?.id) await toggleAcceptingRequests(profile.id, next);
    };

    const handleSendBroadcast = async () => {
        if (!trackMessage.trim() || !activeEventId) return;
        setIsSending(true);
        try {
            await sendBroadcast(activeEventId, trackMessage.trim());
            setTrackMessage('');
        } catch {
            Alert.alert('Error', 'No se pudo enviar el mensaje.');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <ScreenLayout noPadding>
            <VideoBackground videoUri={currentEstablishment?.video}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* ── HEADER ── */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        {/* Avatar */}
                        <TouchableOpacity
                            style={styles.avatarWrapper}
                            onPress={() => router.push('/(business)/profile')}
                        >
                            <View style={styles.avatarGlow} />
                            {user?.avatarUrl ? (
                                <Image
                                    source={{ uri: user.avatarUrl }}
                                    style={styles.avatar}
                                    contentFit="cover"
                                />
                            ) : (
                                <View style={[styles.avatar, styles.avatarFallback]}>
                                    <Ionicons name="person" size={24} color="#000" />
                                </View>
                            )}
                            <View style={styles.avatarStatusDot} />
                        </TouchableOpacity>

                        {/* Status Label */}
                        <MotiView
                            from={{ opacity: 0, translateX: -10 }}
                            animate={{ opacity: 1, translateX: 0 }}
                            transition={{ type: 'timing', duration: 400, delay: 100 }}
                            style={styles.liveBadge}
                        >
                            <View style={styles.liveDot} />
                            <ThemedText style={styles.liveText}>
                                {activeEventId ? `EN VIVO — ${activeEventName.toUpperCase()}` : 'SIN EVENTO ACTIVO'}
                            </ThemedText>
                        </MotiView>
                    </View>

                    {/* Settings Icon */}
                    <TouchableOpacity
                        style={styles.settingsIcon}
                        onPress={() => router.push('/(business)/config')}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="settings-sharp" size={24} color="#999" />
                    </TouchableOpacity>
                </View>

                {/* ── METRICS CARDS ── */}
                <View style={styles.metricsRow}>
                    <MotiView
                        from={{ opacity: 0, translateY: 15 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: 'spring', delay: 200 }}
                        style={styles.metricCard}
                    >
                        <View style={styles.metricHeader}>
                            <ThemedText style={styles.metricTitle}>GANANCIAS HOY</ThemedText>
                            <Ionicons name="cash-outline" size={20} color="#444" />
                        </View>
                        {statsLoading ? (
                            <ActivityIndicator size="small" color={ZyncTheme.colors.primary} />
                        ) : (
                            <>
                                <ThemedText style={styles.metricAmount}>
                                    ${(stats?.totalEarnings ?? 0).toLocaleString('es-AR')}
                                </ThemedText>
                                <ThemedText style={styles.metricChange}>
                                    {stats?.acceptedRequests ?? 0} canciones aceptadas
                                </ThemedText>
                            </>
                        )}
                    </MotiView>

                    <MotiView
                        from={{ opacity: 0, translateY: 15 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: 'spring', delay: 300 }}
                        style={styles.metricCard}
                    >
                        <View style={styles.metricHeader}>
                            <ThemedText style={styles.metricTitle}>PETICIONES BEATS</ThemedText>
                            <Ionicons name="list-outline" size={20} color="#444" />
                        </View>
                        {statsLoading ? (
                            <ActivityIndicator size="small" color={ZyncTheme.colors.primary} />
                        ) : (
                            <>
                                <View style={styles.requestsRow}>
                                    <ThemedText style={styles.requestsCurrent}>
                                        {stats?.pendingRequests ?? 0}
                                    </ThemedText>
                                    <ThemedText style={styles.requestsTotal}>
                                        {' '}/ {stats?.totalRequests ?? 0} Totales
                                    </ThemedText>
                                </View>
                                <View style={styles.progressBarContainer}>
                                    <View
                                        style={[
                                            styles.progressBarFill,
                                            {
                                                width: stats && stats.totalRequests > 0
                                                    ? `${(stats.pendingRequests / stats.totalRequests) * 100}%`
                                                    : '0%',
                                            },
                                        ]}
                                    />
                                </View>
                            </>
                        )}
                    </MotiView>
                </View>

                {/* ── MODO RECIBIR CANCIONES ── */}
                <MotiView
                    from={{ opacity: 0, translateY: 15 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'spring', delay: 400 }}
                    style={styles.modeSection}
                >
                    <View style={styles.modeHeader}>
                        <View>
                            <ThemedText style={styles.modeTitle}>MODO RECIBIR CANCIONES</ThemedText>
                            <ThemedText style={styles.modeSubtitle}>
                                {isReceivingSongs ? 'Abierto a peticiones' : 'Cerrado a peticiones'}
                            </ThemedText>
                        </View>
                        <Switch
                            trackColor={{ false: '#333', true: 'rgba(204,255,0,0.3)' }}
                            thumbColor={isReceivingSongs ? ZyncTheme.colors.primary : '#ccc'}
                            ios_backgroundColor="#333"
                            onValueChange={toggleReceivingSongs}
                            value={isReceivingSongs}
                            style={{ transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }] }}
                        />
                    </View>

                    {/* Input Field */}
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Escribir mensaje a la pista..."
                            placeholderTextColor="#666"
                            value={trackMessage}
                            onChangeText={setTrackMessage}
                        />
                        <TouchableOpacity
                            style={styles.sendButton}
                            activeOpacity={0.8}
                            onPress={handleSendBroadcast}
                            disabled={isSending || !trackMessage.trim()}
                        >
                            {isSending
                                ? <ActivityIndicator size="small" color="#000" />
                                : <Ionicons name="send" size={18} color="#000" />
                            }
                        </TouchableOpacity>
                    </View>
                    <ThemedText style={styles.disclaimerText}>
                        EL MENSAJE SE MOSTRARÁ EN LA PANTALLA PRINCIPAL
                    </ThemedText>
                </MotiView>

                {/* ── COLA DE PETICIONES ── */}
                <MotiView
                    from={{ opacity: 0, translateY: 15 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'spring', delay: 500 }}
                    style={styles.queueSection}
                >
                    <View style={styles.queueHeader}>
                        <View style={styles.queueTitleRow}>
                            <ThemedText style={styles.queueTitle}>Cola de Peticiones</ThemedText>
                            <ThemedText style={styles.queueSubtitle}>(Top 3)</ThemedText>
                        </View>
                        <TouchableOpacity
                            onPress={() => router.push('/(business)/requests')}
                            activeOpacity={0.7}
                        >
                            <ThemedText style={styles.seeAllText}>VER TODO</ThemedText>
                        </TouchableOpacity>
                    </View>

                    {topRequests.length === 0 && (
                        <View style={styles.emptyRequests}>
                            <Ionicons name="musical-notes-outline" size={32} color="#444" />
                            <ThemedText style={styles.emptyRequestsText}>Sin peticiones pendientes</ThemedText>
                        </View>
                    )}
                    {topRequests.map((req, index) => (
                        <MotiView
                            key={req.id}
                            from={{ opacity: 0, translateX: -20 }}
                            animate={{ opacity: 1, translateX: 0 }}
                            transition={{ type: 'timing', delay: 600 + index * 100 }}
                            style={styles.requestCard}
                        >
                            <View style={styles.requestImageContainer}>
                                {req.albumCover
                                    ? <Image source={{ uri: req.albumCover }} style={styles.requestImage} contentFit="cover" />
                                    : <Ionicons name="musical-note" size={24} color="#666" />
                                }
                            </View>
                            <View style={styles.requestInfo}>
                                <ThemedText style={styles.requestName} numberOfLines={1}>
                                    {req.trackName}
                                </ThemedText>
                                <ThemedText style={styles.requestTip}>
                                    {req.artistName}
                                </ThemedText>
                            </View>

                            <View style={styles.requestActions}>
                                <TouchableOpacity
                                    style={styles.rejectButton}
                                    activeOpacity={0.7}
                                    onPress={() => updateStatus(req.id, 'rejected')}
                                >
                                    <Ionicons name="close" size={20} color="#ddd" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.acceptButton}
                                    activeOpacity={0.7}
                                    onPress={() => updateStatus(req.id, 'accepted')}
                                >
                                    <Ionicons name="checkmark" size={20} color={ZyncTheme.colors.primary} />
                                </TouchableOpacity>
                            </View>
                        </MotiView>
                    ))}
                </MotiView>
                
                {/* Extra spacing for bottom tabs */}
                <View style={{ height: 80 }} />
            </ScrollView>
            </VideoBackground>
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        paddingTop: 60, // Account for top inset/status bar since noPadding is applied
        paddingHorizontal: 20,
    },
    /* Header */
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    settingsIcon: {
        padding: 4,
    },
    avatarWrapper: {
        position: 'relative',
        width: 50,
        height: 50,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: ZyncTheme.colors.primary,
        zIndex: 2,
    },
    avatarFallback: {
        backgroundColor: ZyncTheme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarGlow: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 16,
        backgroundColor: ZyncTheme.colors.primary,
        opacity: 0.3,
        transform: [{ scale: 1.15 }],
        zIndex: 1,
    },
    avatarStatusDot: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 14,
        height: 14,
        borderRadius: 7,
        backgroundColor: ZyncTheme.colors.primary,
        borderWidth: 2,
        borderColor: ZyncTheme.colors.background,
        zIndex: 3,
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(204, 255, 0, 0.1)',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 20,
        gap: 6,
    },
    liveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: ZyncTheme.colors.primary,
    },
    liveText: {
        color: ZyncTheme.colors.primary,
        fontSize: 11,
        fontWeight: 'bold',
        letterSpacing: 1,
    },

    /* Metrics Cards */
    metricsRow: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 20,
    },
    metricCard: {
        flex: 1,
        backgroundColor: '#121212', // Slightly lighter than background
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    metricHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    metricTitle: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1.2,
        color: ZyncTheme.colors.textSecondary,
    },
    metricAmount: {
        fontSize: 24,
        fontWeight: '800',
        color: 'white',
        marginBottom: 6,
    },
    metricChange: {
        fontSize: 12,
        fontWeight: '600',
        color: ZyncTheme.colors.primary,
    },
    requestsRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 10,
    },
    requestsCurrent: {
        fontSize: 24,
        fontWeight: '800',
        color: 'white',
    },
    requestsTotal: {
        fontSize: 12,
        color: ZyncTheme.colors.textSecondary,
    },
    progressBarContainer: {
        height: 4,
        backgroundColor: '#2a2a2a',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: ZyncTheme.colors.primary,
        borderRadius: 2,
    },

    /* Mode Section */
    modeSection: {
        backgroundColor: '#121212',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        marginBottom: 30,
    },
    modeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modeTitle: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1.2,
        color: ZyncTheme.colors.primary,
        marginBottom: 4,
    },
    modeSubtitle: {
        fontSize: 14,
        color: 'white',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1a1a1a',
        borderRadius: 8,
        paddingRight: 8,
        marginBottom: 12,
    },
    input: {
        flex: 1,
        color: 'white',
        fontSize: 14,
        paddingVertical: 14,
        paddingHorizontal: 16,
    },
    sendButton: {
        width: 36,
        height: 36,
        borderRadius: 4,
        backgroundColor: ZyncTheme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    disclaimerText: {
        fontSize: 10,
        color: '#666',
        letterSpacing: 0.5,
        textAlign: 'center',
    },

    /* Queue Section */
    queueSection: {
        marginBottom: 20,
    },
    queueHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 16,
    },
    queueTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    queueTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: 'white',
    },
    queueSubtitle: {
        fontSize: 14,
        color: ZyncTheme.colors.textSecondary,
    },
    seeAllText: {
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
        color: ZyncTheme.colors.primary,
    },
    requestCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#121212',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    requestImageContainer: {
        width: 48,
        height: 48,
        borderRadius: 6,
        backgroundColor: '#222',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        overflow: 'hidden',
    },
    requestImage: {
        width: '100%',
        height: '100%',
    },
    requestInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    requestName: {
        fontSize: 15,
        fontWeight: '600',
        color: 'white',
        marginBottom: 4,
    },
    requestTip: {
        fontSize: 13,
        fontWeight: '600',
        color: ZyncTheme.colors.primary,
    },
    requestActions: {
        flexDirection: 'row',
        gap: 12,
        marginLeft: 10,
    },
    rejectButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#1a1a1a',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    acceptButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#1a1a1a',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(204,255,0,0.3)',
    },
    emptyRequests: {
        alignItems: 'center',
        paddingVertical: 24,
        gap: 8,
    },
    emptyRequestsText: {
        fontSize: 13,
        color: ZyncTheme.colors.textSecondary,
    },
});
