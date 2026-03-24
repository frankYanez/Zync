import { ScreenLayout } from '@/components/ScreenLayout';
import { ThemedText } from '@/components/themed-text';
import { getVenueStats } from '@/features/dashboard/services/event.service';
import { VenueStats } from '@/features/dashboard/domain/event.types';
import { getVenueOrders, Order, updateOrderStatus } from '@/features/wallet/services/order.service';
import { useZync } from '@/context/ZyncContext';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

const ORDER_STATUS_NEXT: Partial<Record<Order['status'], Order['status']>> = {
    pending:   'confirmed',
    confirmed: 'ready',
    ready:     'delivered',
};

const ORDER_STATUS_LABEL: Record<string, string> = {
    pending:   'Confirmar',
    confirmed: 'Listo',
    ready:     'Entregado',
};

function MetricCard({ title, value, icon, delay }: { title: string; value: string | number; icon: string; delay: number }) {
    return (
        <MotiView
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'spring', delay }}
            style={styles.metricCard}
        >
            <View style={styles.metricHeader}>
                <ThemedText style={styles.metricTitle}>{title}</ThemedText>
                <Ionicons name={icon as any} size={18} color="#444" />
            </View>
            <ThemedText style={styles.metricValue}>{value}</ThemedText>
        </MotiView>
    );
}

function OrderCard({ order, onAdvance }: { order: Order; onAdvance: () => void }) {
    const nextStatus = ORDER_STATUS_NEXT[order.status];
    const timeAgo = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000);

    return (
        <View style={styles.orderCard}>
            <View style={styles.orderTop}>
                <View>
                    <ThemedText style={styles.orderId}>#{order.id.slice(-4).toUpperCase()}</ThemedText>
                    <ThemedText style={styles.orderLocation}>{order.establishmentName ?? 'Sin mesa'}</ThemedText>
                </View>
                <View style={styles.orderRight}>
                    <ThemedText style={styles.orderTotal}>${order.total.toLocaleString('es-AR')}</ThemedText>
                    <ThemedText style={styles.orderTime}>{timeAgo < 1 ? 'ahora' : `${timeAgo} min`}</ThemedText>
                </View>
            </View>

            <View style={styles.orderItems}>
                {order.items.map(item => (
                    <ThemedText key={item.id} style={styles.orderItem}>
                        {item.quantity}x {item.name}
                    </ThemedText>
                ))}
            </View>

            {nextStatus && (
                <TouchableOpacity style={styles.advanceBtn} onPress={onAdvance}>
                    <ThemedText style={styles.advanceBtnText}>{ORDER_STATUS_LABEL[order.status]}</ThemedText>
                    <Ionicons name="arrow-forward" size={14} color="#000" />
                </TouchableOpacity>
            )}
        </View>
    );
}

export default function BusinessHomeScreen() {
    const router = useRouter();
    const { currentEstablishment } = useZync();
    const venueId = currentEstablishment?.id ?? 'mock-venue';

    const [stats, setStats] = useState<VenueStats | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            const [s, o] = await Promise.all([
                getVenueStats(venueId),
                getVenueOrders(venueId, 'pending'),
            ]);
            setStats(s);
            setOrders(o);
        } finally {
            setIsLoading(false);
        }
    }, [venueId]);

    useEffect(() => { load(); }, [load]);

    const handleAdvance = async (order: Order) => {
        const next = ORDER_STATUS_NEXT[order.status];
        if (!next) return;
        await updateOrderStatus(order.id, next);
        setOrders(prev => prev.filter(o => o.id !== order.id));
    };

    return (
        <ScreenLayout noPadding>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scroll}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} tintColor={ZyncTheme.colors.primary} />}
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <ThemedText style={styles.greeting}>Panel de control</ThemedText>
                        <ThemedText style={styles.venueName}>
                            {currentEstablishment?.name ?? 'Mi Local'}
                        </ThemedText>
                    </View>
                    <TouchableOpacity style={styles.ordersBtn} onPress={() => router.push('/(business)/orders' as any)}>
                        <Ionicons name="receipt-outline" size={20} color={ZyncTheme.colors.primary} />
                        <ThemedText style={styles.ordersBtnText}>Pedidos</ThemedText>
                    </TouchableOpacity>
                </View>

                {/* Metrics */}
                {isLoading ? (
                    <View style={styles.center}>
                        <ActivityIndicator color={ZyncTheme.colors.primary} />
                    </View>
                ) : (
                    <View style={styles.metricsGrid}>
                        <MetricCard title="PEDIDOS HOY"     value={stats?.todayOrders ?? 0}         icon="receipt-outline"   delay={100} />
                        <MetricCard title="INGRESOS HOY"    value={`$${(stats?.todayRevenue ?? 0).toLocaleString('es-AR')}`} icon="cash-outline" delay={200} />
                        <MetricCard title="CLIENTES ACTIVOS" value={stats?.activeCustomers ?? 0}    icon="people-outline"    delay={300} />
                        <MetricCard title="PENDIENTES"      value={stats?.pendingOrdersCount ?? 0}  icon="time-outline"      delay={400} />
                    </View>
                )}

                {/* Quick actions */}
                <View style={styles.quickActions}>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(business)/events' as any)}>
                        <Ionicons name="calendar-outline" size={22} color={ZyncTheme.colors.primary} />
                        <ThemedText style={styles.actionBtnText}>Eventos</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(business)/products' as any)}>
                        <Ionicons name="fast-food-outline" size={22} color={ZyncTheme.colors.primary} />
                        <ThemedText style={styles.actionBtnText}>Productos</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(business)/scanner' as any)}>
                        <Ionicons name="scan-outline" size={22} color={ZyncTheme.colors.primary} />
                        <ThemedText style={styles.actionBtnText}>Scanner</ThemedText>
                    </TouchableOpacity>
                </View>

                {/* Pending orders */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <ThemedText style={styles.sectionTitle}>Pedidos pendientes</ThemedText>
                        {orders.length > 0 && (
                            <View style={styles.countBubble}>
                                <ThemedText style={styles.countBubbleText}>{orders.length}</ThemedText>
                            </View>
                        )}
                    </View>

                    {orders.length === 0 ? (
                        <View style={styles.emptyOrders}>
                            <Ionicons name="checkmark-circle-outline" size={32} color="#333" />
                            <ThemedText style={styles.emptyText}>Sin pedidos pendientes</ThemedText>
                        </View>
                    ) : (
                        orders.map(order => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                onAdvance={() => handleAdvance(order)}
                            />
                        ))
                    )}
                </View>

                <View style={{ height: 80 }} />
            </ScrollView>
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    scroll: { paddingTop: 60, paddingHorizontal: 20 },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    greeting: { fontSize: 12, color: ZyncTheme.colors.textSecondary, letterSpacing: 1, textTransform: 'uppercase' },
    venueName: { fontSize: 22, fontWeight: '800', color: 'white', marginTop: 2 },
    ordersBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: 'rgba(204,255,0,0.08)',
        paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
        borderWidth: 1, borderColor: 'rgba(204,255,0,0.2)',
    },
    ordersBtnText: { color: ZyncTheme.colors.primary, fontWeight: '700', fontSize: 13 },
    metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
    metricCard: {
        width: '47%',
        backgroundColor: '#121212',
        borderRadius: 14, padding: 14,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    },
    metricHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    metricTitle: { fontSize: 9, fontWeight: '700', letterSpacing: 1, color: ZyncTheme.colors.textSecondary },
    metricValue: { fontSize: 22, fontWeight: '800', color: 'white' },
    quickActions: {
        flexDirection: 'row', gap: 10, marginBottom: 28,
    },
    actionBtn: {
        flex: 1, alignItems: 'center', gap: 6,
        backgroundColor: '#121212',
        paddingVertical: 14, borderRadius: 14,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    },
    actionBtnText: { fontSize: 11, fontWeight: '600', color: ZyncTheme.colors.textSecondary },
    section: { marginBottom: 20 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
    sectionTitle: { fontSize: 16, fontWeight: '700', color: 'white' },
    countBubble: {
        backgroundColor: ZyncTheme.colors.primary, borderRadius: 10,
        minWidth: 22, height: 22, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4,
    },
    countBubbleText: { fontSize: 11, fontWeight: '900', color: '#000' },
    orderCard: {
        backgroundColor: '#121212',
        borderRadius: 14, padding: 14,
        marginBottom: 10,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    },
    orderTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
    orderId: { fontSize: 15, fontWeight: '800', color: 'white' },
    orderLocation: { fontSize: 12, color: ZyncTheme.colors.textSecondary, marginTop: 2 },
    orderRight: { alignItems: 'flex-end' },
    orderTotal: { fontSize: 16, fontWeight: '800', color: ZyncTheme.colors.primary },
    orderTime: { fontSize: 11, color: '#555', marginTop: 2 },
    orderItems: { marginBottom: 12 },
    orderItem: { fontSize: 13, color: '#aaa', marginBottom: 2 },
    advanceBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
        backgroundColor: ZyncTheme.colors.primary,
        borderRadius: 10, paddingVertical: 10,
    },
    advanceBtnText: { fontSize: 13, fontWeight: '800', color: '#000' },
    center: { paddingVertical: 20, alignItems: 'center' },
    emptyOrders: { alignItems: 'center', paddingVertical: 24, gap: 8 },
    emptyText: { fontSize: 13, color: ZyncTheme.colors.textSecondary },
});
