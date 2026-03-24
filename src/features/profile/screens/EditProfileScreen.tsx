import { NeonInput } from '@/components/NeonInput';
import { ScreenLayout } from '@/components/ScreenLayout';
import { ThemedText } from '@/components/themed-text';
import { ProfileField, useProfile } from '@/features/profile/hooks/useProfile';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function EditProfileScreen() {
    const router = useRouter();
    const { profile, isLoading, isSaving, updateField } = useProfile();

    const [expandedField, setExpandedField] = useState<ProfileField | null>(null);
    const [editValue, setEditValue] = useState('');

    const handleExpand = (field: ProfileField, currentValue: string) => {
        if (expandedField === field) {
            setExpandedField(null);
        } else {
            setExpandedField(field);
            setEditValue(currentValue);
        }
    };

    const handleSaveField = async (field: ProfileField) => {
        if (editValue.trim() === profile[field].trim()) {
            setExpandedField(null);
            return;
        }
        try {
            await updateField(field, editValue);
            setExpandedField(null);
        } catch (error: any) {
            const msg = error?.response?.data?.message;
            Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg || 'Failed to update field');
        }
    };

    const renderField = (field: ProfileField, label: string, placeholder: string) => {
        const isExpanded = expandedField === field;
        const value = profile[field];

        return (
            <View style={styles.fieldContainer} key={field}>
                <TouchableOpacity
                    style={styles.fieldHeader}
                    onPress={() => handleExpand(field, value)}
                    activeOpacity={0.7}
                >
                    <View>
                        <ThemedText style={styles.fieldLabel}>{label}</ThemedText>
                        {!isExpanded && (
                            <ThemedText style={value ? styles.fieldValue : styles.fieldPlaceholder}>
                                {value || `Add ${label.toLowerCase()}`}
                            </ThemedText>
                        )}
                    </View>
                    <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color={ZyncTheme.colors.primary}
                    />
                </TouchableOpacity>

                {isExpanded && (
                    <View style={styles.expandedContent}>
                        <NeonInput
                            placeholder={placeholder}
                            value={editValue}
                            onChangeText={setEditValue}
                            autoFocus
                            containerStyle={styles.inputOverrides}
                            keyboardType={field === 'phone' ? 'phone-pad' : 'default'}
                        />
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                style={[styles.actionBtn, styles.cancelBtn]}
                                onPress={() => setExpandedField(null)}
                                disabled={isSaving}
                            >
                                <ThemedText style={styles.cancelBtnText}>Cancel</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionBtn, styles.saveBtn]}
                                onPress={() => handleSaveField(field)}
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <ActivityIndicator size="small" color="#000" />
                                ) : (
                                    <ThemedText style={styles.saveBtnText}>Save</ThemedText>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        );
    };

    return (
        <ScreenLayout style={styles.container} noPadding>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={ZyncTheme.colors.text} />
                </TouchableOpacity>
                <ThemedText style={styles.title}>Edit Profile</ThemedText>
            </View>

            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={ZyncTheme.colors.primary} />
                </View>
            ) : (
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{ flex: 1 }}
                >
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        {renderField('firstName', 'Nombre', 'Ingresá tu nombre')}
                        {renderField('lastName', 'Apellido', 'Ingresá tu apellido')}
                        {renderField('phone', 'Teléfono', 'Ingresá tu número de teléfono')}
                        {renderField('city', 'Ciudad', 'Ingresá tu ciudad')}
                        {renderField('state', 'Provincia / Estado', 'Ingresá tu provincia o estado')}
                        {renderField('country', 'País', 'Ingresá tu país')}
                        {renderField('nationality', 'Nacionalidad', 'Ingresá tu nacionalidad')}
                    </ScrollView>
                </KeyboardAvoidingView>
            )}
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
        borderBottomColor: 'rgba(255,255,255,0.1)',
        marginBottom: ZyncTheme.spacing.m,
    },
    backButton: { marginRight: 16 },
    title: { fontSize: 22, fontWeight: 'bold', color: 'white' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { paddingHorizontal: ZyncTheme.spacing.m, paddingBottom: 40 },
    fieldContainer: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        marginBottom: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    fieldHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    fieldLabel: { fontSize: 14, color: ZyncTheme.colors.textSecondary, marginBottom: 4 },
    fieldValue: { fontSize: 16, color: 'white', fontWeight: '500' },
    fieldPlaceholder: { fontSize: 16, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' },
    expandedContent: { paddingHorizontal: 16, paddingBottom: 16 },
    inputOverrides: { marginBottom: 16, marginTop: 8 },
    actionButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
    actionBtn: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        minWidth: 80,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelBtn: { backgroundColor: 'rgba(255,255,255,0.1)' },
    cancelBtnText: { color: 'white', fontWeight: '600' },
    saveBtn: { backgroundColor: ZyncTheme.colors.primary },
    saveBtnText: { color: 'black', fontWeight: 'bold' },
});
