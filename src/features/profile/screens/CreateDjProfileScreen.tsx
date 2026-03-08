import { NeonButton } from '@/components/NeonButton';
import { NeonInput } from '@/components/NeonInput';
import { ScreenLayout } from '@/components/ScreenLayout';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { updateDjProfile } from '../services/profile.service';

export default function CreateDjProfileScreen() {
    const router = useRouter();
    const { checkUser } = useAuth();

    const [artistName, setArtistName] = useState('');
    const [musicGenre, setMusicGenre] = useState('');
    const [pricePerSong, setPricePerSong] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!artistName.trim() || !musicGenre.trim() || !pricePerSong.trim()) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }

        const priceNum = Number(pricePerSong);
        if (isNaN(priceNum) || priceNum < 0) {
            Alert.alert('Error', 'Price per song must be a valid positive number.');
            return;
        }

        setIsSubmitting(true);
        try {
            await updateDjProfile({
                artistName: artistName.trim(),
                musicGenre: musicGenre.trim(),
                pricePerSong: priceNum,
            });

            await checkUser();
            setIsSubmitting(false);

            Alert.alert(
                'Success!',
                'Your DJ profile has been created.',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (error: any) {
            setIsSubmitting(false);

            // Check if backend returned specific validation errors (400 Bad Request)
            const errorMsg = error?.response?.data?.message;
            const validationErrors = Array.isArray(errorMsg) ? errorMsg.join('\n') : errorMsg;

            console.error('DJ Profile Error:', error?.response?.data || error);
            Alert.alert('Error', validationErrors || 'Failed to create DJ profile. Please check your inputs.');
        }
    };

    return (
        <ScreenLayout style={styles.container} noPadding>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={ZyncTheme.colors.text} />
                </TouchableOpacity>
                <ThemedText style={styles.title}>Become a DJ</ThemedText>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <ThemedText style={styles.description}>
                        Set up your DJ profile to start receiving song requests from users at events.
                    </ThemedText>

                    <View style={styles.formGroup}>
                        <ThemedText style={styles.label}>Artist Name</ThemedText>
                        <NeonInput
                            placeholder="e.g. DJ Zync"
                            value={artistName}
                            onChangeText={setArtistName}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <ThemedText style={styles.label}>Main Music Genre</ThemedText>
                        <NeonInput
                            placeholder="e.g. Techno, House, Reggaeton"
                            value={musicGenre}
                            onChangeText={setMusicGenre}
                        />
                    </View>

                    <View style={styles.formGroup}>
                        <ThemedText style={styles.label}>Price Per Song Request ($)</ThemedText>
                        <NeonInput
                            placeholder="0.00"
                            value={pricePerSong}
                            onChangeText={setPricePerSong}
                            keyboardType="decimal-pad"
                        />
                    </View>

                    <View style={styles.spacer} />

                    <NeonButton
                        title={isSubmitting ? "Creating..." : "Create DJ Profile"}
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                    />
                    {isSubmitting && (
                        <ActivityIndicator size="small" color={ZyncTheme.colors.primary} style={{ marginTop: 16 }} />
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
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
    },
    scrollContent: {
        padding: ZyncTheme.spacing.m,
        paddingBottom: 60,
    },
    description: {
        fontSize: 16,
        color: ZyncTheme.colors.textSecondary,
        marginBottom: ZyncTheme.spacing.xl,
        textAlign: 'center',
    },
    formGroup: {
        marginBottom: ZyncTheme.spacing.l,
    },
    label: {
        fontSize: 14,
        color: 'white',
        fontWeight: '600',
        marginBottom: 8,
    },
    spacer: {
        height: 20,
    },
});
