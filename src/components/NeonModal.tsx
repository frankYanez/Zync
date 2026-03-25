import { CyberCard } from '@/components/CyberCard';
import { NeonInput } from '@/components/NeonInput';
import { ThemedText } from '@/components/themed-text';
import { useZync } from '@/context/ZyncContext';
import { Establishment } from '@/infrastructure/mock-data';
import { getEvents } from '@/features/dashboard/services/event.service';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Image, Modal, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';

const { height, width } = Dimensions.get('window');

interface NeonModalProps {
    visible: boolean;
    onClose: () => void;
}

const formatEventDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })
        + ' • '
        + date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
};

export function NeonModal({ visible, onClose }: NeonModalProps) {
    const { setEstablishment } = useZync();
    const [search, setSearch] = useState('');
    const [activeId, setActiveId] = useState<string | null>(null);
    const [events, setEvents] = useState<Establishment[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!visible) return;
        setLoading(true);
        getEvents(0, 50)
            .then((data) => {
                const mapped: Establishment[] = data.map((event) => ({
                    id: event.id,
                    eventId: event.id,
                    venueId: event.venueId,
                    name: event.name,
                    location: event.venue
                        ? `${event.venue.name}${event.venue.address ? ` • ${event.venue.address}` : ''}`
                        : '',
                    image: event.imageUrl ?? '',
                    video: '',
                    rating: 0,
                    theme: 'cyber',
                    currentDj: event.isActive
                        ? { name: '', genre: '', startTime: '', endTime: '', isLive: true }
                        : undefined,
                }));
                setEvents(mapped);
            })
            .catch(() => setEvents([]))
            .finally(() => setLoading(false));
    }, [visible]);

    const filtered = events.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.location.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = (id: string) => setActiveId(id);

    const handleConfirm = () => {
        const selected = events.find(e => e.id === activeId);
        if (selected) {
            setEstablishment(selected);
            onClose();
            setTimeout(() => {
                setActiveId(null);
                setSearch('');
            }, 300);
        }
    };

    const handleCancel = () => setActiveId(null);

    const renderItem = ({ item }: { item: Establishment }) => {
        const isActive = activeId === item.id;
        return (
            <TouchableOpacity onPress={() => handleSelect(item.id)} activeOpacity={0.5}>
                <CyberCard style={[styles.card, isActive && styles.activeCard]}>
                    <View style={styles.cardContent}>
                        {item.image ? (
                            <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />
                        ) : (
                            <View style={[styles.cardImage, { backgroundColor: '#1a1a1a' }]} />
                        )}
                        <View style={styles.cardOverlay}>
                            <View style={styles.cardHeader}>
                                <ThemedText style={styles.cardName}>{item.name}</ThemedText>
                                {item.currentDj?.isLive && (
                                    <View style={styles.liveBadge}>
                                        <View style={styles.liveDot} />
                                        <ThemedText style={styles.liveText}>ACTIVE</ThemedText>
                                    </View>
                                )}
                            </View>
                            <View style={styles.cardFooter}>
                                {item.location ? (
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Ionicons name="location-sharp" size={14} color={ZyncTheme.colors.primary} />
                                        <ThemedText style={styles.cardLocation}>{item.location}</ThemedText>
                                    </View>
                                ) : null}
                            </View>
                        </View>
                        {isActive && <View style={styles.activeBorder} />}
                    </View>
                </CyberCard>
            </TouchableOpacity>
        );
    };

    const selectedEvent = events.find(e => e.id === activeId);

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} onRequestClose={onClose} animationType="fade">
            <View style={styles.container}>
                <Pressable onPress={onClose} style={StyleSheet.absoluteFill}>
                    <View style={styles.backdrop} />
                </Pressable>

                {!activeId && (
                    <MotiView
                        from={{ opacity: 0.2, scale: 1 }}
                        animate={{ opacity: 0, scale: 1.1 }}
                        transition={{ type: 'timing', duration: 3000, loop: true, repeatReverse: true }}
                        style={styles.halo}
                    />
                )}

                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <ThemedText style={styles.title}>SELECT EVENT</ThemedText>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={ZyncTheme.colors.text} />
                        </TouchableOpacity>
                    </View>

                    <NeonInput
                        placeholder="Search events or venues..."
                        icon="search"
                        value={search}
                        onChangeText={setSearch}
                        containerStyle={styles.searchContainer}
                    />

                    {loading ? (
                        <ActivityIndicator color={ZyncTheme.colors.primary} style={{ marginVertical: 40 }} />
                    ) : (
                        <FlatList
                            data={filtered}
                            renderItem={renderItem}
                            keyExtractor={item => item.id}
                            contentContainerStyle={styles.list}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={
                                <ThemedText style={{ color: ZyncTheme.colors.textSecondary, textAlign: 'center', marginTop: 20 }}>
                                    No events found
                                </ThemedText>
                            }
                        />
                    )}

                    {activeId && selectedEvent && (
                        <MotiView
                            from={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ type: 'timing', duration: 300 }}
                            style={[
                                StyleSheet.absoluteFill,
                                { backgroundColor: 'black', padding: ZyncTheme.spacing.m, borderRadius: ZyncTheme.borderRadius.l, justifyContent: 'center', alignItems: 'center' }
                            ]}
                        >
                            {selectedEvent.image ? (
                                <Image
                                    source={{ uri: selectedEvent.image }}
                                    style={StyleSheet.absoluteFillObject}
                                    resizeMode="cover"
                                />
                            ) : null}
                            <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)' }} />

                            <ThemedText style={{ fontSize: 32, fontWeight: '900', color: 'white', marginBottom: 8, textAlign: 'center', paddingTop: 16 }}>
                                {selectedEvent.name}
                            </ThemedText>
                            {selectedEvent.location ? (
                                <ThemedText style={{ fontSize: 16, color: '#ccc', marginBottom: 40, textAlign: 'center' }}>
                                    {selectedEvent.location}
                                </ThemedText>
                            ) : null}

                            <TouchableOpacity
                                onPress={handleConfirm}
                                style={{
                                    backgroundColor: ZyncTheme.colors.primary,
                                    paddingVertical: 16,
                                    paddingHorizontal: 40,
                                    borderRadius: 30,
                                    marginBottom: 16,
                                    width: '100%',
                                    alignItems: 'center',
                                }}
                            >
                                <ThemedText style={{ color: 'black', fontWeight: '900', fontSize: 18 }}>CONFIRM SELECTION</ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleCancel}>
                                <ThemedText style={{ color: 'white', textDecorationLine: 'underline' }}>Cancel</ThemedText>
                            </TouchableOpacity>
                        </MotiView>
                    )}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    modalContent: {
        width: width * 0.9,
        maxHeight: height * 0.7,
        backgroundColor: '#0a0a0a',
        borderRadius: ZyncTheme.borderRadius.l,
        padding: ZyncTheme.spacing.m,
        shadowColor: ZyncTheme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 30,
        elevation: 20,
        borderWidth: 1,
        borderColor: ZyncTheme.colors.primary,
        zIndex: 10,
    },
    halo: {
        position: 'absolute',
        width: width * 0.9,
        height: height * 0.7,
        borderRadius: ZyncTheme.borderRadius.l,
        backgroundColor: ZyncTheme.colors.primary,
        zIndex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: ZyncTheme.spacing.l,
    },
    title: {
        fontSize: 24,
        fontWeight: '900',
        letterSpacing: 1,
        color: 'white',
        textShadowColor: ZyncTheme.colors.primary,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    closeButton: {
        padding: 5,
    },
    searchContainer: {
        marginBottom: ZyncTheme.spacing.l,
    },
    list: {
        gap: ZyncTheme.spacing.m,
        paddingBottom: 20,
    },
    card: {
        height: 140,
        overflow: 'hidden',
        borderWidth: 0,
    },
    activeCard: {
        transform: [{ scale: 1.02 }],
    },
    cardContent: {
        flex: 1,
    },
    cardImage: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#111',
    },
    cardOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'space-between',
        padding: ZyncTheme.spacing.m,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    cardName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        textShadowColor: 'black',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 5,
        flex: 1,
    },
    liveBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(204,255,0,0.15)',
        borderWidth: 1,
        borderColor: ZyncTheme.colors.primary,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        marginLeft: 8,
    },
    liveDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: ZyncTheme.colors.primary,
        marginRight: 4,
    },
    liveText: {
        color: ZyncTheme.colors.primary,
        fontSize: 10,
        fontWeight: 'bold',
    },
    cardFooter: {
        gap: 2,
    },
    cardLocation: {
        color: '#ddd',
        fontSize: 12,
        marginLeft: 4,
        fontWeight: '600',
    },
    activeBorder: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: 2,
        borderColor: ZyncTheme.colors.primary,
        borderRadius: 16,
    },
});
