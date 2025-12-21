import { useZync } from '@/application/ZyncContext';
import { ScreenLayout } from '@/presentation/components/ScreenLayout';
import { ThemedText } from '@/presentation/components/themed-text';
import { CyberCard } from '@/presentation/components/ui/CyberCard';
import { NeonButton } from '@/presentation/components/ui/NeonButton';
import { NeonInput } from '@/presentation/components/ui/NeonInput';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { MOCK_SONGS } from '@/infrastructure/mock-data';

export default function BeatsScreen() {
    const { authState, updateBalance } = useZync();
    const [search, setSearch] = useState('');

    const filteredSongs = MOCK_SONGS.filter(song =>
        song.title.toLowerCase().includes(search.toLowerCase()) ||
        song.artist.toLowerCase().includes(search.toLowerCase())
    );

    const handleRequest = (price: number) => {
        // Logic to request and deduct balance
        if ((authState.user?.balance || 0) >= price) {
            updateBalance((authState.user?.balance || 0) - price);
            // Show success toast/alert
        } else {
            // Show error
        }
    };

    const renderItem = ({ item }: { item: typeof MOCK_SONGS[0] }) => (
        <CyberCard style={styles.songCard}>
            <View style={styles.songInfo}>
                <View style={styles.coverArt}>
                    {/* Placeholder for real image since remote images might need config */}
                    <Ionicons name="musical-note" size={24} color={ZyncTheme.colors.textSecondary} />
                </View>
                <View style={styles.details}>
                    <ThemedText style={styles.songTitle}>{item.title}</ThemedText>
                    <ThemedText style={styles.artist}>{item.artist}</ThemedText>
                </View>
            </View>
            <NeonButton
                title={`PEDIR X $${item.price.toLocaleString()}`}
                onPress={() => handleRequest(item.price)}
                textStyle={{ fontSize: 12, fontWeight: 'bold' }}
                style={styles.requestButton}
            />
        </CyberCard>
    );

    return (
        <ScreenLayout noPadding>
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="stats-chart" size={24} color={ZyncTheme.colors.primary} style={{ marginRight: 8 }} />
                    <ThemedText style={styles.headerTitle}>ZYNC BEATS</ThemedText>
                </View>
                <View style={styles.statusDot} />
            </View>

            <View style={styles.searchContainer}>
                <NeonInput
                    placeholder="Buscar canción o artista..."
                    icon="search"
                    value={search}
                    onChangeText={setSearch}
                    style={styles.searchInput}
                    containerStyle={{ marginBottom: 0 }}
                />
            </View>

            <FlatList
                data={filteredSongs}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    header: {
        padding: ZyncTheme.spacing.m,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: ZyncTheme.colors.background,
        borderBottomWidth: 1,
        borderBottomColor: ZyncTheme.colors.border,
    },
    headerTitle: {
        fontSize: ZyncTheme.typography.size.l,
        fontWeight: 'bold',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: ZyncTheme.colors.primary,
    },
    searchContainer: {
        padding: ZyncTheme.spacing.m,
    },
    searchInput: {
        backgroundColor: '#1E1E1E',
        borderWidth: 0,
    },
    listContent: {
        padding: ZyncTheme.spacing.m,
        gap: ZyncTheme.spacing.m,
        paddingBottom: 100,
    },
    songCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: ZyncTheme.spacing.s,
        backgroundColor: '#121212',
        borderColor: '#2a2a2a',
        borderWidth: 1,
    },
    songInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: ZyncTheme.spacing.m,
        flex: 1,
    },
    coverArt: {
        width: 48,
        height: 48,
        backgroundColor: '#333',
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    details: {
        justifyContent: 'center',
    },
    songTitle: {
        fontWeight: 'bold',
        fontSize: ZyncTheme.typography.size.m,
    },
    artist: {
        color: ZyncTheme.colors.textSecondary,
        fontSize: ZyncTheme.typography.size.s,
    },
    requestButton: {
        height: 36,
        paddingHorizontal: ZyncTheme.spacing.m,
    }
});
