import { ThemedText } from '@/components/themed-text';
import { getMyTickets, Ticket } from '@/features/tickets/services/ticket.service';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const STATUS_MAP = {
    VALID:     { label: 'Válido',     color: '#22C55E' },
    USED:      { label: 'Utilizado',  color: '#888'    },
    CANCELLED: { label: 'Cancelado',  color: '#ff4466' },
    EXPIRED:   { label: 'Expirado',   color: '#ff4466' },
};

function TicketCard({ ticket, onPress }: { ticket: Ticket; onPress: () => void }) {
    const status = STATUS_MAP[ticket.status] ?? STATUS_MAP.EXPIRED;
    const eventDate = new Date(ticket.event.startsAt);
    const isPast = eventDate < new Date();
    const eventName = ticket.event.name;
    const venueName = ticket.event.venue?.name ?? '—';
    const imageUrl = ticket.event.imageUrl;
    const pricePaid = parseFloat(ticket.pricePaid);

    return (
        <TouchableOpacity style={[styles.card, isPast && styles.cardPast]} onPress={onPress} activeOpacity={0.85}>
            {imageUrl && (
                <Image source={{ uri: imageUrl }} style={styles.cover} contentFit="cover" />
            )}
            <View style={[styles.cardContent, !imageUrl && { paddingTop: 16 }]}>
                <View style={styles.cardTop}>
                    <View style={{ flex: 1 }}>
                        <ThemedText style={styles.eventName} numberOfLines={2}>{eventName}</ThemedText>
                        <View style={styles.metaRow}>
                            <Ionicons name="location-outline" size={13} color="#666" />
                            <ThemedText style={styles.metaText}>{venueName}</ThemedText>
                        </View>
                        <View style={styles.metaRow}>
                            <Ionicons name="calendar-outline" size={13} color="#666" />
                            <ThemedText style={styles.metaText}>
                                {eventDate.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'long' })}
                            </ThemedText>
                        </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: status.color + '22' }]}>
                        <ThemedText style={[styles.statusText, { color: status.color }]}>{status.label}</ThemedText>
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <ThemedText style={styles.price}>${pricePaid.toLocaleString('es-AR')}</ThemedText>
                    {ticket.status === 'VALID' && (
                        <View style={styles.qrHint}>
                            <Ionicons name="qr-code-outline" size={14} color={ZyncTheme.colors.primary} />
                            <ThemedText style={styles.qrHintText}>Ver QR</ThemedText>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
}

export default function TicketsScreen() {
    const router = useRouter();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const load = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getMyTickets();
            setTickets(data);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <ThemedText style={styles.title}>Mis Tickets</ThemedText>
                <View style={{ width: 24 }} />
            </View>

            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={ZyncTheme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={tickets}
                    keyExtractor={t => t.id}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} tintColor={ZyncTheme.colors.primary} />}
                    renderItem={({ item }) => (
                        <TicketCard
                            ticket={item}
                            onPress={() => router.push(`/tickets/${item.id}` as any)}
                        />
                    )}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Ionicons name="ticket-outline" size={56} color="#333" />
                            <ThemedText style={styles.emptyText}>Todavía no compraste entradas.</ThemedText>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: ZyncTheme.colors.background },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: ZyncTheme.spacing.l,
        paddingVertical: ZyncTheme.spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: ZyncTheme.colors.border,
    },
    title: { fontSize: 20, fontWeight: '800', color: 'white' },
    list: { padding: ZyncTheme.spacing.m, paddingBottom: 100 },
    card: {
        backgroundColor: ZyncTheme.colors.card,
        borderRadius: 16,
        marginBottom: ZyncTheme.spacing.m,
        borderWidth: 1,
        borderColor: ZyncTheme.colors.border,
        overflow: 'hidden',
    },
    cardPast: { opacity: 0.6 },
    cover: { width: '100%', height: 100 },
    cardContent: { padding: ZyncTheme.spacing.m },
    cardTop: { flexDirection: 'row', gap: 12, marginBottom: 12 },
    eventName: { fontSize: 16, fontWeight: '700', color: 'white', marginBottom: 6 },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 3 },
    metaText: { fontSize: 12, color: ZyncTheme.colors.textSecondary },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
    statusText: { fontSize: 11, fontWeight: '700' },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: ZyncTheme.colors.border,
    },
    price: { fontSize: 16, fontWeight: '800', color: ZyncTheme.colors.primary },
    qrHint: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    qrHintText: { fontSize: 12, color: ZyncTheme.colors.primary, fontWeight: '600' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12 },
    emptyText: { fontSize: 14, color: ZyncTheme.colors.textSecondary },
});
