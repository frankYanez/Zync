import { ScreenLayout } from '@/components/ScreenLayout';
import { ThemedText } from '@/components/themed-text';
import { PromoCode } from '@/features/dj/domain/dj.types';
import { useDjGigs } from '@/hooks/useDjGigs';
import { useDjProfile } from '@/hooks/useDjProfile';
import { useDjPromoCodes } from '@/hooks/useDjPromoCodes';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

export default function DjPromoCodesScreen() {
    const router = useRouter();
    const [showEventModal, setShowEventModal] = useState(false);

    // Obtener el perfil DJ del usuario autenticado
    const { profile } = useDjProfile();

    // Hooks conectados a los endpoints del backend
    const { promoCodes, isLoading, isGenerating, createPromoCode } = useDjPromoCodes(profile?.id);
    const { gigs } = useDjGigs(profile?.id);

    /**
     * Maneja la creación de un código de descuento para el evento seleccionado.
     * Cierra el modal antes de hacer la petición para mejor UX.
     */
    const handleCreatePromo = async (eventId: string, eventName: string) => {
        setShowEventModal(false);
        try {
            // createPromoCode del hook genera el código y recarga la lista automáticamente
            await createPromoCode(eventId);
            Alert.alert('¡Listo!', `Código generado para ${eventName}`);
        } catch (error) {
            console.error('Error al generar código promo:', error);
            Alert.alert('Error', 'No se pudo generar el código de descuento.');
        }
    };

    const renderPromoItem = ({ item }: { item: PromoCode }) => (
        <View style={styles.promoCard}>
            <View style={styles.promoInfo}>
                <ThemedText style={styles.promoCode}>{item.code}</ThemedText>
                <ThemedText style={styles.eventName}>{item.eventName}</ThemedText>
                <ThemedText style={styles.createdAt}>
                    Creado: {new Date(item.createdAt).toLocaleDateString('es-ES')}
                </ThemedText>
            </View>
            <View style={styles.statsBadge}>
                <ThemedText style={styles.statsValue}>{item.usedCount}</ThemedText>
                <ThemedText style={styles.statsLabel}>Usos</ThemedText>
            </View>
        </View>
    );

    return (
        <ScreenLayout style={styles.container} noPadding>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={ZyncTheme.colors.text} />
                </TouchableOpacity>
                <ThemedText style={styles.title}>Descuentos</ThemedText>
                {/* Botón para generar nuevo código */}
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setShowEventModal(true)}
                    disabled={isGenerating || isLoading}
                >
                    <Ionicons name="add-circle" size={30} color={ZyncTheme.colors.primary} />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={ZyncTheme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={promoCodes}
                    renderItem={renderPromoItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="pricetag-outline" size={64} color={ZyncTheme.colors.textSecondary} />
                            <ThemedText style={styles.emptyText}>
                                Aún no tienes códigos de descuento.
                            </ThemedText>
                            <TouchableOpacity
                                style={styles.emptyButton}
                                onPress={() => setShowEventModal(true)}
                            >
                                <ThemedText style={styles.emptyButtonText}>Generar primer código</ThemedText>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}

            {/* Modal para seleccionar el evento al que asociar el código */}
            <Modal visible={showEventModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <ThemedText style={styles.modalTitle}>Selecciona un evento</ThemedText>
                            <TouchableOpacity onPress={() => setShowEventModal(false)}>
                                <Ionicons name="close" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.modalScroll}>
                            {gigs.length === 0 ? (
                                <View style={styles.modalEmpty}>
                                    <ThemedText style={styles.emptyText}>
                                        No tienes gigs disponibles.
                                    </ThemedText>
                                </View>
                            ) : (
                                gigs.map((gig) => (
                                    <TouchableOpacity
                                        key={gig.eventId}
                                        style={styles.eventItem}
                                        onPress={() => handleCreatePromo(gig.eventId, gig.eventName)}
                                    >
                                        <ThemedText style={styles.eventItemName}>{gig.eventName}</ThemedText>
                                        <ThemedText style={styles.eventItemDate}>
                                            {new Date(gig.startsAt).toLocaleDateString('es-ES', {
                                                weekday: 'short',
                                                day: 'numeric',
                                                month: 'long',
                                            })}
                                        </ThemedText>
                                    </TouchableOpacity>
                                ))
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Overlay de carga mientras se genera un código */}
            {isGenerating && (
                <View style={styles.overlayLoader}>
                    <ActivityIndicator size="large" color={ZyncTheme.colors.primary} />
                    <ThemedText style={styles.generatingText}>Generando código...</ThemedText>
                </View>
            )}
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: ZyncTheme.spacing.m,
        paddingTop: ZyncTheme.spacing.l,
        paddingBottom: ZyncTheme.spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    backButton: {
        marginRight: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
        flex: 1,
    },
    addButton: {
        padding: 2,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: ZyncTheme.spacing.m,
    },
    promoCard: {
        flexDirection: 'row',
        backgroundColor: ZyncTheme.colors.card,
        borderRadius: ZyncTheme.borderRadius.m,
        padding: ZyncTheme.spacing.m,
        marginBottom: ZyncTheme.spacing.m,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: ZyncTheme.colors.border,
    },
    promoInfo: {
        flex: 1,
    },
    promoCode: {
        fontSize: 18,
        fontWeight: 'bold',
        color: ZyncTheme.colors.primary,
        letterSpacing: 1.5,
    },
    eventName: {
        fontSize: 14,
        color: ZyncTheme.colors.textSecondary,
        marginTop: 4,
    },
    createdAt: {
        fontSize: 11,
        color: ZyncTheme.colors.textSecondary,
        marginTop: 2,
        opacity: 0.7,
    },
    statsBadge: {
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 10,
        borderRadius: 10,
        minWidth: 64,
    },
    statsValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    statsLabel: {
        fontSize: 10,
        color: ZyncTheme.colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 100,
        gap: 16,
        paddingHorizontal: ZyncTheme.spacing.l,
    },
    emptyText: {
        fontSize: 15,
        color: ZyncTheme.colors.textSecondary,
        textAlign: 'center',
    },
    emptyButton: {
        backgroundColor: ZyncTheme.colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 28,
        borderRadius: 12,
        marginTop: 8,
    },
    emptyButtonText: {
        color: ZyncTheme.colors.background,
        fontWeight: 'bold',
        fontSize: 15,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: ZyncTheme.colors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '70%',
        padding: ZyncTheme.spacing.m,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    modalScroll: {
        marginBottom: 20,
    },
    eventItem: {
        paddingVertical: 14,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.08)',
    },
    eventItemName: {
        fontSize: 16,
        fontWeight: '600',
    },
    eventItemDate: {
        fontSize: 12,
        color: ZyncTheme.colors.textSecondary,
        marginTop: 4,
    },
    modalEmpty: {
        padding: 40,
        alignItems: 'center',
    },
    overlayLoader: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        zIndex: 10,
    },
    generatingText: {
        color: 'white',
        fontSize: 14,
    },
});
