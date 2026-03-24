import { ScreenLayout } from '@/components/ScreenLayout';
import { ThemedText } from '@/components/themed-text';
import { useZync } from '@/context/ZyncContext';
import { Order, getVenueOrders, updateOrderStatus } from '@/features/wallet/services/order.service';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    FlatList,
    RefreshControl,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

type Tab = 'pending' | 'confirmed' | 'ready' | 'history';

const TABS: { key: Tab; label: string }[] = [
    { key: 'pending',   label: 'Pendientes' },
    { key: 'confirmed', label: 'En prep.'   },
    { key: 'ready',     label: 'Listos'     },
    { key: 'history',   label: 'Historial'  },
];

const STATUS_COLORS: Record<string, { color: string; label: string }> = {
    pending:   { color: '#ffaa00', label: 'Pendiente'     },
    confirmed: { color: '#00aaff', label: 'Confirmado'    },
    ready:     { color: '#22C55E', label: 'Listo'         },
    delivered: { color: '#555',    label: 'Entregado'     },
    cancelled: { color: '#ff4466', label: 'Cancelado'     },
};

const NEXT_STATUS: Partial<Record<Order['status'], Order['status']>> = {
    pending:   'confirmed',
    confirmed: 'ready',
    ready:     'delivered',
};

const NEXT_LABEL: Partial<Record<Order['status'], string>> = {
    pending:   'Confirmar',
    confirmed: 'Marcar listo',
    ready:     'Entregado',
};

function OrderCard({ order, onAdvance, onCancel }: {
    order: Order;
    onAdvance?: () => void;
    onCancel?: () => void;
}) {
    const st = STATUS_COLORS[order.status] ?? STATUS_COLORS.pending;
    const timeAgo = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000);
    const nextStatus = NEXT_STATUS[order.status];

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.cardHeaderLeft}>
                    <ThemedText style={styles.orderId}>#{order.id.slice(-4).toUpperCase()}</ThemedText>
                    <ThemedText style={styles.location}>{order.establishmentName ?? '—'}</ThemedText>
                </View>
                <View style={styles.cardHeaderRight}>
                    <View style={[styles.statusDot, { backgroundColor: st.color }]} />
                    <ThemedText style={[styles.statusText, { color: st.color }]}>{st.label}</ThemedText>
                </View>
            </View>

            <View style={styles.itemsList}>
                {order.items.map(item => (
                    <View key={item.id} style={styles.itemRow}>
                        <ThemedText style={styles.itemQty}>{item.quantity}x</ThemedText>
                        <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                        <ThemedText style={styles.itemPrice}>${item.subtotal.toLocaleString('es-AR')}</ThemedText>
                    </View>
                ))}
            </View>

            <View style={styles.cardFooter}>
                <View>
                    <ThemedText style={styles.total}>${order.total.toLocaleString('es-AR')}</ThemedText>
                    <ThemedText style={styles.time}>{timeAgo < 1 ? 'recién' : `hace ${timeAgo} min`}</ThemedText>
                </View>
                <View style={styles.footerActions}>
                    {onCancel && order.status === 'pending' && (
                        <TouchableOpacity style={styles.btnCancel} onPress={onCancel}>
                            <ThemedText style={styles.btnCancelText}>Cancelar</ThemedText>
                        </TouchableOpacity>
                    )}
                    {onAdvance && nextStatus && (
                        <TouchableOpacity style={styles.btnAdvance} onPress={onAdvance}>
                            <ThemedText style={styles.btnAdvanceText}>{NEXT_LABEL[order.status]}</ThemedText>
                            <Ionicons name="arrow-forward" size={13} color="#000" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
}

export default function BusinessOrdersScreen() {
    const router = useRouter();
    const { currentEstablishment } = useZync();
    const venueId = currentEstablishment?.id ?? 'mock-venue';
    const [activeTab, setActiveTab] = useState<Tab>('pending');
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            const statusMap: Record<Tab, Order['status'] | undefined> = {
                pending:   'pending',
                confirmed: 'confirmed',
                ready:     'ready',
                history:   undefined,
            };
            const data = await getVenueOrders(venueId, statusMap[activeTab]);
            if (activeTab === 'history') {
                setOrders(data.filter(o => o.status === 'delivered' || o.status === 'cancelled'));
            } else {
                setOrders(data);
            }
        } finally {
            setIsLoading(false);
        }
    }, [venueId, activeTab]);

    useEffect(() => { load(); }, [load]);

    const handleAdvance = async (order: Order) => {
        const next = NEXT_STATUS[order.status];
        if (!next) return;
        await updateOrderStatus(order.id, next);
        setOrders(prev => prev.filter(o => o.id !== order.id));
    };

    const handleCancel = async (order: Order) => {
        await updateOrderStatus(order.id, 'cancelled');
        setOrders(prev => prev.filter(o => o.id !== order.id));
    };

    const pendingCount = orders.filter(o => o.status === 'pending').length;

    return (
        <ScreenLayout noPadding style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <ThemedText style={styles.title}>Pedidos</ThemedText>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.tabs}>
                {TABS.map(tab => (
                    <TouchableOpacity
                        key={tab.key}
                        style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                        onPress={() => setActiveTab(tab.key)}
                    >
                        <ThemedText style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                            {tab.label}
                        </ThemedText>
                        {tab.key === 'pending' && pendingCount > 0 && (
                            <View style={styles.bubble}>
                                <ThemedText style={styles.bubbleText}>{pendingCount}</ThemedText>
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={orders}
                keyExtractor={o => o.id}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} tintColor={ZyncTheme.colors.primary} />}
                renderItem={({ item }) => (
                    <OrderCard
                        order={item}
                        onAdvance={() => handleAdvance(item)}
                        onCancel={() => handleCancel(item)}
                    />
                )}
                ListEmptyComponent={
                    <View style={styles.empty}>
                        <Ionicons name="receipt-outline" size={48} color="#333" />
                        <ThemedText style={styles.emptyText}>
                            {activeTab === 'history' ? 'Sin historial aún' : 'Sin pedidos en esta categoría'}
                        </ThemedText>
                    </View>
                }
            />
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: ZyncTheme.spacing.l, paddingTop: ZyncTheme.spacing.l, paddingBottom: ZyncTheme.spacing.m,
        borderBottomWidth: 1, borderBottomColor: ZyncTheme.colors.border,
    },
    title: { fontSize: 20, fontWeight: '800', color: 'white' },
    tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: ZyncTheme.colors.border },
    tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 5 },
    tabActive: { borderBottomWidth: 2, borderBottomColor: ZyncTheme.colors.primary },
    tabText: { fontSize: 12, fontWeight: '600', color: ZyncTheme.colors.textSecondary },
    tabTextActive: { color: ZyncTheme.colors.primary },
    bubble: { backgroundColor: ZyncTheme.colors.primary, borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
    bubbleText: { fontSize: 9, fontWeight: '900', color: '#000' },
    list: { padding: ZyncTheme.spacing.m, paddingBottom: 80 },
    card: {
        backgroundColor: ZyncTheme.colors.card, borderRadius: 14, marginBottom: 10,
        borderWidth: 1, borderColor: ZyncTheme.colors.border, overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    cardHeaderLeft: { gap: 2 },
    orderId: { fontSize: 15, fontWeight: '800', color: 'white' },
    location: { fontSize: 11, color: ZyncTheme.colors.textSecondary },
    cardHeaderRight: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    statusDot: { width: 7, height: 7, borderRadius: 4 },
    statusText: { fontSize: 11, fontWeight: '700' },
    itemsList: { padding: 12 },
    itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    itemQty: { width: 24, fontSize: 12, fontWeight: '700', color: ZyncTheme.colors.primary },
    itemName: { flex: 1, fontSize: 13, color: '#ddd' },
    itemPrice: { fontSize: 12, color: ZyncTheme.colors.textSecondary },
    cardFooter: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)',
    },
    total: { fontSize: 17, fontWeight: '800', color: 'white' },
    time: { fontSize: 11, color: '#555', marginTop: 1 },
    footerActions: { flexDirection: 'row', gap: 8 },
    btnCancel: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, borderWidth: 1, borderColor: ZyncTheme.colors.border },
    btnCancelText: { fontSize: 12, color: ZyncTheme.colors.textSecondary },
    btnAdvance: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: ZyncTheme.colors.primary, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
    btnAdvanceText: { fontSize: 12, fontWeight: '800', color: '#000' },
    empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
    emptyText: { fontSize: 14, color: ZyncTheme.colors.textSecondary },
});
