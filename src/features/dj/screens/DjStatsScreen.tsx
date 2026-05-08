import { ScreenLayout } from '@/components/ScreenLayout';
import { ThemedText } from '@/components/themed-text';
import { useDjProfile } from '@/hooks/useDjProfile';
import { useDjStats } from '@/hooks/useDjStats';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';

interface StatCardProps {
    icon: string;
    iconColor: string;
    label: string;
    value: string;
    subValue?: string;
}

function StatCard({ icon, iconColor, label, value, subValue }: StatCardProps) {
    return (
        <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: iconColor + '20' }]}>
                <Ionicons name={icon as any} size={22} color={iconColor} />
            </View>
            <ThemedText style={styles.statLabel}>{label}</ThemedText>
            <ThemedText style={styles.statValue}>{value}</ThemedText>
            {subValue && <ThemedText style={styles.statSubValue}>{subValue}</ThemedText>}
        </View>
    );
}

export default function DjStatsScreen() {
    const router = useRouter();
    const { profile } = useDjProfile();
    const { stats, isLoading } = useDjStats(profile?.id);

    if (isLoading || !stats) {
        return (
            <ScreenLayout style={styles.loading} noPadding>
                <ActivityIndicator size="large" color={ZyncTheme.colors.primary} />
            </ScreenLayout>
        );
    }

    const formatCurrency = (value: number | undefined) => {
        return '$' + (value || 0).toLocaleString('es-AR', { minimumFractionDigits: 0 });
    };

    return (
        <ScreenLayout style={styles.container} noPadding>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <ThemedText style={styles.title}>Mis Estadísticas</ThemedText>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.earningsSection}>
                    <View style={styles.earningsCard}>
                        <View style={styles.earningsHeader}>
                            <Ionicons name="trending-up" size={24} color={ZyncTheme.colors.primary} />
                            <ThemedText style={styles.earningsLabel}>GANANCIAS TOTALES</ThemedText>
                        </View>
                        <ThemedText style={styles.earningsValue}>
                            {formatCurrency(stats.totalEarnings)}
                        </ThemedText>
                        <ThemedText style={styles.earningsSubtext}>
                            De {stats.activeEvents?.length || 0} eventos activos
                        </ThemedText>
                    </View>
                </View>

                <ThemedText style={styles.sectionTitle}>RESUMEN</ThemedText>
                <View style={styles.statsGrid}>
                    <StatCard
                        icon="musical-notes"
                        iconColor="#A855F7"
                        label="Solicitudes"
                        value={String(stats.totalRequests)}
                        subValue={`${stats.acceptedRequests || 0} aceptadas`}
                    />
                    <StatCard
                        icon="checkmark-circle"
                        iconColor="#22C55E"
                        label="Aceptadas"
                        value={String(stats.acceptedRequests)}
                        subValue={`${stats.totalRequests ? Math.round((stats.acceptedRequests / stats.totalRequests) * 100) : 0}% tasa`}
                    />
                    <StatCard
                        icon="close-circle"
                        iconColor="#FF4466"
                        label="Rechazadas"
                        value={String(stats.rejectedRequests)}
                        subValue={`${stats.totalRequests ? Math.round((stats.rejectedRequests / stats.totalRequests) * 100) : 0}% tasa`}
                    />
                    <StatCard
                        icon="time"
                        iconColor="#FBB724"
                        label="Pendientes"
                        value={String(stats.pendingRequests)}
                    />
                </View>

                {stats.activeEvents && stats.activeEvents.length > 0 && (
                    <>
                        <ThemedText style={styles.sectionTitle}>PRÓXIMOS EVENTOS</ThemedText>
                        <View style={styles.eventsList}>
                            {stats.activeEvents.map((event) => (
                                <View key={event.id} style={styles.eventItem}>
                                    <View style={styles.eventDot} />
                                    <View style={styles.eventInfo}>
                                        <ThemedText style={styles.eventName}>{event.name}</ThemedText>
                                        <ThemedText style={styles.eventDate}>
                                            {event.startsAt ? new Date(event.startsAt).toLocaleDateString('es-AR', {
                                                day: 'numeric',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            }) : 'Fecha no disponible'}
                                        </ThemedText>
                                    </View>
                                    <View style={styles.eventRevenue}>
                                        <ThemedText style={styles.eventRevenueLabel}>Ingreso</ThemedText>
                                        <ThemedText style={styles.eventRevenueValue}>
                                            {formatCurrency(event.revenue || 0)}
                                        </ThemedText>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </>
                )}
            </View>
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: ZyncTheme.spacing.m, paddingTop: ZyncTheme.spacing.l, paddingBottom: ZyncTheme.spacing.m,
        borderBottomWidth: 1, borderBottomColor: ZyncTheme.colors.border,
    },
    backButton: { padding: 4 },
    title: { fontSize: 20, fontWeight: '800', color: 'white' },
    content: { padding: ZyncTheme.spacing.m },
    earningsSection: { marginBottom: ZyncTheme.spacing.l },
    earningsCard: {
        backgroundColor: ZyncTheme.colors.card,
        borderRadius: ZyncTheme.borderRadius.l,
        padding: ZyncTheme.spacing.l,
        borderWidth: 1,
        borderColor: ZyncTheme.colors.border,
    },
    earningsHeader: { flexDirection: 'row', alignItems: 'center', gap: ZyncTheme.spacing.s, marginBottom: ZyncTheme.spacing.m },
    earningsLabel: { fontSize: 11, fontWeight: '700', color: ZyncTheme.colors.textSecondary, letterSpacing: 1 },
    earningsValue: { fontSize: 36, fontWeight: '800', color: ZyncTheme.colors.primary, marginBottom: 4 },
    earningsSubtext: { fontSize: 13, color: ZyncTheme.colors.textSecondary },
    sectionTitle: {
        fontSize: 11, fontWeight: '700', color: ZyncTheme.colors.textSecondary,
        letterSpacing: 1.5, marginBottom: ZyncTheme.spacing.m, marginTop: ZyncTheme.spacing.s,
    },
    statsGrid: {
        flexDirection: 'row', flexWrap: 'wrap', gap: ZyncTheme.spacing.m,
    },
    statCard: {
        flex: 1, minWidth: '45%',
        backgroundColor: ZyncTheme.colors.card,
        borderRadius: ZyncTheme.borderRadius.m,
        padding: ZyncTheme.spacing.m,
        borderWidth: 1, borderColor: ZyncTheme.colors.border,
    },
    statIcon: {
        width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: ZyncTheme.spacing.s,
    },
    statLabel: { fontSize: 12, color: ZyncTheme.colors.textSecondary, marginBottom: 4 },
    statValue: { fontSize: 24, fontWeight: '800', color: 'white' },
    statSubValue: { fontSize: 11, color: ZyncTheme.colors.textSecondary, marginTop: 2 },
    eventsList: { gap: ZyncTheme.spacing.s },
    eventItem: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: ZyncTheme.colors.card,
        borderRadius: ZyncTheme.borderRadius.m, padding: ZyncTheme.spacing.m,
        borderWidth: 1, borderColor: ZyncTheme.colors.border,
    },
    eventDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: ZyncTheme.colors.primary, marginRight: ZyncTheme.spacing.m },
    eventInfo: { flex: 1 },
    eventName: { fontSize: 14, fontWeight: '600', color: 'white' },
    eventDate: { fontSize: 12, color: ZyncTheme.colors.textSecondary, marginTop: 2 },
    eventRevenue: { alignItems: 'flex-end' },
    eventRevenueLabel: { fontSize: 10, color: ZyncTheme.colors.textSecondary, textTransform: 'uppercase' },
    eventRevenueValue: { fontSize: 14, fontWeight: '700', color: ZyncTheme.colors.primary },
});