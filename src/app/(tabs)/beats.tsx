import { useZync } from '@/application/ZyncContext';
import { SpotifyTrack, spotifyService } from '@/infrastructure/spotify-service';
import { ScreenLayout } from '@/presentation/components/ScreenLayout';
import { ThemedText } from '@/presentation/components/themed-text';
import { CyberCard } from '@/presentation/components/ui/CyberCard';
import { NeonButton } from '@/presentation/components/ui/NeonButton';
import { NeonInput } from '@/presentation/components/ui/NeonInput';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, View } from 'react-native';

export default function BeatsScreen() {
    const { authState, updateBalance } = useZync();
    const [search, setSearch] = useState('');
    const [songs, setSongs] = useState<SpotifyTrack[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const timeoutId = setTimeout(async () => {
            if (search.length >= 2) {
                setLoading(true);
                const results = await spotifyService.searchTracks(search);
                setSongs(results);
                setLoading(false);
            } else {
                setSongs([]);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [search]);

    const handleRequest = (track: SpotifyTrack) => {
        // fixed price for now, or dynamic based on logic
        const price = 250;
        if ((authState.user?.balance || 0) >= price) {
            updateBalance((authState.user?.balance || 0) - price);
            // Show success toast/alert
        } else {
            // Show error
        }
    };

    const renderItem = ({ item }: { item: SpotifyTrack }) => (
        <CyberCard style={styles.songCard}>
            <View style={styles.songInfo}>
                <View style={styles.coverArt}>
                    {item.album.images[0] ? (
                        <Image
                            source={{ uri: item.album.images[0].url }}
                            style={{ width: '100%', height: '100%', borderRadius: 4 }}
                        />
                    ) : (
                        <Ionicons name="musical-note" size={24} color={ZyncTheme.colors.textSecondary} />
                    )}
                </View>
                <View style={styles.details}>
                    <ThemedText style={styles.songTitle} numberOfLines={1}>{item.name}</ThemedText>
                    <ThemedText style={styles.artist} numberOfLines={1}>
                        {item.artists.map(a => a.name).join(', ')}
                    </ThemedText>
                </View>
            </View>
            <NeonButton
                title={`PEDIR X $250`}
                onPress={() => handleRequest(item)}
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

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={ZyncTheme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={songs}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        search.length > 0 ? (
                            <View style={styles.centerContainer}>
                                <ThemedText style={styles.emptyText}>No se encontraron resultados</ThemedText>
                            </View>
                        ) : (
                            <View style={styles.centerContainer}>
                                <Ionicons name="musical-notes-outline" size={48} color={ZyncTheme.colors.textSecondary} style={{ opacity: 0.5 }} />
                                <ThemedText style={styles.emptyText}>Busca tu música favorita</ThemedText>
                            </View>
                        )
                    }
                />
            )}
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
    centerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 40,
    },
    emptyText: {
        color: ZyncTheme.colors.textSecondary,
        marginTop: 16,
        fontSize: 16,
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
        marginRight: 8,
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
        flex: 1,
    },
    songTitle: {
        fontWeight: 'bold',
        fontSize: ZyncTheme.typography.size.m,
        color: 'white',
    },
    artist: {
        color: ZyncTheme.colors.textSecondary,
        fontSize: ZyncTheme.typography.size.s,
    },
    requestButton: {
        height: 36,
        paddingHorizontal: ZyncTheme.spacing.m,
        minWidth: 100,
    }
});
