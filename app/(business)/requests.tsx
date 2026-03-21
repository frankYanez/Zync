import { ScreenLayout } from '@/components/ScreenLayout';
import { ThemedText } from '@/components/themed-text';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

export default function DjRequestsScreen() {
    // This will eventually fetch actual requests from a service
    const mockRequests = [
        { id: '1', song: 'Starboy', artist: 'The Weeknd', user: 'Frank', status: 'pending', timestamp: '2 min ago' },
        { id: '2', song: 'One More Time', artist: 'Daft Punk', user: 'Elena', status: 'pending', timestamp: '5 min ago' },
        { id: '3', song: 'Blinding Lights', artist: 'The Weeknd', user: 'Nico', status: 'completed', timestamp: '15 min ago' },
    ];

    const renderItem = ({ item }: any) => (
        <View style={styles.requestCard}>
            <View style={styles.requestInfo}>
                <ThemedText style={styles.songName}>{item.song}</ThemedText>
                <ThemedText style={styles.artistName}>{item.artist}</ThemedText>
                <ThemedText style={styles.userInfo}>Requested by {item.user} • {item.timestamp}</ThemedText>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: item.status === 'completed' ? '#22C55E' : ZyncTheme.colors.primary }]}>
                <ThemedText style={styles.statusText}>{item.status.toUpperCase()}</ThemedText>
            </View>
        </View>
    );

    return (
        <ScreenLayout style={styles.container} noPadding>
            <View style={styles.header}>
                <ThemedText style={styles.title}>Song Requests</ThemedText>
                <View style={styles.statsRow}>
                    <ThemedText style={styles.stat}>Pendientes: 2</ThemedText>
                    <ThemedText style={styles.stat}>•</ThemedText>
                    <ThemedText style={styles.stat}>Total: 15</ThemedText>
                </View>
            </View>

            <FlatList
                data={mockRequests}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="musical-notes-outline" size={64} color={ZyncTheme.colors.textSecondary} />
                        <ThemedText style={styles.emptyText}>No requests yet.</ThemedText>
                    </View>
                }
            />
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: ZyncTheme.spacing.l,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
        backgroundColor: ZyncTheme.colors.background,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 8,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'center',
    },
    stat: {
        fontSize: 14,
        color: ZyncTheme.colors.textSecondary,
    },
    listContent: {
        padding: ZyncTheme.spacing.m,
    },
    requestCard: {
        flexDirection: 'row',
        backgroundColor: ZyncTheme.colors.card,
        borderRadius: ZyncTheme.borderRadius.m,
        padding: ZyncTheme.spacing.m,
        marginBottom: ZyncTheme.spacing.m,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: ZyncTheme.colors.border,
    },
    requestInfo: {
        flex: 1,
    },
    songName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    artistName: {
        fontSize: 14,
        color: ZyncTheme.colors.primary,
        marginBottom: 4,
    },
    userInfo: {
        fontSize: 12,
        color: ZyncTheme.colors.textSecondary,
    },
    statusBadge: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: 'black',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
        gap: 16,
    },
    emptyText: {
        fontSize: 16,
        color: ZyncTheme.colors.textSecondary,
    }
});
