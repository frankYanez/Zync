import { NeonButton } from '@/components/NeonButton';
import { NeonInput } from '@/components/NeonInput';
import { ScreenLayout } from '@/components/ScreenLayout';
import { ThemedText } from '@/components/themed-text';
import {
    CreateProductDto,
    Product,
    createProduct,
    getProductsByVenue,
    updateProduct,
} from '@/features/venues/services/product.service';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    TouchableOpacity,
    View,
} from 'react-native';

const CATEGORIES = ['Cócteles', 'Cervezas', 'Shots', 'Sin Alcohol', 'Champagne', 'Botella', 'Snacks', 'Otro'];

export default function CreateEditProductScreen() {
    const router = useRouter();
    const { id, venueId } = useLocalSearchParams<{ id?: string; venueId: string }>();
    const isEdit = Boolean(id);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [imageUrl, setImageUrl] = useState('');
    const [isAvailable, setIsAvailable] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!isEdit || !venueId || !id) return;
        // Load existing product data for editing
        getProductsByVenue(venueId).then(products => {
            const p = products.find(x => x.id === id);
            if (!p) return;
            setName(p.name);
            setDescription(p.description ?? '');
            setPrice(String(p.price));
            setCategory(p.category);
            setImageUrl(p.imageUrl ?? '');
            setIsAvailable(p.isAvailable);
        }).catch(e => console.error('Failed to load product', e));
    }, [id, venueId, isEdit]);

    const handleSubmit = async () => {
        if (!name.trim()) return Alert.alert('Error', 'Ingresá el nombre del producto.');
        if (!price || isNaN(parseFloat(price))) return Alert.alert('Error', 'Ingresá un precio válido.');
        if (!venueId) return Alert.alert('Error', 'Venue no especificado.');

        const data: CreateProductDto = {
            name: name.trim(),
            description: description.trim() || undefined,
            price: parseFloat(price),
            category,
            imageUrl: imageUrl.trim() || undefined,
            isAvailable,
        };

        setIsSubmitting(true);
        try {
            if (isEdit && id) {
                await updateProduct(venueId, id, data);
            } else {
                await createProduct(venueId, data);
            }
            router.back();
        } catch (error: any) {
            const msg = error?.response?.data?.message;
            Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg || 'No se pudo guardar el producto.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ScreenLayout style={styles.container} noPadding>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={ZyncTheme.colors.text} />
                </TouchableOpacity>
                <ThemedText style={styles.title}>{isEdit ? 'Editar producto' : 'Nuevo producto'}</ThemedText>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                    <View style={styles.field}>
                        <ThemedText style={styles.label}>Nombre *</ThemedText>
                        <NeonInput placeholder="ej. Negroni" value={name} onChangeText={setName} />
                    </View>

                    <View style={styles.field}>
                        <ThemedText style={styles.label}>Descripción (opcional)</ThemedText>
                        <NeonInput
                            placeholder="ej. Gin, Campari, Vermut dulce"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                        />
                    </View>

                    <View style={styles.field}>
                        <ThemedText style={styles.label}>Precio *</ThemedText>
                        <NeonInput
                            placeholder="ej. 1500"
                            value={price}
                            onChangeText={t => setPrice(t.replace(/[^0-9.]/g, ''))}
                            keyboardType="decimal-pad"
                        />
                    </View>

                    <View style={styles.field}>
                        <ThemedText style={styles.label}>Categoría</ThemedText>
                        <View style={styles.categoryGrid}>
                            {CATEGORIES.map(cat => (
                                <TouchableOpacity
                                    key={cat}
                                    style={[styles.catChip, category === cat && styles.catChipActive]}
                                    onPress={() => setCategory(cat)}
                                >
                                    <ThemedText style={[styles.catChipText, category === cat && styles.catChipTextActive]}>
                                        {cat}
                                    </ThemedText>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View style={styles.field}>
                        <ThemedText style={styles.label}>URL de imagen (opcional)</ThemedText>
                        <NeonInput
                            placeholder="https://..."
                            value={imageUrl}
                            onChangeText={setImageUrl}
                            autoCapitalize="none"
                            keyboardType="url"
                        />
                    </View>

                    <View style={styles.switchRow}>
                        <View>
                            <ThemedText style={styles.label}>Disponible</ThemedText>
                            <ThemedText style={styles.switchHint}>El producto aparece en el menú del cliente</ThemedText>
                        </View>
                        <Switch
                            value={isAvailable}
                            onValueChange={setIsAvailable}
                            trackColor={{ false: ZyncTheme.colors.border, true: ZyncTheme.colors.primary }}
                            thumbColor="#fff"
                        />
                    </View>

                    <View style={{ height: 16 }} />
                    <NeonButton
                        title={isSubmitting ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear producto'}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    />
                    <View style={{ height: 60 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: ZyncTheme.spacing.m,
        paddingTop: ZyncTheme.spacing.l,
        paddingBottom: ZyncTheme.spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.08)',
    },
    backButton: { marginRight: 16 },
    title: { fontSize: 22, fontWeight: 'bold', color: 'white' },
    scroll: { padding: ZyncTheme.spacing.m },
    field: { marginBottom: ZyncTheme.spacing.l },
    label: { fontSize: 13, fontWeight: '600', color: 'white', marginBottom: 8 },
    categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: ZyncTheme.spacing.s },
    catChip: {
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: ZyncTheme.colors.border,
        backgroundColor: ZyncTheme.colors.card,
    },
    catChipActive: { backgroundColor: ZyncTheme.colors.primary, borderColor: ZyncTheme.colors.primary },
    catChipText: { fontSize: 13, color: ZyncTheme.colors.textSecondary },
    catChipTextActive: { color: '#000', fontWeight: '700' },
    switchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: ZyncTheme.spacing.l,
    },
    switchHint: { fontSize: 12, color: ZyncTheme.colors.textSecondary, marginTop: 2 },
});
