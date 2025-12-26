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
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

export default function BeatsScreen() {
    const { authState, updateBalance, activeRequest, submitSongRequest } = useZync();
    const [search, setSearch] = useState('');
    const [songs, setSongs] = useState<SpotifyTrack[]>([]);
    const [loading, setLoading] = useState(false);
    const [isRequesting, setIsRequesting] = useState(false);

    const CLIENT_ID = 'e11abe3738f34ac28dcd2ade25d1cfb4';
    const CLIENT_SECRET = 'ec39c89a04364c028630d0811f41c982';
    // Background Animation
    const pulseAnim = useSharedValue(0.1);

    useEffect(() => {
        pulseAnim.value = withRepeat(
            withTiming(0.2, { duration: 2000 }),
            -1,
            true
        );
    }, []);

    const animatedBgStyle = useAnimatedStyle(() => ({
        opacity: pulseAnim.value,
        transform: [{ scale: interpolate(pulseAnim.value, [0.1, 0.2], [1, 1.1]) }]
    }));

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

    const handleRequest = async (track: SpotifyTrack) => {
        if (activeRequest) {
            alert("Ya tienes un pedido en curso. Espera a que el DJ lo ponga.");
            return;
        }

        const price = 250;
        if ((authState.user?.balance || 0) >= price) {
            setIsRequesting(true);

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            updateBalance((authState.user?.balance || 0) - price);
            submitSongRequest(track);
            setIsRequesting(false);
            setSearch(''); // Clear search to show the request better
            // Ideally scroll to top here
        } else {
            // Show error
            alert("Saldo insuficiente");
        }
    };

    const renderItem = ({ item }: { item: SpotifyTrack }) => {
        const isPending = !!activeRequest;

        return (
            <CyberCard style={[styles.songCard, isPending && { opacity: 0.6 }]}>
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
                    title={isRequesting && !activeRequest ? "..." : (isPending ? "PENDIENTE" : `PEDIR $250`)}
                    onPress={() => handleRequest(item)}
                    textStyle={{ fontSize: 10, fontWeight: 'bold' }}
                    style={[styles.requestButton, isPending && { borderColor: '#555', backgroundColor: 'transparent' }]}
                    disabled={isRequesting || isPending}
                />
            </CyberCard>
        );
    };

    return (
        <ScreenLayout noPadding>
            {/* Background Animation */}
            <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
                <View style={styles.bgContainer}>
                    <Animated.View style={[styles.pulseCircle, animatedBgStyle]}>
                        <Ionicons name="musical-notes" size={300} color={ZyncTheme.colors.primary} />
                    </Animated.View>
                </View>
            </View>

            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="stats-chart" size={24} color={ZyncTheme.colors.primary} style={{ marginRight: 8 }} />
                    <ThemedText style={styles.headerTitle}>ZYNC BEATS</ThemedText>
                </View>
                <View style={styles.statusDot} />
            </View>

            {/* Current Request Section */}
            {activeRequest && (
                <View style={[styles.searchContainer, { paddingBottom: 0 }]}>
                    <ThemedText style={styles.sectionTitle}>PLAYING NEXT</ThemedText>
                    <CyberCard style={[styles.songCard, styles.currentRequestCard]}>
                        <View style={styles.songInfo}>
                            <View style={styles.coverArt}>
                                {activeRequest.album.images[0] && (
                                    <Image
                                        source={{ uri: activeRequest.album.images[0].url }}
                                        style={{ width: '100%', height: '100%', borderRadius: 4 }}
                                    />
                                )}
                            </View>
                            <View style={styles.details}>
                                <ThemedText style={styles.songTitle} numberOfLines={1}>{activeRequest.name}</ThemedText>
                                <ThemedText style={[styles.artist, { color: ZyncTheme.colors.primary }]} numberOfLines={1}>
                                    Pedido Confirmado
                                </ThemedText>
                            </View>
                        </View>
                        <Ionicons name="checkmark-circle" size={32} color={ZyncTheme.colors.primary} />
                    </CyberCard>
                </View>
            )}

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

            {loading || isRequesting ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={ZyncTheme.colors.primary} />
                    {isRequesting && <ThemedText style={styles.loadingText}>Enviando pedido...</ThemedText>}
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
    },
    bgContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0.1,
    },
    pulseCircle: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    currentRequestCard: {
        borderColor: ZyncTheme.colors.primary,
        borderWidth: 1,
        backgroundColor: 'rgba(204, 255, 0, 0.05)',
        marginBottom: ZyncTheme.spacing.m,
    },
    sectionTitle: {
        fontSize: 12,
        color: ZyncTheme.colors.primary,
        marginBottom: 8,
        letterSpacing: 1.5,
        fontWeight: 'bold',
    },
    loadingText: {
        marginTop: 10,
        color: ZyncTheme.colors.primary,
        fontSize: 14,
        letterSpacing: 1,
    }
});
