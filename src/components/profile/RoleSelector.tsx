import { ThemedText } from '@/components/themed-text';
import { UserRole } from '@/context/RoleContext';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useRoleManager } from '@/hooks/useRoleManager';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Modal, Platform, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';

export const RoleSelector = () => {
    const { user } = useAuth();
    const { currentRole, isLoading, switchRole } = useRoleManager();
    const [modalVisible, setModalVisible] = useState(false);

    const getRoleLabel = (role: UserRole) => {
        switch (role) {
            case 'user': return 'Cliente';
            case 'business': return 'Comercio';
            case 'dj': return 'DJ';
            default: return role;
        }
    };

    const handleRoleSelect = async (role: UserRole) => {
        setModalVisible(false);
        await switchRole(role);
    };

    // Calculate available roles based on backend JWT
    // Always include 'user' (Cliente) as base
    const availableRoles: UserRole[] = ['user'];
    if (user?.roles?.includes('ORGANIZER') || user?.roles?.includes('BUSINESS')) {
        availableRoles.push('business');
    }
    if (user?.roles?.includes('DJ')) {
        availableRoles.push('dj');
    }

    const hasMultipleRoles = availableRoles.length > 1;

    return (
        <>
            <TouchableOpacity
                style={styles.container}
                onPress={() => hasMultipleRoles && !isLoading && setModalVisible(true)}
                activeOpacity={0.7}
                disabled={isLoading || !hasMultipleRoles}
            >
                <View style={styles.contentContainer}>
                    <View>
                        <ThemedText style={styles.label}>CURRENT ROLE</ThemedText>
                        <ThemedText style={styles.role}>{getRoleLabel(currentRole)}</ThemedText>
                    </View>

                    {isLoading ? (
                        <ActivityIndicator size="small" color={ZyncTheme.colors.primary} />
                    ) : hasMultipleRoles ? (
                        <Ionicons name="chevron-down" size={20} color={ZyncTheme.colors.textSecondary} />
                    ) : null}
                </View>
            </TouchableOpacity>

            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
                    <View style={styles.modalContent}>
                        <ThemedText style={styles.modalTitle}>Select Role</ThemedText>
                        {availableRoles.map((role) => (
                            <TouchableOpacity
                                key={role}
                                style={[
                                    styles.optionItem,
                                    currentRole === role && styles.optionItemSelected
                                ]}
                                onPress={() => handleRoleSelect(role)}
                            >
                                <ThemedText style={[
                                    styles.optionText,
                                    currentRole === role && styles.optionTextSelected
                                ]}>
                                    {getRoleLabel(role)}
                                </ThemedText>
                                {currentRole === role && (
                                    <Ionicons name="checkmark" size={20} color={ZyncTheme.colors.background} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </Pressable>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: ZyncTheme.colors.card,
        borderRadius: ZyncTheme.borderRadius.m,
        padding: ZyncTheme.spacing.m,
        marginBottom: ZyncTheme.spacing.m,
        borderWidth: 1,
        borderColor: ZyncTheme.colors.border,
    },
    contentContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontSize: 10,
        color: ZyncTheme.colors.textSecondary,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    role: {
        fontSize: 16,
        fontWeight: 'bold',
        color: ZyncTheme.colors.primary,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        padding: ZyncTheme.spacing.l,
    },
    modalContent: {
        backgroundColor: ZyncTheme.colors.card,
        borderRadius: ZyncTheme.borderRadius.l,
        padding: ZyncTheme.spacing.l,
        borderWidth: 1,
        borderColor: ZyncTheme.colors.border,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
            },
            android: {
                elevation: 5,
            },
        }),
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: ZyncTheme.spacing.l,
        textAlign: 'center',
    },
    optionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: ZyncTheme.spacing.m,
        paddingHorizontal: ZyncTheme.spacing.m,
        borderRadius: ZyncTheme.borderRadius.m,
        marginBottom: ZyncTheme.spacing.s,
    },
    optionItemSelected: {
        backgroundColor: ZyncTheme.colors.primary,
    },
    optionText: {
        fontSize: 16,
    },
    optionTextSelected: {
        color: ZyncTheme.colors.background,
        fontWeight: 'bold',
    },
});
