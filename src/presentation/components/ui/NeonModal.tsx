import { useZync } from '@/application/ZyncContext';
import { MOCK_ESTABLISHMENTS } from '@/infrastructure/mock-data';
import { ThemedText } from '@/presentation/components/themed-text';
import { CyberCard } from '@/presentation/components/ui/CyberCard';
import { NeonInput } from '@/presentation/components/ui/NeonInput';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import { Dimensions, FlatList, Modal, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';

const { height, width } = Dimensions.get('window');

interface NeonModalProps {
    visible: boolean;
    onClose: () => void;
}

export function NeonModal({ visible, onClose }: NeonModalProps) {
    const { setEstablishment } = useZync();
    const [search, setSearch] = useState('');
    const [activeId, setActiveId] = useState<string | null>(null);

    const filteredEstablishments = MOCK_ESTABLISHMENTS.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.location.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = (id: string) => {
        setActiveId(id);
    };

    const handleConfirm = () => {
        const selected = MOCK_ESTABLISHMENTS.find(e => e.id === activeId);
        if (selected) {
            setEstablishment(selected);
            onClose();
            // Optional: reset state after closing
            setTimeout(() => {
                setActiveId(null);
                setSearch('');
            }, 300);
        }
    };

    const handleCancel = () => {
        setActiveId(null);
    };

    const renderItem = ({ item }: { item: typeof MOCK_ESTABLISHMENTS[0] }) => {
        const isActive = activeId === item.id;
        return (
            <TouchableOpacity onPress={() => handleSelect(item.id)} activeOpacity={0.5}>
                <CyberCard
                    style={[styles.card, isActive && styles.activeCard]}

                >
                    <View style={styles.cardContent}>
                        <Video
                            source={{ uri: item.video }}
                            style={styles.cardVideo}
                            resizeMode={ResizeMode.COVER}
                            shouldPlay={true}
                            isLooping
                            isMuted
                        />
                        <View style={styles.cardOverlay}>
                            <View style={styles.cardHeader}>
                                <ThemedText style={styles.cardName}>{item.name}</ThemedText>
                                {item.rating && (
                                    <View style={styles.ratingBadge}>
                                        <Ionicons name="star" size={12} color="black" />
                                        <ThemedText style={styles.ratingText}>{item.rating}</ThemedText>
                                    </View>
                                )}
                            </View>
                            <View style={styles.cardFooter}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Ionicons name="location-sharp" size={14} color={ZyncTheme.colors.primary} />
                                    <ThemedText style={styles.cardLocation}>{item.location}</ThemedText>
                                </View>
                                <ThemedText style={styles.cardDistance}>{item.distance}</ThemedText>
                            </View>
                        </View>
                        {isActive && <View style={styles.activeBorder} />}
                    </View>
                </CyberCard>
            </TouchableOpacity>
        );
    };

    const selectedEstablishment = MOCK_ESTABLISHMENTS.find(e => e.id === activeId);

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} onRequestClose={onClose} animationType="fade">
            <View style={styles.container}>
                <Pressable onPress={onClose} style={StyleSheet.absoluteFill}>
                    <View style={styles.backdrop} />
                </Pressable>

                {/* Pulsing Halo Effect - only show if not selecting */}
                {!activeId && (
                    <>
                        <MotiView
                            from={{ opacity: 0.2, scale: 1, }}
                            animate={{ opacity: 0, scale: 1.1 }}
                            transition={{
                                type: 'timing',
                                duration: 3000,
                                // delay: 500,
                                loop: true,
                                repeatReverse: true,
                            }}
                            style={styles.halo}
                        />
                    </>
                )}

                <View style={styles.modalContent}>
                    {/* Main List View */}
                    <View style={styles.header}>
                        <ThemedText style={styles.title}>SELECT LOCATION</ThemedText>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={ZyncTheme.colors.text} />
                        </TouchableOpacity>
                    </View>

                    <NeonInput
                        placeholder="Search for a vibe..."
                        icon="search"
                        value={search}
                        onChangeText={setSearch}
                        containerStyle={styles.searchContainer}
                    />

                    <FlatList
                        data={filteredEstablishments}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        contentContainerStyle={styles.list}
                        showsVerticalScrollIndicator={false}
                    />

                    {/* Selection Overlay */}
                    {activeId && selectedEstablishment && (
                        <MotiView
                            from={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ type: 'timing', duration: 300 }}
                            style={[
                                StyleSheet.absoluteFill,
                                { backgroundColor: 'black', padding: ZyncTheme.spacing.m, borderRadius: ZyncTheme.borderRadius.l, justifyContent: 'center', alignItems: 'center' }
                            ]}
                        >
                            <Video
                                source={{ uri: selectedEstablishment.video }}
                                style={StyleSheet.absoluteFill}
                                resizeMode={ResizeMode.COVER}
                                shouldPlay={true}
                                isLooping
                                isMuted
                            />
                            <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)' }} />

                            <ThemedText style={{ fontSize: 32, fontWeight: '900', color: 'white', marginBottom: 8, textAlign: 'center', paddingTop: 16 }}>
                                {selectedEstablishment.name}
                            </ThemedText>
                            <ThemedText style={{ fontSize: 16, color: '#ccc', marginBottom: 40, textAlign: 'center' }}>
                                {selectedEstablishment.location}
                            </ThemedText>

                            <TouchableOpacity
                                onPress={handleConfirm}
                                style={{
                                    backgroundColor: ZyncTheme.colors.primary,
                                    paddingVertical: 16,
                                    paddingHorizontal: 40,
                                    borderRadius: 30,
                                    marginBottom: 16,
                                    width: '100%',
                                    alignItems: 'center'
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
        justifyContent: 'center', // Center vertically
        alignItems: 'center',     // Center horizontally
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
        height: height * 0.7, // Match modal size roughly (or purely strictly visual)
        borderRadius: ZyncTheme.borderRadius.l,
        backgroundColor: ZyncTheme.colors.primary, // Glow color
        zIndex: 1, // Behind modal
        // opacity: 0.5,
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
        height: 140, // Slightly smaller for dense list
        overflow: 'hidden',
        borderWidth: 0,
    },
    activeCard: {
        transform: [{ scale: 1.02 }],
    },
    cardContent: {
        flex: 1,
    },
    cardVideo: {
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
        fontSize: 18, // Slightly smaller
        fontWeight: 'bold',
        color: 'white',
        textShadowColor: 'black',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 5,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: ZyncTheme.colors.primary,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        gap: 2,
    },
    ratingText: {
        color: 'black',
        fontWeight: 'bold',
        fontSize: 10,
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
    cardDistance: {
        color: ZyncTheme.colors.primary,
        fontSize: 10,
        fontWeight: 'bold',
        alignSelf: 'flex-end',
    },
    activeBorder: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: 2,
        borderColor: ZyncTheme.colors.primary,
        borderRadius: 16,
    }
});
