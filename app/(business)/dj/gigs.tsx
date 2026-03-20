import { ScreenLayout } from '@/components/ScreenLayout';
import { ThemedText } from '@/components/themed-text';
import { Gig } from '@/features/dj/domain/dj.types';
import { useDjGigs } from '@/hooks/useDjGigs';
import { useDjProfile } from '@/hooks/useDjProfile';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function DjGigsScreen() {
    const router = useRouter();

    // Obtener perfil DJ del usuario autenticado para extraer su ID
    const { profile, isLoading: profileLoading } = useDjProfile();

    // Cargar los gigs usando el ID del perfil DJ
    const { gigs, isLoading: gigsLoading, refetch } = useDjGigs(profile?.id);

    const isLoading = profileLoading || gigsLoading;

    const renderGigItem = ({ item }: { item: Gig }) => (
        <View style={styles.gigCard}>
            <View style={styles.gigInfo}>
                <ThemedText style={styles.eventName}>{item.eventName}</ThemedText>
                <View style={styles.dateContainer}>
                    <Ionicons name="calendar-outline" size={14} color={ZyncTheme.colors.textSecondary} />
                    <ThemedText style={styles.dateText}>
                        {new Date(item.startsAt).toLocaleDateString('es-ES', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'long',
                        })}
                    </ThemedText>
                </View>
                <View style={styles.dateContainer}>
                    <Ionicons name="time-outline" size={14} color={ZyncTheme.colors.textSecondary} />
                    <ThemedText style={styles.dateText}>
                        {new Date(item.startsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {' - '}
                        {new Date(item.endsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </ThemedText>
                </View>
            </View>
            <TouchableOpacity style={styles.detailsButton}>
                <Ionicons name="information-circle-outline" size={24} color={ZyncTheme.colors.primary} />
            </TouchableOpacity>
        </View>
    );

    return (
        <ScreenLayout style={styles.container} noPadding>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={ZyncTheme.colors.text} />
                </TouchableOpacity>
                <ThemedText style={styles.title}>Mis Gigs</ThemedText>
                {/* Botón de recargar */}
                <TouchableOpacity onPress={refetch} style={styles.refreshButton} disabled={isLoading}>
                    <Ionicons name="refresh" size={22} color={ZyncTheme.colors.primary} />
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={ZyncTheme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={gigs}
                    renderItem={renderGigItem}
                    keyExtractor={(item) => item.eventId}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="musical-notes-outline" size={64} color={ZyncTheme.colors.textSecondary} />
                            <ThemedText style={styles.emptyText}>Aún no tienes gigs confirmados.</ThemedText>
                        </View>
                    }
                />
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
    refreshButton: {
        padding: 4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: ZyncTheme.spacing.m,
    },
    gigCard: {
        flexDirection: 'row',
        backgroundColor: ZyncTheme.colors.card,
        borderRadius: ZyncTheme.borderRadius.m,
        padding: ZyncTheme.spacing.m,
        marginBottom: ZyncTheme.spacing.m,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: ZyncTheme.colors.border,
    },
    gigInfo: {
        flex: 1,
    },
    eventName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 6,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginTop: 3,
    },
    dateText: {
        fontSize: 14,
        color: ZyncTheme.colors.textSecondary,
    },
    detailsButton: {
        padding: 8,
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
        textAlign: 'center',
    },
});
