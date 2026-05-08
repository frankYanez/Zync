import { ScreenLayout } from '@/components/ScreenLayout';
import { ThemedText } from '@/components/themed-text';
import { useDjProfile } from '@/hooks/useDjProfile';
import { setDjLiveMode } from '@/features/dj/services/dj.service';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';

export default function DjLiveModeScreen() {
    const router = useRouter();
    const { profile } = useDjProfile();
    const [isLive, setIsLive] = useState(profile?.isLive ?? false);
    const [isLoading, setIsLoading] = useState(false);

    const handleToggleLive = async (value: boolean) => {
        setIsLoading(true);
        try {
            await setDjLiveMode(value);
            setIsLive(value);
        } catch (e: any) {
            const msg = e?.response?.data?.message;
            Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg || 'No se pudo actualizar el modo.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScreenLayout style={styles.container} noPadding>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <ThemedText style={styles.title}>Modo En Vivo</ThemedText>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.mainCard}>
                    <View style={styles.statusRow}>
                        <View style={[styles.statusIcon, { backgroundColor: isLive ? '#22C55E20' : ZyncTheme.colors.card }]}>
                            <Ionicons
                                name={isLive ? 'wifi' : 'wifi-outline'}
                                size={32}
                                color={isLive ? '#22C55E' : ZyncTheme.colors.textSecondary}
                            />
                        </View>
                        <View style={styles.statusInfo}>
                            <ThemedText style={styles.statusTitle}>
                                {isLive ? 'Estás en vivo' : 'Modo en espera'}
                            </ThemedText>
                            <ThemedText style={styles.statusSubtitle}>
                                {isLive ? 'Los usuarios pueden encontrarte' : 'Actívalo para recibir song requests'}
                            </ThemedText>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.toggleBtn, isLive && styles.toggleBtnActive]}
                        onPress={() => !isLoading && handleToggleLive(!isLive)}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#000" />
                        ) : (
                            <>
                                <View style={[styles.toggleDot, isLive && styles.toggleDotActive]} />
                                <ThemedText style={[styles.toggleBtnText, isLive && styles.toggleBtnTextActive]}>
                                    {isLive ? 'DESACTIVAR' : 'ACTIVAR'}
                                </ThemedText>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.infoSection}>
                    <ThemedText style={styles.sectionTitle}>¿CÓMO FUNCIONA?</ThemedText>
                    
                    <View style={styles.infoItem}>
                        <View style={[styles.infoIcon, { backgroundColor: '#A855F720' }]}>
                            <Ionicons name="musical-notes" size={16} color="#A855F7" />
                        </View>
                        <View style={styles.infoContent}>
                            <ThemedText style={styles.infoLabel}>Song Requests</ThemedText>
                            <ThemedText style={styles.infoText}>
                                Cuando estás en vivo, los usuarios pueden enviarte peticiones de canciones directamente.
                            </ThemedText>
                        </View>
                    </View>

                    <View style={styles.infoItem}>
                        <View style={[styles.infoIcon, { backgroundColor: '#00D4FF20' }]}>
                            <Ionicons name="location" size={16} color="#00D4FF" />
                        </View>
                        <View style={styles.infoContent}>
                            <ThemedText style={styles.infoLabel}>Visibilidad</ThemedText>
                            <ThemedText style={styles.infoText}>
                                Aparece en la sección "DJs en vivo" para que los usuarios te encuentren fácilmente.
                            </ThemedText>
                        </View>
                    </View>

                    <View style={styles.infoItem}>
                        <View style={[styles.infoIcon, { backgroundColor: '#22C55E20' }]}>
                            <Ionicons name="notifications" size={16} color="#22C55E" />
                        </View>
                        <View style={styles.infoContent}>
                            <ThemedText style={styles.infoLabel}>Notificaciones</ThemedText>
                            <ThemedText style={styles.infoText}>
                                Recibes alertas en tiempo real cuando alguien te envía una petición.
                            </ThemedText>
                        </View>
                    </View>
                </View>

                <View style={styles.tipCard}>
                    <Ionicons name="bulb" size={20} color={ZyncTheme.colors.primary} />
                    <ThemedText style={styles.tipText}>
                        💡 Mantén el modo activo durante tus sets para maximizar tu exposición y aumentar tus ganancias.
                    </ThemedText>
                </View>
            </View>
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: ZyncTheme.spacing.m, paddingTop: ZyncTheme.spacing.l, paddingBottom: ZyncTheme.spacing.m,
        borderBottomWidth: 1, borderBottomColor: ZyncTheme.colors.border,
    },
    backButton: { padding: 4 },
    title: { fontSize: 20, fontWeight: '800', color: 'white' },
    content: { padding: ZyncTheme.spacing.m },
    mainCard: {
        backgroundColor: ZyncTheme.colors.card,
        borderRadius: ZyncTheme.borderRadius.l,
        padding: ZyncTheme.spacing.l,
        borderWidth: 1,
        borderColor: ZyncTheme.colors.border,
    },
    statusRow: { flexDirection: 'row', alignItems: 'center', marginBottom: ZyncTheme.spacing.l },
    statusIcon: {
        width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: ZyncTheme.colors.border,
    },
    statusInfo: { flex: 1, marginLeft: ZyncTheme.spacing.m },
    statusTitle: { fontSize: 18, fontWeight: '700', color: 'white', marginBottom: 4 },
    statusSubtitle: { fontSize: 13, color: ZyncTheme.colors.textSecondary },
    toggleBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: ZyncTheme.spacing.s,
        backgroundColor: ZyncTheme.colors.primary, borderRadius: 12, paddingVertical: 16,
    },
    toggleBtnActive: { backgroundColor: '#22C55E' },
    toggleDot: {
        width: 12, height: 12, borderRadius: 6, backgroundColor: 'rgba(0,0,0,0.3)',
    },
    toggleDotActive: { backgroundColor: 'rgba(255,255,255,0.9)' },
    toggleBtnText: { fontSize: 14, fontWeight: '800', color: '#000', letterSpacing: 1 },
    toggleBtnTextActive: { color: '#fff' },
    infoSection: { marginTop: ZyncTheme.spacing.xl },
    sectionTitle: {
        fontSize: 11, fontWeight: '700', color: ZyncTheme.colors.textSecondary,
        letterSpacing: 1.5, marginBottom: ZyncTheme.spacing.m,
    },
    infoItem: { flexDirection: 'row', marginBottom: ZyncTheme.spacing.m },
    infoIcon: {
        width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center',
    },
    infoContent: { flex: 1, marginLeft: ZyncTheme.spacing.m },
    infoLabel: { fontSize: 14, fontWeight: '600', color: 'white', marginBottom: 2 },
    infoText: { fontSize: 12, color: ZyncTheme.colors.textSecondary, lineHeight: 18 },
    tipCard: {
        flexDirection: 'row', alignItems: 'flex-start', gap: ZyncTheme.spacing.s,
        backgroundColor: ZyncTheme.colors.primary + '15',
        borderRadius: ZyncTheme.borderRadius.m,
        padding: ZyncTheme.spacing.m,
        marginTop: ZyncTheme.spacing.l,
        borderWidth: 1,
        borderColor: ZyncTheme.colors.primary + '30',
    },
    tipText: { flex: 1, fontSize: 13, color: ZyncTheme.colors.textSecondary, lineHeight: 20 },
});