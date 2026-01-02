import { CyberCard } from '@/components/CyberCard';
import { NeonButton } from '@/components/NeonButton';
import { ScreenLayout } from '@/components/ScreenLayout';
import { ThemedText } from '@/components/themed-text';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Image, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { useCart } from '@/features/wallet/context/CartContext';
import { MOCK_MENU } from '@/infrastructure/mock-data';
import { MotiView } from 'moti';

const FILTERS = ['Autor', 'Clásicos', 'Cervezas', 'Shots', 'Sin Alcohol'];

export default function MenuScreen() {
    const router = useRouter();
    const [selectedFilter, setSelectedFilter] = useState('Autor');
    const { totalItems, addToCart } = useCart();

    const filteredDrinks = MOCK_MENU.filter(item => item.category === selectedFilter);

    const handleAddToCart = (item: typeof MOCK_MENU[0]) => {
        addToCart(item);
    };

    const renderDrink = ({ item, index }: { item: typeof MOCK_MENU[0], index: number }) => (
        <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: index * 100, type: 'timing', duration: 500 }}
        >
            <CyberCard style={styles.drinkCard}>
                <View style={styles.drinkRow}>
                    <View style={styles.drinkImagePlaceholder}>
                        {item.image ? (
                            <Image
                                source={{ uri: item.image }}
                                style={styles.drinkImage}
                                resizeMode="cover"
                            />
                        ) : (
                            <Ionicons name="wine" size={32} color={ZyncTheme.colors.textSecondary} />
                        )}
                    </View>
                    <View style={styles.drinkInfo}>
                        <View style={styles.drinkHeader}>
                            <ThemedText style={styles.drinkName}>{item.name}</ThemedText>
                            <ThemedText style={styles.drinkPrice}>${item.price.toLocaleString()}</ThemedText>
                        </View>
                        <ThemedText style={styles.drinkDesc}>{item.description}</ThemedText>
                        <TouchableOpacity style={styles.addButton} onPress={() => handleAddToCart(item)}>
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
                        <ThemedText style={styles.headerTitle}>Zync</ThemedText>
                    </View>
                    <TouchableOpacity style={styles.searchButton}>
                        <Ionicons name="search" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
                    {FILTERS.map(filter => (
                        <TouchableOpacity
                            key={filter}
                            style={[
                                styles.filterChip,
                                selectedFilter === filter && styles.filterChipSelected
                            ]}
                            onPress={() => setSelectedFilter(filter)}
                        >
                            <ThemedText style={[
                                styles.filterText,
                                selectedFilter === filter && styles.filterTextSelected
                            ]}>{filter}</ThemedText>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.listContainer}>
                <View style={styles.sectionHeader}>
                    <ThemedText style={styles.sectionTitle}>Signature Drinks</ThemedText>
                    <ThemedText style={styles.sectionSubtitle}>FEATURED</ThemedText>
                </View>

                <FlatList
                    data={filteredDrinks}
                    renderItem={renderDrink}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.listContent}

                />
            </View>

            {/* Floating Cart Button */}
            {totalItems > 0 && (
                <View style={styles.cartButtonContainer}>
                    <NeonButton
                        title="CART"
                        onPress={() => router.push('/cart')}
                        icon={<View style={{ position: 'relative' }}>
                            <Ionicons name="cart" size={24} color="black" />
                            <View style={styles.badge}><ThemedText style={styles.badgeText}>{totalItems}</ThemedText></View>
                        </View>}
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
        paddingTop: 50, // Custom unsafe area handling for immersive look
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
        borderColor: '#333'
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    searchButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1E1E1E',
        alignItems: 'center',
        justifyContent: 'center',
    },
    filtersScroll: {
        paddingHorizontal: ZyncTheme.spacing.m,
        gap: ZyncTheme.spacing.s,
    },
    filterChip: {
        paddingHorizontal: ZyncTheme.spacing.l,
        paddingVertical: ZyncTheme.spacing.s,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#333',
        backgroundColor: '#111',
    },
    filterChipSelected: {
        backgroundColor: ZyncTheme.colors.primary,
        borderColor: ZyncTheme.colors.primary,
    },
    filterText: {
        color: '#888',
        fontWeight: '600',
    },
    filterTextSelected: {
        color: '#000',
        fontWeight: 'bold',
    },
    listContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: ZyncTheme.spacing.m,
        marginBottom: ZyncTheme.spacing.m,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    sectionSubtitle: {
        fontSize: 10,
        color: ZyncTheme.colors.primary,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    listContent: {
        padding: ZyncTheme.spacing.m,
        paddingBottom: 100,
        gap: ZyncTheme.spacing.m,
    },
    drinkCard: {
        padding: 0,
        backgroundColor: '#111',
        borderWidth: 1,
        borderColor: '#222',
        borderRadius: 16,
    },
    drinkRow: {
        flexDirection: 'row',
    },
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
    drinkImage: {
        width: '100%',
        height: '100%',
    },
    drinkInfo: {
        flex: 1,
        padding: ZyncTheme.spacing.m,
    },
    drinkHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    drinkName: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    drinkPrice: {
        color: ZyncTheme.colors.primary,
        fontWeight: 'bold',
        fontSize: 16,
    },
    drinkDesc: {
        fontSize: 12,
        color: '#666',
        flex: 1,
    },
    addButton: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#333',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#444',
    },
    cartButtonContainer: {
        position: 'absolute',
        bottom: 30,
        right: 20,
    },
    cartButton: {
        borderRadius: 25,
        height: 50,
        paddingHorizontal: 20,
    },
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
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold'
    }
});
