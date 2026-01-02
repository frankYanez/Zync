import { CyberCard } from '@/components/CyberCard';
import { NeonButton } from '@/components/NeonButton';
import { ScreenLayout } from '@/components/ScreenLayout';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function ProfileScreen() {
    const { logout, user } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.replace('/(auth)');
    };

    return (
        <ScreenLayout style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    <Ionicons name="person" size={40} color={ZyncTheme.colors.background} />
                </View>
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

            <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>SETTINGS</ThemedText>
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
            </View>

            <NeonButton
                title="LOG OUT"
                variant="outline"
                onPress={handleLogout}
                style={{ marginTop: 'auto', marginBottom: 20 }}
            />
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: ZyncTheme.spacing.m,
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
    }
});
