import { CyberCard } from '@/components/CyberCard';
import { NeonButton } from '@/components/NeonButton';
import { ScreenLayout } from '@/components/ScreenLayout';
import { ThemedText } from '@/components/themed-text';
import { useZync } from '@/context/ZyncContext';
import { useCart } from '@/features/wallet/context/CartContext';
import { useVenueProducts } from '@/features/venues/hooks/useVenueProducts';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const ALL_LABEL = 'Todo';

export default function MenuScreen() {
    const router = useRouter();
    const { currentEstablishment } = useZync();
    const { totalItems, addToCart } = useCart();
    const [selectedCategory, setSelectedCategory] = useState<string>(ALL_LABEL);

    const venueId = currentEstablishment?.venueId;
    const { products, isLoading } = useVenueProducts(venueId);

    const categories = useMemo(() => {
        const unique = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
        return [ALL_LABEL, ...unique];
    }, [products]);

    const filtered = useMemo(() => {
        if (selectedCategory === ALL_LABEL) return products;
        return products.filter(p => p.category === selectedCategory);
    }, [products, selectedCategory]);

    // Ensure selectedCategory stays valid when products reload
    const safeCategory = categories.includes(selectedCategory) ? selectedCategory : ALL_LABEL;

    const renderItem = ({ item, index }: { item: typeof products[0]; index: number }) => (
        <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: index * 80, type: 'timing', duration: 400 }}
        >
            <CyberCard style={styles.drinkCard}>
                <View style={styles.drinkRow}>
                    <View style={styles.drinkImagePlaceholder}>
                        {item.imageUrl ? (
                            <Image source={{ uri: item.imageUrl }} style={styles.drinkImage} resizeMode="cover" />
                        ) : (
                            <Ionicons name="wine" size={32} color={ZyncTheme.colors.textSecondary} />
                        )}
                    </View>
                    <View style={styles.drinkInfo}>
                        <View style={styles.drinkHeader}>
                            <ThemedText style={styles.drinkName}>{item.name}</ThemedText>
                            <ThemedText style={styles.drinkPrice}>${item.price.toLocaleString()}</ThemedText>
                        </View>
                        {item.description ? (
                            <ThemedText style={styles.drinkDesc} numberOfLines={2}>{item.description}</ThemedText>
                        ) : null}
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => addToCart({
                                id: item.id,
                                name: item.name,
                                description: item.description ?? '',
                                price: item.price,
                                category: item.category,
                                image: item.imageUrl ?? '',
                            })}
                        >
                            <Ionicons name="add" size={24} color="#000" />
                        </TouchableOpacity>
                    </View>
                </View>
            </CyberCard>
        </MotiView>
    );

    return (
        <ScreenLayout noPadding>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={styles.logoIcon}>
                            <Ionicons name="cube" size={24} color={ZyncTheme.colors.primary} />
                        </View>
                        <ThemedText style={styles.headerTitle}>
                            {currentEstablishment?.name ?? 'Menú'}
                        </ThemedText>
                    </View>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
                    {categories.map(cat => (
                        <TouchableOpacity
                            key={cat}
                            style={[styles.filterChip, safeCategory === cat && styles.filterChipSelected]}
                            onPress={() => setSelectedCategory(cat)}
                        >
                            <ThemedText style={[styles.filterText, safeCategory === cat && styles.filterTextSelected]}>
                                {cat}
                            </ThemedText>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.listContainer}>
                {venueId ? null : (
                    <View style={styles.emptyState}>
                        <Ionicons name="location-outline" size={48} color={ZyncTheme.colors.textSecondary} />
                        <ThemedText style={styles.emptyText}>Seleccioná un lugar para ver el menú</ThemedText>
                    </View>
                )}

                {venueId && isLoading && (
                    <View style={styles.emptyState}>
                        <ActivityIndicator color={ZyncTheme.colors.primary} size="large" />
                    </View>
                )}

                {venueId && !isLoading && (
                    <FlatList
                        data={filtered}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Ionicons name="cube-outline" size={40} color={ZyncTheme.colors.textSecondary} />
                                <ThemedText style={styles.emptyText}>Sin productos en esta categoría</ThemedText>
                            </View>
                        }
                    />
                )}
            </View>

            {totalItems > 0 && (
                <View style={styles.cartButtonContainer}>
                    <NeonButton
                        title="CART"
                        onPress={() => router.push('/cart')}
                        icon={
                            <View style={{ position: 'relative' }}>
                                <Ionicons name="cart" size={24} color="black" />
                                <View style={styles.badge}>
                                    <ThemedText style={styles.badgeText}>{totalItems}</ThemedText>
                                </View>
                            </View>
                        }
                        style={styles.cartButton}
                        textStyle={{ fontSize: 16, fontWeight: 'bold' }}
                    />
                </View>
            )}
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingTop: 50,
        paddingBottom: ZyncTheme.spacing.m,
        backgroundColor: ZyncTheme.colors.background,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: ZyncTheme.spacing.m,
        marginBottom: ZyncTheme.spacing.m,
    },
    logoIcon: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: '#1E1E1E',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: ZyncTheme.spacing.s,
        borderWidth: 1,
        borderColor: '#333',
    },
    headerTitle: { fontSize: 24, fontWeight: 'bold' },
    filtersScroll: { paddingHorizontal: ZyncTheme.spacing.m, gap: ZyncTheme.spacing.s },
    filterChip: {
        paddingHorizontal: ZyncTheme.spacing.l,
        paddingVertical: ZyncTheme.spacing.s,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#333',
        backgroundColor: '#111',
    },
    filterChipSelected: { backgroundColor: ZyncTheme.colors.primary, borderColor: ZyncTheme.colors.primary },
    filterText: { color: '#888', fontWeight: '600' },
    filterTextSelected: { color: '#000', fontWeight: 'bold' },
    listContainer: { flex: 1, backgroundColor: '#000' },
    listContent: { padding: ZyncTheme.spacing.m, paddingBottom: 100, gap: ZyncTheme.spacing.m },
    drinkCard: { padding: 0, backgroundColor: '#111', borderWidth: 1, borderColor: '#222', borderRadius: 16 },
    drinkRow: { flexDirection: 'row' },
    drinkImagePlaceholder: {
        width: 100,
        height: 100,
        backgroundColor: '#222',
        alignItems: 'center',
        justifyContent: 'center',
        borderTopLeftRadius: 16,
        borderBottomLeftRadius: 16,
        overflow: 'hidden',
    },
    drinkImage: { width: '100%', height: '100%' },
    drinkInfo: { flex: 1, padding: ZyncTheme.spacing.m },
    drinkHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    drinkName: { fontWeight: 'bold', fontSize: 16, flex: 1, marginRight: 8 },
    drinkPrice: { color: ZyncTheme.colors.primary, fontWeight: 'bold', fontSize: 16 },
    drinkDesc: { fontSize: 12, color: '#666', flex: 1 },
    addButton: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: ZyncTheme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
    emptyText: { color: ZyncTheme.colors.textSecondary, fontSize: 14, textAlign: 'center', paddingHorizontal: 32 },
    cartButtonContainer: { position: 'absolute', bottom: 30, right: 20 },
    cartButton: { borderRadius: 25, height: 50, paddingHorizontal: 20 },
    badge: {
        position: 'absolute',
        top: -5,
        right: -5,
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: 'black',
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
});
