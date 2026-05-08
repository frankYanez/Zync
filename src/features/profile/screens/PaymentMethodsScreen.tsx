import { CyberCard } from '@/components/CyberCard';
import { ScreenLayout } from '@/components/ScreenLayout';
import { ThemedText } from '@/components/themed-text';
import { getBalance, WalletBalance } from '@/features/wallet/services/wallet.service';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function PaymentMethodsScreen() {
    const router = useRouter();
    const [balance, setBalance] = useState<WalletBalance | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getBalance()
            .then(setBalance)
            .catch(() => {})
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <ScreenLayout style={styles.container} noPadding>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={ZyncTheme.colors.text} />
                </TouchableOpacity>
                <ThemedText style={styles.title}>Métodos de pago</ThemedText>
            </View>

            <View style={styles.content}>
                {/* Zync Points balance */}
                <ThemedText style={styles.sectionLabel}>TU SALDO</ThemedText>
                <CyberCard style={styles.pointsCard}>
                    {isLoading ? (
                        <ActivityIndicator size="small" color={ZyncTheme.colors.primary} />
                    ) : (
                        <View style={styles.pointsRow}>
                            <View style={styles.pointsIcon}>
                                <Ionicons name="star" size={24} color={ZyncTheme.colors.primary} />
                            </View>
                            <View style={styles.pointsInfo}>
                                <ThemedText style={styles.pointsLabel}>Zync Points</ThemedText>
                                <ThemedText style={styles.pointsValue}>
                                    {balance?.zyncPoints?.toLocaleString('es-AR') ?? '0'} puntos
                                </ThemedText>
                                <ThemedText style={styles.pointsHint}>
                                    Acumulá puntos en cada pedido
                                </ThemedText>
                            </View>
                        </View>
                    )}
                </CyberCard>

                {/* Wallet balance */}
                <ThemedText style={styles.sectionLabel}>BILLETERA</ThemedText>
                <CyberCard style={styles.pointsCard}>
                    {isLoading ? (
                        <ActivityIndicator size="small" color={ZyncTheme.colors.primary} />
                    ) : (
                        <View style={styles.pointsRow}>
                            <View style={[styles.pointsIcon, { backgroundColor: ZyncTheme.colors.primary + '20' }]}>
                                <Ionicons name="wallet" size={24} color={ZyncTheme.colors.primary} />
                            </View>
                            <View style={styles.pointsInfo}>
                                <ThemedText style={styles.pointsLabel}>Saldo disponible</ThemedText>
                                <ThemedText style={styles.pointsValue}>
                                    ${(balance?.balance ?? 0).toLocaleString('es-AR')}
                                </ThemedText>
                                <ThemedText style={styles.pointsHint}>
                                    Usalo para compras en eventos
                                </ThemedText>
                            </View>
                        </View>
                    )}
                </CyberCard>

                {/* Payment methods — coming soon */}
                <ThemedText style={styles.sectionLabel}>TARJETAS</ThemedText>
                <CyberCard style={styles.comingSoonCard}>
                    <View style={styles.comingSoon}>
                        <Ionicons name="construct-outline" size={36} color={ZyncTheme.colors.textSecondary} />
                        <ThemedText style={styles.comingSoonTitle}>Próximamente</ThemedText>
                        <ThemedText style={styles.comingSoonDesc}>
                            La gestión de tarjetas de crédito y débito estará disponible en una próxima actualización.
                        </ThemedText>
                    </View>
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
    pointsCard: { padding: ZyncTheme.spacing.m },
    pointsRow: { flexDirection: 'row', alignItems: 'center', gap: ZyncTheme.spacing.m },
    pointsIcon: {
        width: 48, height: 48, borderRadius: 12,
        backgroundColor: 'rgba(204,255,0,0.1)',
        justifyContent: 'center', alignItems: 'center',
    },
    pointsInfo: { flex: 1 },
    pointsLabel: { fontSize: 14, fontWeight: '600', color: ZyncTheme.colors.textSecondary },
    pointsValue: { fontSize: 22, fontWeight: '800', color: ZyncTheme.colors.primary, marginTop: 2 },
    pointsHint: { fontSize: 12, color: ZyncTheme.colors.textSecondary, marginTop: 2 },
    comingSoonCard: { padding: ZyncTheme.spacing.xl },
    comingSoon: { alignItems: 'center', gap: ZyncTheme.spacing.m },
    comingSoonTitle: { fontSize: 18, fontWeight: '700', color: ZyncTheme.colors.textSecondary },
    comingSoonDesc: {
        fontSize: 14,
        color: ZyncTheme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
});
