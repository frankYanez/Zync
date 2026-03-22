import { CyberCard } from '@/components/CyberCard';
import { ScreenLayout } from '@/components/ScreenLayout';
import { ThemedText } from '@/components/themed-text';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

const CARD_ICON: Record<string, any> = {
    visa: 'card',
    mastercard: 'card',
    amex: 'card',
};

export default function PaymentMethodsScreen() {
    const router = useRouter();

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
                    <View style={styles.pointsRow}>
                        <Ionicons name="star" size={28} color={ZyncTheme.colors.primary} />
                        <View>
                            <ThemedText style={styles.pointsLabel}>Zync Points</ThemedText>
                            <ThemedText style={styles.pointsHint}>Acumulá puntos en cada pedido</ThemedText>
                        </View>
                    </View>
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
    pointsLabel: { fontSize: 16, fontWeight: '700', color: 'white' },
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
