import { ThemedText } from '@/components/themed-text';
import { getTicketById, Ticket } from '@/features/tickets/services/ticket.service';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Share,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';

const STATUS_MAP = {
    valid:   { label: 'Entrada Válida',   color: '#22C55E', icon: 'checkmark-circle' as const },
    used:    { label: 'Ya utilizada',      color: '#888',    icon: 'close-circle'      as const },
    expired: { label: 'Expirada',          color: '#ff4466', icon: 'alert-circle'      as const },
};

export default function TicketDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        getTicketById(id)
            .then(setTicket)
            .finally(() => setIsLoading(false));
    }, [id]);

    const handleShare = () => {
        if (!ticket) return;
        Share.share({
            message: `Tengo entrada para ${ticket.eventName} en ${ticket.venueName}. Código: ${ticket.qrCode}`,
        });
    };

    if (isLoading) {
        return (
            <SafeAreaView style={styles.safe}>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={ZyncTheme.colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (!ticket) {
        return (
            <SafeAreaView style={styles.safe}>
                <View style={styles.center}>
                    <Ionicons name="alert-circle-outline" size={56} color={ZyncTheme.colors.error} />
                    <ThemedText style={styles.errorText}>Ticket no encontrado.</ThemedText>
                    <TouchableOpacity onPress={() => router.back()}>
                        <ThemedText style={styles.backLink}>Volver</ThemedText>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const status = STATUS_MAP[ticket.status];
    const eventDate = new Date(ticket.eventDate);

    return (
        <SafeAreaView style={styles.safe}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Entrada</ThemedText>
                <TouchableOpacity onPress={handleShare}>
                    <Ionicons name="share-outline" size={24} color={ZyncTheme.colors.primary} />
                </TouchableOpacity>
            </View>

            {/* Ticket body */}
            <View style={styles.ticketWrap}>
                {/* Cover */}
                {ticket.coverImageUrl ? (
                    <Image source={{ uri: ticket.coverImageUrl }} style={styles.cover} contentFit="cover" />
                ) : (
                    <View style={styles.coverFallback}>
                        <Ionicons name="musical-notes" size={40} color="#333" />
                    </View>
                )}

                {/* Tear line */}
                <View style={styles.tearLine}>
                    <View style={styles.tearCircleLeft} />
                    {Array.from({ length: 18 }).map((_, i) => (
                        <View key={i} style={styles.dash} />
                    ))}
                    <View style={styles.tearCircleRight} />
                </View>

                {/* Info + QR */}
                <View style={styles.body}>
                    {/* Status */}
                    <View style={[styles.statusRow, { backgroundColor: status.color + '18' }]}>
                        <Ionicons name={status.icon} size={18} color={status.color} />
                        <ThemedText style={[styles.statusLabel, { color: status.color }]}>{status.label}</ThemedText>
                    </View>

                    {/* Event info */}
                    <ThemedText style={styles.eventName}>{ticket.eventName}</ThemedText>

                    <View style={styles.infoGrid}>
                        <View style={styles.infoItem}>
                            <ThemedText style={styles.infoLabel}>VENUE</ThemedText>
                            <ThemedText style={styles.infoValue}>{ticket.venueName}</ThemedText>
                        </View>
                        <View style={styles.infoItem}>
                            <ThemedText style={styles.infoLabel}>FECHA</ThemedText>
                            <ThemedText style={styles.infoValue}>
                                {eventDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </ThemedText>
                        </View>
                        <View style={styles.infoItem}>
                            <ThemedText style={styles.infoLabel}>TITULAR</ThemedText>
                            <ThemedText style={styles.infoValue}>{ticket.holderName}</ThemedText>
                        </View>
                        <View style={styles.infoItem}>
                            <ThemedText style={styles.infoLabel}>PRECIO</ThemedText>
                            <ThemedText style={[styles.infoValue, { color: ZyncTheme.colors.primary }]}>
                                ${ticket.price.toLocaleString('es-AR')}
                            </ThemedText>
                        </View>
                    </View>

                    {/* QR Code */}
                    <View style={styles.qrContainer}>
                        {ticket.status === 'valid' ? (
                            <>
                                <QRCode
                                    value={ticket.qrCode}
                                    size={180}
                                    backgroundColor="#fff"
                                    color="#000"
                                />
                                <ThemedText style={styles.qrCode}>{ticket.qrCode}</ThemedText>
                                <ThemedText style={styles.qrHint}>
                                    Presentá este código en la entrada
                                </ThemedText>
                            </>
                        ) : (
                            <View style={styles.qrUsed}>
                                <Ionicons name={status.icon} size={48} color={status.color} />
                                <ThemedText style={[styles.qrUsedText, { color: status.color }]}>
                                    {status.label}
                                </ThemedText>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: ZyncTheme.colors.background },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
    errorText: { fontSize: 14, color: ZyncTheme.colors.textSecondary },
    backLink: { color: ZyncTheme.colors.primary, fontWeight: '600' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: ZyncTheme.spacing.l,
        paddingVertical: ZyncTheme.spacing.m,
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: 'white' },
    ticketWrap: {
        margin: ZyncTheme.spacing.l,
        backgroundColor: ZyncTheme.colors.card,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: ZyncTheme.colors.border,
    },
    cover: { width: '100%', height: 140 },
    coverFallback: {
        width: '100%', height: 100,
        backgroundColor: '#111',
        alignItems: 'center', justifyContent: 'center',
    },
    tearLine: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: ZyncTheme.colors.background,
        paddingVertical: 0,
    },
    tearCircleLeft: {
        width: 20, height: 20, borderRadius: 10,
        backgroundColor: ZyncTheme.colors.background,
        marginLeft: -10,
    },
    tearCircleRight: {
        width: 20, height: 20, borderRadius: 10,
        backgroundColor: ZyncTheme.colors.background,
        marginRight: -10,
    },
    dash: {
        flex: 1, height: 1,
        backgroundColor: ZyncTheme.colors.border,
        marginHorizontal: 1,
    },
    body: { padding: ZyncTheme.spacing.l, alignItems: 'center' },
    statusRow: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 14, paddingVertical: 7,
        borderRadius: 20, marginBottom: 16,
    },
    statusLabel: { fontSize: 13, fontWeight: '700' },
    eventName: { fontSize: 20, fontWeight: '800', color: 'white', textAlign: 'center', marginBottom: 20 },
    infoGrid: {
        flexDirection: 'row', flexWrap: 'wrap',
        width: '100%', marginBottom: 24, gap: 0,
    },
    infoItem: { width: '50%', paddingVertical: 8, paddingHorizontal: 4 },
    infoLabel: { fontSize: 10, color: '#555', letterSpacing: 1, marginBottom: 3, fontWeight: '700' },
    infoValue: { fontSize: 14, fontWeight: '600', color: 'white' },
    qrContainer: {
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16, padding: 20,
        width: '100%',
    },
    qrCode: {
        marginTop: 10, fontSize: 11,
        color: '#333', letterSpacing: 1,
        fontFamily: 'monospace',
    },
    qrHint: { marginTop: 6, fontSize: 12, color: '#666', textAlign: 'center' },
    qrUsed: { alignItems: 'center', paddingVertical: 20, gap: 8 },
    qrUsedText: { fontSize: 16, fontWeight: '700' },
});
