import { NeonButton } from '@/components/NeonButton';
import { NeonInput } from '@/components/NeonInput';
import { ScreenLayout } from '@/components/ScreenLayout';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/features/auth/context/AuthContext';
import { updateOrganizerProfile } from '@/features/profile/services/profile.service';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function CreateOrganizerProfileScreen() {
    const router = useRouter();
    const { checkUser } = useAuth();

    const [organizationName, setOrganizationName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!organizationName.trim()) {
            Alert.alert('Error', 'Please enter your organization or club name.');
            return;
        }


        try {
            await updateOrganizerProfile({
                organizationName: organizationName.trim(),
            });


        } catch (error: any) {

            console.error('Organizer Profile Error:', error);
            Alert.alert('Error', error?.response?.data?.message || 'Failed to create Organizer profile.');
        }
    };

    return (
        <ScreenLayout style={styles.container} noPadding>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={ZyncTheme.colors.text} />
                </TouchableOpacity>
                <ThemedText style={styles.title}>Become an Organizer</ThemedText>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <ThemedText style={styles.description}>
                        Create a business profile to start organizing and managing your own events on Zync.
                    </ThemedText>

                    <View style={styles.formGroup}>
                        <ThemedText style={styles.label}>Organization Name</ThemedText>
                        <NeonInput
                            placeholder="e.g. Sunset Club"
                            value={organizationName}
                            onChangeText={setOrganizationName}
                        />
                    </View>

                    <View style={styles.spacer} />

                    <NeonButton
                        title={"Create Organizer Profile"}
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
