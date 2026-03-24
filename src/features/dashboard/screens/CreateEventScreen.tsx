import { NeonButton } from '@/components/NeonButton';
import { NeonInput } from '@/components/NeonInput';
import { ScreenLayout } from '@/components/ScreenLayout';
import { ThemedText } from '@/components/themed-text';
import { createEvent } from '@/features/dashboard/services/event.service';
import { getMyVenues } from '@/features/venues/services/venue.service';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

interface VenueSummary { id: string; name: string; address: string; }

export default function CreateEventScreen() {
    const router = useRouter();

    const [name, setName] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [capacity, setCapacity] = useState('');
    const [startsAt, setStartsAt] = useState(new Date());
    const [endsAt, setEndsAt] = useState(new Date(Date.now() + 6 * 3600 * 1000));
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);
    const [venues, setVenues] = useState<VenueSummary[]>([]);
    const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        getMyVenues()
            .then(setVenues)
            .catch(e => console.error('Failed to load venues', e));
    }, []);

    const fmt = (d: Date) =>
        d.toLocaleString('es-AR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    const handleSubmit = async () => {
        if (!name.trim()) return Alert.alert('Error', 'Ingresá el nombre del evento.');
        if (!selectedVenueId) return Alert.alert('Error', 'Seleccioná un venue.');
        if (endsAt <= startsAt) return Alert.alert('Error', 'La fecha de fin debe ser posterior al inicio.');

        setIsSubmitting(true);
        try {
            await createEvent({
                name: name.trim(),
                startDate: startsAt.toISOString(),
                endDate: endsAt.toISOString(),
                venueId: selectedVenueId,
                maxCapacity: capacity ? parseInt(capacity, 10) : undefined,
                imageUrl: imageUrl.trim() || undefined,
            });
            router.back();
        } catch (error: any) {
            const msg = error?.response?.data?.message;
            Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg || 'No se pudo crear el evento.');
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
                <ThemedText style={styles.title}>Nuevo Evento</ThemedText>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

                    {/* Name */}
                    <View style={styles.field}>
                        <ThemedText style={styles.label}>Nombre del evento *</ThemedText>
                        <NeonInput placeholder="ej. Noche Techno" value={name} onChangeText={setName} />
                    </View>

                    {/* Venue selector */}
                    <View style={styles.field}>
                        <ThemedText style={styles.label}>Venue *</ThemedText>
                        {venues.length === 0 ? (
                            <ThemedText style={styles.hint}>
                                No tenés venues creados. Creá uno desde tu perfil.
                            </ThemedText>
                        ) : (
                            <View style={styles.venueGrid}>
                                {venues.map(v => (
                                    <TouchableOpacity
                                        key={v.id}
                                        style={[
                                            styles.venueChip,
                                            selectedVenueId === v.id && styles.venueChipActive,
                                        ]}
                                        onPress={() => setSelectedVenueId(v.id)}
                                    >
                                        <ThemedText style={[styles.venueChipText, selectedVenueId === v.id && styles.venueChipTextActive]}>
                                            {v.name}
                                        </ThemedText>
                                        <ThemedText style={styles.venueAddress} numberOfLines={1}>{v.address}</ThemedText>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Start date */}
                    <View style={styles.field}>
                        <ThemedText style={styles.label}>Fecha y hora de inicio *</ThemedText>
                        <TouchableOpacity style={styles.datePicker} onPress={() => setShowStartPicker(true)}>
                            <Ionicons name="calendar-outline" size={18} color={ZyncTheme.colors.primary} />
                            <ThemedText style={styles.dateText}>{fmt(startsAt)}</ThemedText>
                        </TouchableOpacity>
                        {showStartPicker && (
                            <DateTimePicker
                                value={startsAt}
                                mode="datetime"
                                display="default"
                                onChange={(_, d) => { setShowStartPicker(false); if (d) setStartsAt(d); }}
                            />
                        )}
                    </View>

                    {/* End date */}
                    <View style={styles.field}>
                        <ThemedText style={styles.label}>Fecha y hora de fin *</ThemedText>
                        <TouchableOpacity style={styles.datePicker} onPress={() => setShowEndPicker(true)}>
                            <Ionicons name="calendar-outline" size={18} color={ZyncTheme.colors.primary} />
                            <ThemedText style={styles.dateText}>{fmt(endsAt)}</ThemedText>
                        </TouchableOpacity>
                        {showEndPicker && (
                            <DateTimePicker
                                value={endsAt}
                                mode="datetime"
                                display="default"
                                minimumDate={startsAt}
                                onChange={(_, d) => { setShowEndPicker(false); if (d) setEndsAt(d); }}
                            />
                        )}
                    </View>

                    {/* Capacity */}
                    <View style={styles.field}>
                        <ThemedText style={styles.label}>Capacidad (opcional)</ThemedText>
                        <NeonInput
                            placeholder="ej. 300"
                            value={capacity}
                            onChangeText={t => setCapacity(t.replace(/[^0-9]/g, ''))}
                            keyboardType="numeric"
                        />
                    </View>

                    {/* Image URL */}
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

                    <View style={{ height: 16 }} />
                    <NeonButton
                        title={isSubmitting ? 'Creando...' : 'Crear Evento'}
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
    hint: { fontSize: 13, color: ZyncTheme.colors.textSecondary, fontStyle: 'italic' },
    venueGrid: { gap: ZyncTheme.spacing.s },
    venueChip: {
        padding: ZyncTheme.spacing.m,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: ZyncTheme.colors.border,
        backgroundColor: ZyncTheme.colors.card,
    },
    venueChipActive: {
        borderColor: ZyncTheme.colors.primary,
        backgroundColor: 'rgba(204,255,0,0.06)',
    },
    venueChipText: { fontSize: 14, fontWeight: '600', color: ZyncTheme.colors.textSecondary },
    venueChipTextActive: { color: ZyncTheme.colors.primary },
    venueAddress: { fontSize: 12, color: ZyncTheme.colors.textSecondary, marginTop: 2 },
    datePicker: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: ZyncTheme.spacing.m,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: ZyncTheme.colors.border,
        backgroundColor: ZyncTheme.colors.card,
    },
    dateText: { fontSize: 14, color: 'white' },
});
