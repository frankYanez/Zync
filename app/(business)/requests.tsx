import { ScreenLayout } from '@/components/ScreenLayout';
import { ThemedText } from '@/components/themed-text';
import { useDjProfile } from '@/hooks/useDjProfile';
import { useSongRequests } from '@/hooks/useSongRequests';
import { SongRequest } from '@/features/music/services/song-request.service';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

type Tab = 'pending' | 'accepted' | 'history';

const TABS: { key: Tab; label: string }[] = [
    { key: 'pending',  label: 'Pendientes' },
    { key: 'accepted', label: 'Aceptadas'  },
    { key: 'history',  label: 'Historial'  },
];

function timeAgo(isoDate: string): string {
    const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / 60000);
    if (diff < 1) return 'ahora';
    if (diff < 60) return `${diff} min`;
    return `${Math.floor(diff / 60)}h`;
}

function StatusBadge({ status }: { status: SongRequest['status'] }) {
    const map: Record<SongRequest['status'], { label: string; color: string }> = {
        pending:  { label: 'Pendiente', color: ZyncTheme.colors.primary },
        accepted: { label: 'Aceptada',  color: '#22C55E' },
        rejected: { label: 'Rechazada', color: ZyncTheme.colors.error },
        played:   { label: 'Tocada',    color: '#888' },
    };
    const { label, color } = map[status];
    return (
        <View style={[styles.badge, { backgroundColor: color + '22', borderColor: color + '55' }]}>
            <ThemedText style={[styles.badgeText, { color }]}>{label}</ThemedText>
        </View>
    );
}

export default function DjRequestsScreen() {
    const [activeTab, setActiveTab] = useState<Tab>('pending');
    const { profile } = useDjProfile();
    const { pending, accepted, history, isLoading, isUpdating, updateStatus, refetch } = useSongRequests(profile?.id);

    const dataMap: Record<Tab, SongRequest[]> = { pending, accepted, history };
    const data = dataMap[activeTab];

    const renderItem = ({ item }: { item: SongRequest }) => (
        <View style={styles.card}>
            <View style={styles.albumWrap}>
                {item.albumCover
                    ? <Image source={{ uri: item.albumCover }} style={styles.album} contentFit="cover" />
                    : <View style={[styles.album, styles.albumFallback]}>
                        <Ionicons name="musical-note" size={20} color="#555" />
                      </View>
                }
            </View>

            <View style={styles.info}>
                <ThemedText style={styles.trackName} numberOfLines={1}>{item.trackName}</ThemedText>
                <ThemedText style={styles.artistName} numberOfLines={1}>{item.artistName}</ThemedText>
                <View style={styles.metaRow}>
                    <StatusBadge status={item.status} />
                    <ThemedText style={styles.time}>{timeAgo(item.createdAt)}</ThemedText>
                </View>
            </View>

            {item.status === 'pending' && (
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={styles.btnReject}
                        onPress={() => updateStatus(item.id, 'rejected')}
                        disabled={isUpdating}
                    >
                        <Ionicons name="close" size={20} color="#ff4466" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.btnAccept}
                        onPress={() => updateStatus(item.id, 'accepted')}
                        disabled={isUpdating}
                    >
                        <Ionicons name="checkmark" size={20} color={ZyncTheme.colors.primary} />
                    </TouchableOpacity>
                </View>
            )}

            {item.status === 'accepted' && (
                <TouchableOpacity
                    style={styles.btnPlayed}
                    onPress={() => updateStatus(item.id, 'played')}
                    disabled={isUpdating}
                >
                    <Ionicons name="play" size={14} color="#000" />
                    <ThemedText style={styles.btnPlayedText}>Tocada</ThemedText>
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <ScreenLayout noPadding style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <ThemedText style={styles.title}>Song Requests</ThemedText>
                <View style={styles.statsRow}>
                    <ThemedText style={styles.stat}>
                        <ThemedText style={styles.statNum}>{pending.length}</ThemedText> pendientes
                    </ThemedText>
                    <ThemedText style={styles.dot}>·</ThemedText>
                    <ThemedText style={styles.stat}>
                        <ThemedText style={styles.statNum}>{pending.length + accepted.length + history.length}</ThemedText> totales
                    </ThemedText>
                </View>
            </View>

            {/* Tabs */}
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
                        {tab.key === 'pending' && pending.length > 0 && (
                            <View style={styles.tabBubble}>
                                <ThemedText style={styles.tabBubbleText}>{pending.length}</ThemedText>
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </View>

            {/* List */}
            {isLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={ZyncTheme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={data}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    onRefresh={refetch}
                    refreshing={isLoading}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Ionicons name="musical-notes-outline" size={56} color="#333" />
                            <ThemedText style={styles.emptyText}>
                                {activeTab === 'pending' ? 'Sin peticiones pendientes' :
                                 activeTab === 'accepted' ? 'Ninguna aceptada aún' :
                                 'El historial está vacío'}
                            </ThemedText>
                        </View>
                    }
                />
            )}
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingHorizontal: ZyncTheme.spacing.l,
        paddingTop: ZyncTheme.spacing.l,
        paddingBottom: ZyncTheme.spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: ZyncTheme.colors.border,
    },
    title: { fontSize: 24, fontWeight: '800', color: 'white', marginBottom: 6 },
    statsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    stat: { fontSize: 13, color: ZyncTheme.colors.textSecondary },
    statNum: { color: 'white', fontWeight: '700' },
    dot: { color: ZyncTheme.colors.border },
    tabs: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: ZyncTheme.colors.border,
        backgroundColor: ZyncTheme.colors.background,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        gap: 6,
    },
    tabActive: { borderBottomWidth: 2, borderBottomColor: ZyncTheme.colors.primary },
    tabText: { fontSize: 13, fontWeight: '600', color: ZyncTheme.colors.textSecondary },
    tabTextActive: { color: ZyncTheme.colors.primary },
    tabBubble: {
        backgroundColor: ZyncTheme.colors.primary,
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    tabBubbleText: { fontSize: 10, fontWeight: '800', color: '#000' },
    list: { padding: ZyncTheme.spacing.m, paddingBottom: 80 },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: ZyncTheme.colors.card,
        borderRadius: ZyncTheme.borderRadius.m,
        padding: ZyncTheme.spacing.m,
        marginBottom: ZyncTheme.spacing.s,
        borderWidth: 1,
        borderColor: ZyncTheme.colors.border,
        gap: 12,
    },
    albumWrap: { width: 52, height: 52, borderRadius: 8, overflow: 'hidden' },
    album: { width: '100%', height: '100%' },
    albumFallback: { backgroundColor: '#222', alignItems: 'center', justifyContent: 'center' },
    info: { flex: 1, gap: 3 },
    trackName: { fontSize: 15, fontWeight: '700', color: 'white' },
    artistName: { fontSize: 12, color: ZyncTheme.colors.textSecondary },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
    badge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 4, borderWidth: 1 },
    badgeText: { fontSize: 10, fontWeight: '700' },
    time: { fontSize: 11, color: '#555' },
    actions: { flexDirection: 'row', gap: 8 },
    btnReject: {
        width: 38, height: 38, borderRadius: 10,
        backgroundColor: 'rgba(255,68,102,0.1)',
        borderWidth: 1, borderColor: 'rgba(255,68,102,0.3)',
        alignItems: 'center', justifyContent: 'center',
    },
    btnAccept: {
        width: 38, height: 38, borderRadius: 10,
        backgroundColor: 'rgba(204,255,0,0.08)',
        borderWidth: 1, borderColor: 'rgba(204,255,0,0.3)',
        alignItems: 'center', justifyContent: 'center',
    },
    btnPlayed: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: ZyncTheme.colors.primary,
        paddingHorizontal: 10, paddingVertical: 7,
        borderRadius: 8,
    },
    btnPlayedText: { fontSize: 11, fontWeight: '800', color: '#000' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12 },
    emptyText: { fontSize: 14, color: ZyncTheme.colors.textSecondary },
});
