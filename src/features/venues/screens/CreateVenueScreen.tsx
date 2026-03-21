import { NeonButton } from '@/components/NeonButton';
import { NeonInput } from '@/components/NeonInput';
import { ScreenLayout } from '@/components/ScreenLayout';
import { ThemedText } from '@/components/themed-text';
import { createVenue } from '@/features/venues/services/venue.service';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function CreateVenueScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!name.trim()) return Alert.alert('Error', 'Ingresá el nombre del venue.');
        if (!address.trim()) return Alert.alert('Error', 'Ingresá la dirección.');

        setIsSubmitting(true);
        try {
            await createVenue({
                name: name.trim(),
                address: address.trim(),
                description: description.trim() || undefined,
            });
            router.back();
        } catch (error: any) {
            const msg = error?.response?.data?.message;
            Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg || 'No se pudo crear el venue.');
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
                <ThemedText style={styles.title}>Nuevo Venue</ThemedText>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                    <ThemedText style={styles.description}>
                        Creá el espacio físico donde vas a ofrecer tus productos y organizar eventos.
                    </ThemedText>

                    <View style={styles.field}>
                        <ThemedText style={styles.label}>Nombre *</ThemedText>
                        <NeonInput placeholder="ej. Club Niceto" value={name} onChangeText={setName} />
                    </View>

                    <View style={styles.field}>
                        <ThemedText style={styles.label}>Dirección *</ThemedText>
                        <NeonInput placeholder="ej. Av. Corrientes 1234, CABA" value={address} onChangeText={setAddress} />
                    </View>

                    <View style={styles.field}>
                        <ThemedText style={styles.label}>Descripción (opcional)</ThemedText>
                        <NeonInput
                            placeholder="ej. Club de techno y house en el corazón de Palermo"
                            value={description}
                            onChangeText={setDescription}
                            multiline
                        />
                    </View>

                    <View style={{ height: 16 }} />
                    <NeonButton
                        title={isSubmitting ? 'Creando...' : 'Crear Venue'}
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
    description: {
        fontSize: 15,
        color: ZyncTheme.colors.textSecondary,
        marginBottom: ZyncTheme.spacing.xl,
        lineHeight: 22,
    },
    field: { marginBottom: ZyncTheme.spacing.l },
    label: { fontSize: 13, fontWeight: '600', color: 'white', marginBottom: 8 },
});
