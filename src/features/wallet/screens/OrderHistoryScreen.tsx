import { CyberCard } from '@/components/CyberCard';
import { ScreenLayout } from '@/components/ScreenLayout';
import { ThemedText } from '@/components/themed-text';
import { Order, getMyOrders } from '@/features/wallet/services/order.service';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';

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

export default function OrderHistoryScreen() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const load = useCallback(async () => {
        try {
            const data = await getMyOrders();
            setOrders(data);
        } catch (e) {
            console.error('Failed to load orders', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const onRefresh = () => {
        setRefreshing(true);
        load();
    };

    const renderItem = ({ item }: { item: Order }) => (
        <TouchableOpacity onPress={() => router.push(`/orders/${item.id}` as any)} activeOpacity={0.75}>
            <CyberCard style={styles.card}>
                <View style={styles.cardHeader}>
                    <View>
                        <ThemedText style={styles.orderId}>Pedido #{item.id.slice(-6).toUpperCase()}</ThemedText>
                        {item.establishmentName && (
                            <ThemedText style={styles.establishment}>{item.establishmentName}</ThemedText>
                        )}
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: STATUS_COLOR[item.status] + '22', borderColor: STATUS_COLOR[item.status] }]}>
                        <ThemedText style={[styles.statusText, { color: STATUS_COLOR[item.status] }]}>
                            {STATUS_LABEL[item.status]}
                        </ThemedText>
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <ThemedText style={styles.date}>
                        {new Date(item.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </ThemedText>
                    <ThemedText style={styles.total}>${item.total.toFixed(2)}</ThemedText>
                </View>
            </CyberCard>
        </TouchableOpacity>
    );

    return (
        <ScreenLayout style={styles.container} noPadding>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={ZyncTheme.colors.text} />
                </TouchableOpacity>
                <ThemedText style={styles.title}>Mis Pedidos</ThemedText>
            </View>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={ZyncTheme.colors.primary} />
                </View>
            ) : orders.length === 0 ? (
                <View style={styles.centered}>
                    <Ionicons name="receipt-outline" size={56} color={ZyncTheme.colors.textSecondary} />
                    <ThemedText style={styles.emptyText}>No tenés pedidos todavía</ThemedText>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ZyncTheme.colors.primary} />}
                />
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
    list: { padding: ZyncTheme.spacing.m, gap: ZyncTheme.spacing.s },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    emptyText: { color: ZyncTheme.colors.textSecondary, fontSize: 16 },
    card: { padding: ZyncTheme.spacing.m, gap: ZyncTheme.spacing.s },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    orderId: { fontSize: 15, fontWeight: '700', color: 'white' },
    establishment: { fontSize: 13, color: ZyncTheme.colors.textSecondary, marginTop: 2 },
    statusBadge: {
        borderRadius: 8,
        borderWidth: 1,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    statusText: { fontSize: 12, fontWeight: '600' },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
    date: { fontSize: 12, color: ZyncTheme.colors.textSecondary },
    total: { fontSize: 16, fontWeight: 'bold', color: ZyncTheme.colors.primary },
});
