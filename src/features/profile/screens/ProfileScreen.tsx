import { CollapsingProfileHeader } from '@/components/CollapsingProfileHeader';
import { CyberCard } from '@/components/CyberCard';
import { NeonButton } from '@/components/NeonButton';
import { RoleSelector } from '@/components/profile/RoleSelector';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/features/auth/context/AuthContext';
import { AvatarUpload } from '@/features/profile/components/AvatarUpload';
import { getPublicProfile } from '@/features/profile/services/profile.service';
import { getMyOrders } from '@/features/wallet/services/order.service';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
    const { logout, user } = useAuth();
    const router = useRouter();
    const [avatarUrl, setAvatarUrl] = useState<string | undefined>(user?.avatarUrl);
    const [showAvatarUpload, setShowAvatarUpload] = useState(false);
    const [orderCount, setOrderCount] = useState<number | null>(null);

    useEffect(() => {
        if (user?.sub) {
            getPublicProfile(user.sub).then((profile) => {
                setAvatarUrl(profile.avatarUrl);
            });
        }
    }, [user?.sub]);

    useEffect(() => {
        getMyOrders()
            .then(orders => setOrderCount(orders.length))
            .catch(() => {});
    }, []);

    const handleLogout = async () => {
        await logout();
        router.replace('/(auth)');
    };

    return (
        <>
            <CollapsingProfileHeader
                variant="user"
                title={user?.firstName ?? 'Mi perfil'}
                avatarUri={avatarUrl}
                onAvatarPress={() => setShowAvatarUpload(true)}
            >
                {/* Email */}
                <ThemedText style={styles.email}>{user?.email}</ThemedText>

                {/* Stats */}
                <View style={styles.statsRow}>
                    <TouchableOpacity style={styles.stat} onPress={() => router.push('/orders' as any)}>
                        <ThemedText style={styles.statValue}>{orderCount ?? '—'}</ThemedText>
                        <ThemedText style={styles.statLabel}>Pedidos</ThemedText>
                    </TouchableOpacity>
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

                {/* Settings */}
                <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>SETTINGS</ThemedText>

                    <TouchableOpacity onPress={() => router.push('/profile/edit' as any)}>
                        <CyberCard style={styles.menuItem}>
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="person-outline" size={24} color={ZyncTheme.colors.textSecondary} />
                                <ThemedText>Edit Profile</ThemedText>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={ZyncTheme.colors.textSecondary} />
                        </CyberCard>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.push('/profile/change-password' as any)}>
                        <CyberCard style={styles.menuItem}>
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="lock-closed-outline" size={24} color={ZyncTheme.colors.textSecondary} />
                                <ThemedText>Change Password</ThemedText>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={ZyncTheme.colors.textSecondary} />
                        </CyberCard>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.push('/profile/notifications' as any)}>
                        <CyberCard style={styles.menuItem}>
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="notifications-outline" size={24} color={ZyncTheme.colors.textSecondary} />
                                <ThemedText>Notificaciones</ThemedText>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={ZyncTheme.colors.textSecondary} />
                        </CyberCard>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.push('/profile/payment-methods' as any)}>
                        <CyberCard style={styles.menuItem}>
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="card-outline" size={24} color={ZyncTheme.colors.textSecondary} />
                                <ThemedText>Métodos de pago</ThemedText>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={ZyncTheme.colors.textSecondary} />
                        </CyberCard>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.push('/profile/security' as any)}>
                        <CyberCard style={styles.menuItem}>
                            <View style={styles.menuItemLeft}>
                                <Ionicons name="shield-checkmark-outline" size={24} color={ZyncTheme.colors.textSecondary} />
                                <ThemedText>Seguridad</ThemedText>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color={ZyncTheme.colors.textSecondary} />
                        </CyberCard>
                    </TouchableOpacity>

                    {/* Upgrades */}
                    {(!user?.roles?.includes('DJ') || !user?.roles?.includes('ORGANIZER')) && (
                        <View style={{ marginTop: ZyncTheme.spacing.m, gap: ZyncTheme.spacing.s }}>
                            <ThemedText style={styles.sectionTitle}>UPGRADES</ThemedText>

                            {!user?.roles?.includes('DJ') && (
                                <TouchableOpacity onPress={() => router.push('/profile/create-dj' as any)}>
                                    <CyberCard style={[styles.menuItem, styles.upgradeCard]}>
                                        <View style={styles.menuItemLeft}>
                                            <Ionicons name="musical-notes-outline" size={24} color={ZyncTheme.colors.primary} />
                                            <ThemedText style={styles.upgradeText}>Become a DJ</ThemedText>
                                        </View>
                                        <Ionicons name="add-circle" size={24} color={ZyncTheme.colors.primary} />
                                    </CyberCard>
                                </TouchableOpacity>
                            )}

                            {!user?.roles?.includes('ORGANIZER') && (
                                <TouchableOpacity onPress={() => router.push('/profile/create-organizer' as any)}>
                                    <CyberCard style={[styles.menuItem, styles.upgradeCard]}>
                                        <View style={styles.menuItemLeft}>
                                            <Ionicons name="business-outline" size={24} color={ZyncTheme.colors.primary} />
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

                <View style={{ height: 60 }} />
            </CollapsingProfileHeader>

            {/* Avatar upload modal — rendered outside the header so it floats on top */}
            {showAvatarUpload && (
                <View style={styles.avatarUploadOverlay}>
                    <AvatarUpload
                        currentAvatarUrl={avatarUrl}
                        onUploadSuccess={(newUrl) => {
                            setAvatarUrl(newUrl);
                            setShowAvatarUpload(false);
                        }}
                    />
                    <TouchableOpacity
                        style={styles.avatarUploadClose}
                        onPress={() => setShowAvatarUpload(false)}
                    >
                        <Ionicons name="close" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    email: {
        fontSize: 14,
        color: ZyncTheme.colors.textSecondary,
        marginBottom: ZyncTheme.spacing.l,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: ZyncTheme.spacing.xl,
        paddingHorizontal: ZyncTheme.spacing.m,
    },
    stat: { alignItems: 'center' },
    statValue: { fontSize: 20, fontWeight: 'bold', color: ZyncTheme.colors.primary },
    statLabel: {
        fontSize: 12,
        color: ZyncTheme.colors.textSecondary,
        textTransform: 'uppercase',
    },
    statDivider: { width: 1, backgroundColor: ZyncTheme.colors.border },
    section: {
        width: '100%',
        gap: ZyncTheme.spacing.s,
        marginTop: ZyncTheme.spacing.m,
    },
    sectionTitle: {
        fontSize: 12,
        color: ZyncTheme.colors.textSecondary,
        marginBottom: ZyncTheme.spacing.s,
        fontWeight: 'bold',
        alignSelf: 'flex-start',
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: ZyncTheme.spacing.m,
        backgroundColor: ZyncTheme.colors.card,
    },
    menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    upgradeCard: {
        backgroundColor: 'rgba(204,255,0,0.05)',
        borderColor: ZyncTheme.colors.primary,
        borderWidth: 1,
    },
    upgradeText: { color: ZyncTheme.colors.primary, fontWeight: 'bold' },
    logoutButton: { marginTop: ZyncTheme.spacing.xl, width: '100%' },

    /* Avatar upload overlay */
    avatarUploadOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100,
    },
    avatarUploadClose: {
        position: 'absolute',
        top: 52,
        right: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
