import { CyberCard } from '@/components/CyberCard';
import { NeonButton } from '@/components/NeonButton';
import { ScreenLayout } from '@/components/ScreenLayout';
import { ThemedText } from '@/components/themed-text';
import { Product } from '@/features/venues/services/product.service';
import { useVenueProducts } from '@/features/venues/hooks/useVenueProducts';
import { Venue, deleteVenue, getMyVenues } from '@/features/venues/services/venue.service';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Switch,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ProductsManagementScreen() {
    const router = useRouter();
    const [venues, setVenues] = useState<Venue[]>([]);
    const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
    const [loadingVenues, setLoadingVenues] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const { products, isLoading: loadingProducts, refresh: refreshProducts, remove } = useVenueProducts(selectedVenue?.id);

    const loadVenues = useCallback(async () => {
        try {
            const data = await getMyVenues();
            setVenues(data);
            if (data.length > 0 && !selectedVenue) {
                setSelectedVenue(data[0]);
            }
        } catch (e) {
            console.error('Failed to load venues', e);
        } finally {
            setLoadingVenues(false);
            setRefreshing(false);
        }
    }, [selectedVenue]);

    useEffect(() => { loadVenues(); }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadVenues();
        refreshProducts();
    };

    const handleDeleteProduct = (product: Product) => {
        Alert.alert(
            'Eliminar producto',
            `¿Eliminás "${product.name}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await remove(product.id);
                        } catch (e: any) {
                            const msg = e?.response?.data?.message;
                            Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg || 'No se pudo eliminar.');
                        }
                    },
                },
            ],
        );
    };

    // isAvailable is not part of the backend DTO — optimistic local toggle only
    const handleToggleAvailable = (product: Product) => {
        // No API call since the backend doesn't support isAvailable updates
        // The toggle reflects local state only until the list is refreshed
        console.warn('Toggle available: not supported by backend');
    };

    const handleDeleteVenue = (venue: Venue) => {
        Alert.alert(
            'Eliminar venue',
            `¿Eliminás "${venue.name}"? Esto también eliminará sus productos.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteVenue(venue.id);
                            const remaining = venues.filter(v => v.id !== venue.id);
                            setVenues(remaining);
                            if (selectedVenue?.id === venue.id) {
                                setSelectedVenue(remaining[0] ?? null);
                            }
                        } catch (e: any) {
                            const msg = e?.response?.data?.message;
                            Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg || 'No se pudo eliminar el venue.');
                        }
                    },
                },
            ],
        );
    };

    const renderProduct = ({ item }: { item: Product }) => (
        <CyberCard style={styles.productCard}>
            <View style={styles.productRow}>
                {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.productImg} contentFit="cover" />
                ) : (
                    <View style={[styles.productImg, styles.productImgFallback]}>
                        <Ionicons name="cube-outline" size={20} color={ZyncTheme.colors.textSecondary} />
                    </View>
                )}
                <View style={styles.productInfo}>
                    <ThemedText style={styles.productName}>{item.name}</ThemedText>
                    <ThemedText style={styles.productCategory}>{item.category}</ThemedText>
                    {item.description ? (
                        <ThemedText style={styles.productDesc} numberOfLines={1}>{item.description}</ThemedText>
                    ) : null}
                    <View style={styles.productMeta}>
                        <ThemedText style={styles.productPrice}>${item.price.toLocaleString()}</ThemedText>
                        <ThemedText style={[styles.availText, { color: item.isAvailable ? '#22C55E' : '#666' }]}>
                            {item.isAvailable ? '● Disponible' : '○ Oculto'}
                        </ThemedText>
                    </View>
                </View>
                <View style={styles.productActions}>
                    <Switch
                        value={item.isAvailable}
                        onValueChange={() => handleToggleAvailable(item)}
                        trackColor={{ false: ZyncTheme.colors.border, true: 'rgba(204,255,0,0.3)' }}
                        thumbColor={item.isAvailable ? ZyncTheme.colors.primary : '#666'}
                        style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
                    />
                    <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => router.push({ pathname: '/(business)/products/[id]' as any, params: { id: item.id, venueId: selectedVenue!.id } })}
                    >
                        <Ionicons name="create-outline" size={18} color={ZyncTheme.colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn} onPress={() => handleDeleteProduct(item)}>
                        <Ionicons name="trash-outline" size={18} color={ZyncTheme.colors.error} />
                    </TouchableOpacity>
                </View>
            </View>
        </CyberCard>
    );

    if (loadingVenues) {
        return (
            <ScreenLayout style={styles.centered} noPadding>
                <ActivityIndicator size="large" color={ZyncTheme.colors.primary} />
            </ScreenLayout>
        );
    }

    return (
        <ScreenLayout style={styles.container} noPadding>
            <View style={styles.header}>
                <ThemedText style={styles.title}>Productos</ThemedText>
                <TouchableOpacity
                    style={styles.addVenueBtn}
                    onPress={() => router.push('/(business)/products/create-venue' as any)}
                >
                    <Ionicons name="business-outline" size={16} color={ZyncTheme.colors.primary} />
                    <ThemedText style={styles.addVenueBtnText}>+ Venue</ThemedText>
                </TouchableOpacity>
            </View>

            {venues.length === 0 ? (
                <View style={styles.centered}>
                    <Ionicons name="business-outline" size={56} color={ZyncTheme.colors.textSecondary} />
                    <ThemedText style={styles.emptyText}>No tenés venues creados</ThemedText>
                    <NeonButton
                        title="Crear venue"
                        onPress={() => router.push('/(business)/products/create-venue' as any)}
                        style={{ marginTop: ZyncTheme.spacing.m, paddingHorizontal: 32 }}
                    />
                </View>
            ) : (
                <>
                    {/* Venue selector */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.venueScroll}
                    >
                        {venues.map(v => (
                            <TouchableOpacity
                                key={v.id}
                                style={[styles.venueChip, selectedVenue?.id === v.id && styles.venueChipActive]}
                                onPress={() => setSelectedVenue(v)}
                                onLongPress={() => handleDeleteVenue(v)}
                            >
                                <ThemedText style={[styles.venueChipText, selectedVenue?.id === v.id && styles.venueChipTextActive]}>
                                    {v.name}
                                </ThemedText>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {selectedVenue && (
                        <View style={styles.venueDetail}>
                            <ThemedText style={styles.venueAddress}>
                                <Ionicons name="location-outline" size={12} color={ZyncTheme.colors.textSecondary} /> {selectedVenue.address}
                            </ThemedText>
                            <TouchableOpacity
                                style={styles.addProductBtn}
                                onPress={() => router.push({ pathname: '/(business)/products/create' as any, params: { venueId: selectedVenue.id } })}
                            >
                                <Ionicons name="add" size={18} color="#000" />
                                <ThemedText style={styles.addProductBtnText}>Agregar</ThemedText>
                            </TouchableOpacity>
                        </View>
                    )}

                    {loadingProducts ? (
                        <View style={styles.centered}>
                            <ActivityIndicator color={ZyncTheme.colors.primary} />
                        </View>
                    ) : (
                        <FlatList
                            data={products}
                            keyExtractor={item => item.id}
                            renderItem={renderProduct}
                            contentContainerStyle={styles.productList}
                            showsVerticalScrollIndicator={false}
                            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ZyncTheme.colors.primary} />}
                            ListEmptyComponent={
                                <View style={styles.emptyProducts}>
                                    <Ionicons name="cube-outline" size={40} color={ZyncTheme.colors.textSecondary} />
                                    <ThemedText style={styles.emptyText}>Sin productos en este venue</ThemedText>
                                </View>
                            }
                        />
                    )}
                </>
            )}
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: ZyncTheme.spacing.m,
        paddingTop: ZyncTheme.spacing.l,
        paddingBottom: ZyncTheme.spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.08)',
    },
    title: { fontSize: 22, fontWeight: 'bold', color: 'white' },
    addVenueBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        borderWidth: 1,
        borderColor: ZyncTheme.colors.primary,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    addVenueBtnText: { fontSize: 13, color: ZyncTheme.colors.primary, fontWeight: '600' },
    venueScroll: { paddingHorizontal: ZyncTheme.spacing.m, paddingVertical: ZyncTheme.spacing.m, gap: ZyncTheme.spacing.s },
    venueChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: ZyncTheme.colors.card,
        borderWidth: 1,
        borderColor: ZyncTheme.colors.border,
    },
    venueChipActive: { backgroundColor: ZyncTheme.colors.primary, borderColor: ZyncTheme.colors.primary },
    venueChipText: { fontSize: 13, color: ZyncTheme.colors.textSecondary, fontWeight: '600' },
    venueChipTextActive: { color: '#000' },
    venueDetail: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: ZyncTheme.spacing.m,
        paddingBottom: ZyncTheme.spacing.s,
        borderBottomWidth: 1,
        borderBottomColor: ZyncTheme.colors.border,
    },
    venueAddress: { fontSize: 12, color: ZyncTheme.colors.textSecondary, flex: 1 },
    addProductBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: ZyncTheme.colors.primary,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    addProductBtnText: { fontSize: 13, fontWeight: '700', color: '#000' },
    productList: { padding: ZyncTheme.spacing.m, gap: ZyncTheme.spacing.s, paddingBottom: 60 },
    productCard: { padding: ZyncTheme.spacing.m },
    productRow: { flexDirection: 'row', alignItems: 'flex-start', gap: ZyncTheme.spacing.s },
    productImg: { width: 56, height: 56, borderRadius: 10 },
    productImgFallback: { backgroundColor: ZyncTheme.colors.card, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: ZyncTheme.colors.border },
    productInfo: { flex: 1, gap: 2 },
    productName: { fontSize: 14, fontWeight: '700', color: 'white' },
    productCategory: { fontSize: 11, color: ZyncTheme.colors.primary, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    productDesc: { fontSize: 12, color: ZyncTheme.colors.textSecondary },
    productMeta: { flexDirection: 'row', alignItems: 'center', gap: ZyncTheme.spacing.s, marginTop: 4 },
    productPrice: { fontSize: 15, fontWeight: '800', color: 'white' },
    availBadge: { borderRadius: 6, borderWidth: 1, paddingHorizontal: 6, paddingVertical: 1 },
    availText: { fontSize: 11, fontWeight: '600' },
    productActions: { gap: ZyncTheme.spacing.s },
    actionBtn: { padding: 4 },
    emptyProducts: { alignItems: 'center', paddingVertical: 48, gap: 10 },
    emptyText: { fontSize: 14, color: ZyncTheme.colors.textSecondary },
});
