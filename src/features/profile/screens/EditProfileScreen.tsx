import { NeonInput } from '@/components/NeonInput';
import { ScreenLayout } from '@/components/ScreenLayout';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/features/auth/context/AuthContext';
import { getPublicProfile, updateProfile } from '@/features/profile/services/profile.service';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

type ProfileField = 'firstName' | 'lastName' | 'phone' | 'city' | 'country';

/**
 * Screen component that allows the authenticated user to edit their profile fields individually.
 * 
 * This component fetches the current profile data from the backend, 
 * renders a list of editable fields (e.g., First Name, Last Name, Phone), 
 * and handles expanding/collapsing individual fields for inline editing.
 * Updates are sent to the backend using `PATCH /users/me/profile`.
 *
 * @returns {React.ReactElement} The rendered Edit Profile screen.
 */
export default function EditProfileScreen() {
    const router = useRouter();
    const { user, updateUser } = useAuth(); // Assuming updateUser exists or we can just refetch

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [profileData, setProfileData] = useState<Record<ProfileField, string>>({
        firstName: '',
        lastName: '',
        phone: '',
        city: '',
        country: '',
    });

    const [expandedField, setExpandedField] = useState<ProfileField | null>(null);
    const [editValue, setEditValue] = useState('');

    /**
     * Fetches the current user profile from the API and populates the local state.
     * Manages the loading state and handles potential errors during data retrieval.
     */
    const fetchCurrentProfile = async () => {
        if (user?.sub) {
            try {
                setIsLoading(true);
                const profile = await getPublicProfile(user.sub);
                setProfileData({
                    firstName: profile.firstName || '',
                    lastName: profile.lastName || '',
                    phone: profile.phone || '',
                    city: profile.city || '',
                    country: profile.country || '',
                });
            } catch (e) {
                console.log("Error loading profile details for edit: ", e);
                Alert.alert("Error", "Could not load profile data.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchCurrentProfile();
    }, [user?.sub]);

    /**
     * Toggles the expansion state of a specific profile field.
     * Sets the local `editValue` to the current persisted value so the user can modify it.
     * 
     * @param {ProfileField} field - The field identifier to expand or collapse.
     * @param {string} currentValue - The currently saved value of the field.
     */
    const handleExpand = (field: ProfileField, currentValue: string) => {
        if (expandedField === field) {
            setExpandedField(null); // Collapse if already open
        } else {
            setExpandedField(field);
            setEditValue(currentValue);
        }
    };

    /**
     * Processes the save action for the currently expanded field.
     * Validates if changes exist, sends the update payload to the backend, 
     * and synchronizes the local and global context states upon success.
     * 
     * @param {ProfileField} field - The specific field being updated.
     */
    const handleSaveField = async (field: ProfileField) => {
        if (editValue.trim() === profileData[field].trim()) {
            setExpandedField(null);
            return; // No changes
        }

        setIsSaving(true);
        try {
            const payload = { [field]: editValue.trim() };
            const updatedUser = await updateProfile(payload);

            // Update local state
            setProfileData(prev => ({ ...prev, [field]: editValue.trim() }));

            // Optionally update global auth state if needed
            if (updateUser && updatedUser) {
                updateUser({ ...user, ...updatedUser });
            }

            // Success feedback
            setExpandedField(null);
        } catch (error: any) {
            Alert.alert('Error', error?.response?.data?.message || 'Failed to update field');
        } finally {
            setIsSaving(false);
        }
    };

    /**
     * Renders a single editable profile field row.
     * Displays the current value or placeholder, and an input with action buttons if the field is expanded.
     * 
     * @param {ProfileField} field - The specific data key for the profile field.
     * @param {string} label - The human-readable label to display.
     * @param {string} placeholder - Placeholder text shown when editing or when the value is empty.
     * @returns {React.ReactElement} The rendered field view.
     */
    const renderField = (field: ProfileField, label: string, placeholder: string) => {
        const isExpanded = expandedField === field;
        const value = profileData[field];

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
                        name={isExpanded ? "chevron-up" : "chevron-down"}
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
                        {renderField('firstName', 'First Name', 'Enter your first name')}
                        {renderField('lastName', 'Last Name', 'Enter your last name')}
                        {renderField('phone', 'Phone Number', 'Enter your phone number')}
                        {renderField('city', 'City', 'Enter your city')}
                        {renderField('country', 'Country', 'Enter your country')}
                    </ScrollView>
                </KeyboardAvoidingView>
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
        marginBottom: ZyncTheme.spacing.m,
    },
    backButton: {
        marginRight: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingHorizontal: ZyncTheme.spacing.m,
        paddingBottom: 40,
    },
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
    fieldLabel: {
        fontSize: 14,
        color: ZyncTheme.colors.textSecondary,
        marginBottom: 4,
    },
    fieldValue: {
        fontSize: 16,
        color: 'white',
        fontWeight: '500',
    },
    fieldPlaceholder: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.3)',
        fontStyle: 'italic',
    },
    expandedContent: {
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    inputOverrides: {
        marginBottom: 16,
        marginTop: 8,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12,
    },
    actionBtn: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        minWidth: 80,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelBtn: {
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    cancelBtnText: {
        color: 'white',
        fontWeight: '600',
    },
    saveBtn: {
        backgroundColor: ZyncTheme.colors.primary,
    },
    saveBtnText: {
        color: 'black',
        fontWeight: 'bold',
    }
});
