import { CyberCard } from '@/components/CyberCard';
import { ScreenLayout } from '@/components/ScreenLayout';
import { ThemedText } from '@/components/themed-text';
import { Order, getOrderById } from '@/features/wallet/services/order.service';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const STATUS_LABEL: Record<Order['status'], string> = {
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    ready: 'Listo para retirar',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
};

const STATUS_COLOR: Record<Order['status'], string> = {
    pending: '#F59E0B',
    confirmed: ZyncTheme.colors.primary,
    ready: '#22C55E',
    delivered: ZyncTheme.colors.textSecondary,
    cancelled: ZyncTheme.colors.error,
};

const STEPS: Order['status'][] = ['pending', 'confirmed', 'ready', 'delivered'];

export default function OrderDetailScreen() {
    const router = useRouter();
    const { orderId } = useLocalSearchParams<{ orderId: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!orderId) return;
        getOrderById(orderId)
            .then(setOrder)
            .catch(e => console.error('Failed to load order', e))
            .finally(() => setLoading(false));
    }, [orderId]);

    const stepIndex = order ? STEPS.indexOf(order.status) : -1;

    return (
        <ScreenLayout style={styles.container} noPadding>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={ZyncTheme.colors.text} />
                </TouchableOpacity>
                <ThemedText style={styles.title}>Detalle del pedido</ThemedText>
            </View>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={ZyncTheme.colors.primary} />
                </View>
            ) : !order ? (
                <View style={styles.centered}>
                    <ThemedText style={styles.emptyText}>No se encontró el pedido</ThemedText>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                    {/* Order ID + status */}
                    <View style={styles.topRow}>
                        <View>
                            <ThemedText style={styles.orderId}>#{order.id.slice(-6).toUpperCase()}</ThemedText>
                            {order.establishmentName && (
                                <ThemedText style={styles.establishment}>{order.establishmentName}</ThemedText>
                            )}
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[order.status] + '22', borderColor: STATUS_COLOR[order.status] }]}>
                            <ThemedText style={[styles.statusText, { color: STATUS_COLOR[order.status] }]}>
                                {STATUS_LABEL[order.status]}
                            </ThemedText>
                        </View>
                    </View>

                    {/* Progress tracker */}
                    {order.status !== 'cancelled' && (
                        <CyberCard style={styles.progressCard}>
                            <View style={styles.progressRow}>
                                {STEPS.map((step, i) => {
                                    const done = i <= stepIndex;
                                    const color = done ? STATUS_COLOR[step] : ZyncTheme.colors.border;
                                    return (
                                        <React.Fragment key={step}>
                                            <View style={styles.stepCol}>
                                                <View style={[styles.stepDot, { backgroundColor: color, borderColor: color }]}>
                                                    {done && <Ionicons name="checkmark" size={10} color="#000" />}
                                                </View>
                                                <ThemedText style={[styles.stepLabel, { color: done ? 'white' : ZyncTheme.colors.textSecondary }]}>
                                                    {STATUS_LABEL[step]}
                                                </ThemedText>
                                            </View>
                                            {i < STEPS.length - 1 && (
                                                <View style={[styles.stepLine, { backgroundColor: i < stepIndex ? ZyncTheme.colors.primary : ZyncTheme.colors.border }]} />
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </View>
                        </CyberCard>
                    )}

                    {/* Items */}
                    <ThemedText style={styles.sectionTitle}>PRODUCTOS</ThemedText>
                    <CyberCard style={styles.itemsCard}>
                        {order.items.map((item, i) => (
                            <View key={item.id} style={[styles.itemRow, i > 0 && styles.itemBorder]}>
                                <View style={styles.itemLeft}>
                                    <ThemedText style={styles.itemQty}>{item.quantity}×</ThemedText>
                                    <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                                </View>
                                <ThemedText style={styles.itemPrice}>${item.subtotal.toFixed(2)}</ThemedText>
                            </View>
                        ))}
                    </CyberCard>

                    {/* Summary */}
                    <ThemedText style={styles.sectionTitle}>RESUMEN</ThemedText>
                    <CyberCard style={styles.summaryCard}>
                        <View style={styles.summaryRow}>
                            <ThemedText style={styles.summaryLabel}>Subtotal</ThemedText>
                            <ThemedText style={styles.summaryValue}>${order.subtotal.toFixed(2)}</ThemedText>
                        </View>
                        {order.discount > 0 && (
                            <View style={styles.summaryRow}>
                                <ThemedText style={[styles.summaryLabel, { color: '#22C55E' }]}>Descuento</ThemedText>
                                <ThemedText style={[styles.summaryValue, { color: '#22C55E' }]}>-${order.discount.toFixed(2)}</ThemedText>
                            </View>
                        )}
                        <View style={[styles.summaryRow, styles.totalRow]}>
                            <ThemedText style={styles.totalLabel}>Total</ThemedText>
                            <ThemedText style={styles.totalValue}>${order.total.toFixed(2)}</ThemedText>
                        </View>
                    </CyberCard>

                    <ThemedText style={styles.dateText}>
                        Pedido realizado el {new Date(order.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </ThemedText>
                </ScrollView>
            )}
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
    scroll: { padding: ZyncTheme.spacing.m, paddingBottom: 60, gap: ZyncTheme.spacing.m },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { color: ZyncTheme.colors.textSecondary },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    orderId: { fontSize: 22, fontWeight: '800', color: 'white' },
    establishment: { fontSize: 13, color: ZyncTheme.colors.textSecondary, marginTop: 2 },
    statusBadge: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4 },
    statusText: { fontSize: 13, fontWeight: '600' },
    progressCard: { padding: ZyncTheme.spacing.m },
    progressRow: { flexDirection: 'row', alignItems: 'center' },
    stepCol: { alignItems: 'center', gap: 4 },
    stepDot: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepLabel: { fontSize: 9, textAlign: 'center', maxWidth: 52 },
    stepLine: { flex: 1, height: 2, marginBottom: 14 },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: ZyncTheme.colors.textSecondary,
        letterSpacing: 1,
        marginBottom: -ZyncTheme.spacing.s,
    },
    itemsCard: { padding: ZyncTheme.spacing.m, gap: 0 },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
    itemBorder: { borderTopWidth: 1, borderTopColor: ZyncTheme.colors.border },
    itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
    itemQty: { fontSize: 14, fontWeight: '700', color: ZyncTheme.colors.primary, width: 28 },
    itemName: { fontSize: 14, color: 'white', flex: 1 },
    itemPrice: { fontSize: 14, fontWeight: '600', color: 'white' },
    summaryCard: { padding: ZyncTheme.spacing.m, gap: ZyncTheme.spacing.s },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
    summaryLabel: { fontSize: 14, color: ZyncTheme.colors.textSecondary },
    summaryValue: { fontSize: 14, color: 'white' },
    totalRow: { borderTopWidth: 1, borderTopColor: ZyncTheme.colors.border, paddingTop: ZyncTheme.spacing.s, marginTop: ZyncTheme.spacing.xs },
    totalLabel: { fontSize: 16, fontWeight: '700', color: 'white' },
    totalValue: { fontSize: 18, fontWeight: '800', color: ZyncTheme.colors.primary },
    dateText: { fontSize: 12, color: ZyncTheme.colors.textSecondary, textAlign: 'center' },
});
