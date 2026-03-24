import { ScreenLayout } from '@/components/ScreenLayout';
import { ThemedText } from '@/components/themed-text';
import { getMyEvents } from '@/features/dashboard/services/event.service';
import { DjProfile } from '@/features/dj/domain/dj.types';
import { addDjToLineup, getDjs } from '@/features/dj/services/dj.service';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface EventSummary {
    id: string;
    name: string;
    date: string;
}

export default function OrganizerLineupScreen() {
    const router = useRouter();
    const [events, setEvents] = useState<EventSummary[]>([]);
    const [djs, setDjs] = useState<DjProfile[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // In a real app, we'd use getMyEvents() for the organizer.
                // Here we fetch all events as a placeholder.
                const [eventList, djList] = await Promise.all([
                    getMyEvents(),
                    getDjs()
                ]);
                setEvents(eventList);
                setDjs(djList);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleAddDj = async (djId: string) => {
        if (!selectedEventId) {
            Alert.alert("Select Event", "Please select an event first.");
            return;
        }

        setIsActionLoading(true);
        try {
            await addDjToLineup(djId, selectedEventId);
            Alert.alert("Success!", "DJ added to the event lineup.");
        } catch (error) {
            console.error("Error adding DJ:", error);
            Alert.alert("Error", "Failed to add DJ to lineup.");
        } finally {
            setIsActionLoading(false);
        }
    };

    if (isLoading) {
        return (
            <ScreenLayout style={styles.center}>
                <ActivityIndicator size="large" color={ZyncTheme.colors.primary} />
            </ScreenLayout>
        );
    }

    return (
        <ScreenLayout noPadding>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <ThemedText style={styles.headerTitle}>Manage Lineups</ThemedText>
            </View>

            <View style={styles.sectionContainer}>
                <ThemedText style={styles.sectionTitle}>1. Select Event</ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.eventScroller}>
                    {events.map((event) => (
                        <TouchableOpacity
                            key={event.id}
                            style={[
                                styles.eventChip,
                                selectedEventId === event.id && styles.eventChipActive
                            ]}
                            onPress={() => setSelectedEventId(event.id)}
                        >
                            <ThemedText style={[
                                styles.eventChipText,
                                selectedEventId === event.id && styles.eventChipTextActive
                            ]}>
                                {event.name}
                            </ThemedText>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.djListContainer}>
                <ThemedText style={styles.sectionTitle}>2. Add DJ to Lineup</ThemedText>
                <FlatList
                    data={djs}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={styles.djCard}>
                            <View style={styles.djInfo}>
                                <ThemedText style={styles.djName}>{item.artistName}</ThemedText>
                                <ThemedText style={styles.djGenres}>{item.genres?.join(', ')}</ThemedText>
                            </View>
                            <TouchableOpacity
                                style={[styles.addButton, !selectedEventId && styles.addButtonDisabled]}
                                onPress={() => handleAddDj(item.id)}
                                disabled={isActionLoading || !selectedEventId}
                            >
                                <Ionicons name="add" size={20} color="black" />
                                <ThemedText style={styles.addButtonText}>Add</ThemedText>
                            </TouchableOpacity>
                        </View>
                    )}
                    contentContainerStyle={styles.listPadding}
                    ListEmptyComponent={
                        <ThemedText style={styles.emptyText}>No DJs available to add.</ThemedText>
                    }
                />
            </View>
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#111',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    sectionContainer: {
        paddingVertical: 16,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: ZyncTheme.colors.primary,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    eventScroller: {
        flexGrow: 0,
    },
    eventChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: '#1a1a1a',
        borderWidth: 1,
        borderColor: '#333',
        marginRight: 10,
    },
    eventChipActive: {
        backgroundColor: ZyncTheme.colors.primary,
        borderColor: ZyncTheme.colors.primary,
    },
    eventChipText: {
        fontSize: 14,
        color: '#888',
    },
    eventChipTextActive: {
        color: 'black',
        fontWeight: 'bold',
    },
    djListContainer: {
        flex: 1,
        paddingHorizontal: 20,
        marginTop: 10,
    },
    djCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#222',
    },
    djInfo: {
        flex: 1,
    },
    djName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    djGenres: {
        fontSize: 13,
        color: '#666',
        marginTop: 2,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: ZyncTheme.colors.primary,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        gap: 4,
    },
    addButtonDisabled: {
        opacity: 0.3,
        backgroundColor: '#333',
    },
    addButtonText: {
        color: 'black',
        fontWeight: 'bold',
    },
    listPadding: {
        paddingBottom: 40,
    },
    emptyText: {
        textAlign: 'center',
        color: '#666',
        marginTop: 40,
    }
});
