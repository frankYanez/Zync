import { CyberCard } from '@/components/CyberCard';
import { NeonButton } from '@/components/NeonButton';
import { RoleSelector } from '@/components/profile/RoleSelector';
import { ScreenLayout } from '@/components/ScreenLayout';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/features/auth/context/AuthContext';
import { AvatarUpload } from '@/features/profile/components/AvatarUpload';
import { getPublicProfile } from '@/features/profile/services/profile.service';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

/**
 * Main Profile Screen for the authenticated user.
 * 
 * Displays the user's avatar, basic information (name, email), statistics, 
 * and provides navigation to different settings such as Edit Profile, Change Password, 
 * Notifications, and Security. Also handles the user logout flow.
 *
 * @returns {React.ReactElement} The rendered Profile Screen.
 */
export default function ProfileScreen() {
    const { logout, user } = useAuth();
    const router = useRouter();
    const [avatarUrl, setAvatarUrl] = useState<string | undefined>(user?.avatarUrl);

    useEffect(() => {
        if (user?.sub) {
            getPublicProfile(user.sub).then((profile) => {
                setAvatarUrl(profile.avatarUrl);
            });
        }
    }, [user?.sub]);

    /**
     * Executes the logout flow, clearing the local session and redirecting
     * the user back to the authentication screens.
     */
    const handleLogout = async () => {
        await logout();
        router.replace('/(auth)');
    };

    /**
     * Callback handler for successful avatar uploads.
     * Updates the local component state with the new remote avatar URL.
     * 
     * @param {string} newUrl - The URL of the newly uploaded avatar.
     */
    const handleAvatarUploadSuccess = (newUrl: string) => {
        setAvatarUrl(newUrl);
    };

    return (
        <ScreenLayout style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <AvatarUpload
                        currentAvatarUrl={avatarUrl}
                        onUploadSuccess={handleAvatarUploadSuccess}
                    />
                    <ThemedText style={styles.name}>{user?.firstName || 'User'}</ThemedText>
                    <ThemedText style={styles.email}>{user?.email || 'email@example.com'}</ThemedText>
                </View>

                <View style={styles.statsRow}>
                    <View style={styles.stat}>
                        <ThemedText style={styles.statValue}>12</ThemedText>
                        <ThemedText style={styles.statLabel}>Orders</ThemedText>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.stat}>
                        <ThemedText style={styles.statValue}>$15k</ThemedText>
                        <ThemedText style={styles.statLabel}>Spent</ThemedText>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.stat}>
                        <ThemedText style={styles.statValue}>Gold</ThemedText>
                        <ThemedText style={styles.statLabel}>Tier</ThemedText>
                    </View>
                </View>

                <RoleSelector />

                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>SETTINGS</ThemedText>

                    <TouchableOpacity onPress={() => router.push('/profile/edit' as any)}>
                        <CyberCard style={styles.menuItem}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name="person-outline" size={24} color={ZyncTheme.colors.textSecondary} style={{ marginRight: 10 }} />
                                <ThemedText>Edit Profile</ThemedText>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={ZyncTheme.colors.textSecondary} />
                        </CyberCard>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.push('/profile/change-password' as any)}>
                        <CyberCard style={styles.menuItem}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name="lock-closed-outline" size={24} color={ZyncTheme.colors.textSecondary} style={{ marginRight: 10 }} />
                                <ThemedText>Change Password</ThemedText>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={ZyncTheme.colors.textSecondary} />
                        </CyberCard>
                    </TouchableOpacity>

                    <CyberCard style={styles.menuItem}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="notifications-outline" size={24} color={ZyncTheme.colors.textSecondary} style={{ marginRight: 10 }} />
                            <ThemedText>Notifications</ThemedText>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={ZyncTheme.colors.textSecondary} />
                    </CyberCard>
                    <CyberCard style={styles.menuItem}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="card-outline" size={24} color={ZyncTheme.colors.textSecondary} style={{ marginRight: 10 }} />
                            <ThemedText>Payment Methods</ThemedText>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={ZyncTheme.colors.textSecondary} />
                    </CyberCard>
                    <CyberCard style={styles.menuItem}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="shield-checkmark-outline" size={24} color={ZyncTheme.colors.textSecondary} style={{ marginRight: 10 }} />
                            <ThemedText>Security</ThemedText>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={ZyncTheme.colors.textSecondary} />
                    </CyberCard>

                    {/* Upsell / Role Creation Section */}
                    {(!user?.roles?.includes('DJ') || !user?.roles?.includes('ORGANIZER')) && (
                        <View style={{ marginTop: ZyncTheme.spacing.m, gap: ZyncTheme.spacing.s }}>
                            <ThemedText style={styles.sectionTitle}>UPGRADES</ThemedText>

                            {!user?.roles?.includes('DJ') && (
                                <TouchableOpacity onPress={() => router.push('/profile/create-dj' as any)}>
                                    <CyberCard style={[styles.menuItem, styles.upgradeCard]}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Ionicons name="musical-notes-outline" size={24} color={ZyncTheme.colors.primary} style={{ marginRight: 10 }} />
                                            <ThemedText style={styles.upgradeText}>Become a DJ</ThemedText>
                                        </View>
                                        <Ionicons name="add-circle" size={24} color={ZyncTheme.colors.primary} />
                                    </CyberCard>
                                </TouchableOpacity>
                            )}

                            {!user?.roles?.includes('ORGANIZER') && (
                                <TouchableOpacity onPress={() => router.push('/profile/create-organizer' as any)}>
                                    <CyberCard style={[styles.menuItem, styles.upgradeCard]}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Ionicons name="business-outline" size={24} color={ZyncTheme.colors.primary} style={{ marginRight: 10 }} />
                                            <ThemedText style={styles.upgradeText}>Become an Organizer</ThemedText>
                                        </View>
                                        <Ionicons name="add-circle" size={24} color={ZyncTheme.colors.primary} />
                                    </CyberCard>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                </View>

                <NeonButton
                    title="LOG OUT"
                    variant="outline"
                    onPress={handleLogout}
                    style={styles.logoutButton}
                />
            </ScrollView>
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: ZyncTheme.spacing.m,
        paddingBottom: ZyncTheme.spacing.xxl, // Extra padding at bottom for scroll
    },
    header: {
        alignItems: 'center',
        marginBottom: ZyncTheme.spacing.xl,
        marginTop: ZyncTheme.spacing.l,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: ZyncTheme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: ZyncTheme.spacing.m,
        borderWidth: 2,
        borderColor: ZyncTheme.colors.text,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    email: {
        fontSize: 14,
        color: ZyncTheme.colors.textSecondary,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: ZyncTheme.spacing.xl,
    },
    stat: {
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: ZyncTheme.colors.primary,
    },
    statLabel: {
        fontSize: 12,
        color: ZyncTheme.colors.textSecondary,
        textTransform: 'uppercase',
    },
    statDivider: {
        width: 1,
        backgroundColor: ZyncTheme.colors.border,
    },
    section: {
        gap: ZyncTheme.spacing.s,
    },
    sectionTitle: {
        fontSize: 12,
        color: ZyncTheme.colors.textSecondary,
        marginBottom: ZyncTheme.spacing.s,
        fontWeight: 'bold',
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: ZyncTheme.spacing.m,
        backgroundColor: ZyncTheme.colors.card,
    },
    upgradeCard: {
        backgroundColor: 'rgba(0, 255, 170, 0.05)',
        borderColor: ZyncTheme.colors.primary,
        borderWidth: 1,
    },
    upgradeText: {
        color: ZyncTheme.colors.primary,
        fontWeight: 'bold',
    },
    logoutButton: {
        marginTop: ZyncTheme.spacing.xl,
        marginBottom: ZyncTheme.spacing.l,
    }
});
