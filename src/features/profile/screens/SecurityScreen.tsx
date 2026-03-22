import { CyberCard } from '@/components/CyberCard';
import { ScreenLayout } from '@/components/ScreenLayout';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function SecurityScreen() {
    const router = useRouter();
    const { logout } = useAuth();

    const handleDeleteAccount = () => {
        Alert.alert(
            'Eliminar cuenta',
            'Esta acción es irreversible. Se eliminarán todos tus datos, pedidos, chats y perfil de Zync.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar mi cuenta',
                    style: 'destructive',
                    onPress: () => {
                        Alert.alert(
                            '¿Estás completamente seguro?',
                            'Escribí "ELIMINAR" para confirmar.',
                            [
                                { text: 'Cancelar', style: 'cancel' },
                                {
                                    text: 'Confirmar',
                                    style: 'destructive',
                                    onPress: async () => {
                                        await logout();
                                        router.replace('/(auth)');
                                    },
                                },
                            ],
                        );
                    },
                },
            ],
        );
    };

    return (
        <ScreenLayout style={styles.container} noPadding>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={ZyncTheme.colors.text} />
                </TouchableOpacity>
                <ThemedText style={styles.title}>Seguridad</ThemedText>
            </View>

            <View style={styles.content}>
                {/* Password section */}
                <ThemedText style={styles.sectionLabel}>CONTRASEÑA</ThemedText>
                <CyberCard style={styles.card}>
                    <TouchableOpacity
                        style={styles.row}
                        onPress={() => router.push('/profile/change-password' as any)}
                    >
                        <View style={styles.rowLeft}>
                            <Ionicons name="lock-closed-outline" size={20} color={ZyncTheme.colors.primary} />
                            <View>
                                <ThemedText style={styles.rowLabel}>Cambiar contraseña</ThemedText>
                                <ThemedText style={styles.rowDesc}>Actualizá tu contraseña actual</ThemedText>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={ZyncTheme.colors.textSecondary} />
                    </TouchableOpacity>
                </CyberCard>

                {/* Session section */}
                <ThemedText style={styles.sectionLabel}>SESIÓN ACTIVA</ThemedText>
                <CyberCard style={styles.card}>
                    <View style={styles.sessionRow}>
                        <View style={styles.sessionIcon}>
                            <Ionicons name="phone-portrait-outline" size={22} color={ZyncTheme.colors.textSecondary} />
                        </View>
                        <View style={styles.rowText}>
                            <ThemedText style={styles.rowLabel}>Este dispositivo</ThemedText>
                            <ThemedText style={styles.rowDesc}>Sesión activa ahora</ThemedText>
                        </View>
                        <View style={styles.activeDot} />
                    </View>
                </CyberCard>

                {/* Danger zone */}
                <ThemedText style={[styles.sectionLabel, { color: ZyncTheme.colors.error + 'CC' }]}>ZONA DE PELIGRO</ThemedText>
                <CyberCard style={[styles.card, styles.dangerCard]}>
                    <TouchableOpacity style={styles.row} onPress={handleDeleteAccount}>
                        <View style={styles.rowLeft}>
                            <Ionicons name="trash-outline" size={20} color={ZyncTheme.colors.error} />
                            <View>
                                <ThemedText style={[styles.rowLabel, { color: ZyncTheme.colors.error }]}>Eliminar cuenta</ThemedText>
                                <ThemedText style={styles.rowDesc}>Elimina permanentemente tu cuenta y datos</ThemedText>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={ZyncTheme.colors.error} />
                    </TouchableOpacity>
                </CyberCard>
            </View>
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: ZyncTheme.spacing.m,
        paddingTop: ZyncTheme.spacing.l,
        paddingBottom: ZyncTheme.spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.08)',
    },
    backButton: { marginRight: 16 },
    title: { fontSize: 22, fontWeight: 'bold', color: 'white' },
    content: { padding: ZyncTheme.spacing.m, gap: ZyncTheme.spacing.s },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: ZyncTheme.colors.textSecondary,
        letterSpacing: 1,
        marginTop: ZyncTheme.spacing.m,
        marginBottom: ZyncTheme.spacing.xs,
    },
    card: { padding: 0, overflow: 'hidden' },
    dangerCard: { borderColor: ZyncTheme.colors.error + '44' },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: ZyncTheme.spacing.m,
    },
    rowLeft: { flexDirection: 'row', alignItems: 'center', gap: ZyncTheme.spacing.m, flex: 1 },
    rowText: { flex: 1 },
    rowLabel: { fontSize: 15, fontWeight: '600', color: 'white' },
    rowDesc: { fontSize: 12, color: ZyncTheme.colors.textSecondary, marginTop: 2 },
    sessionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: ZyncTheme.spacing.m,
        gap: ZyncTheme.spacing.m,
    },
    sessionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: ZyncTheme.colors.card,
        borderWidth: 1,
        borderColor: ZyncTheme.colors.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#22C55E',
    },
});
