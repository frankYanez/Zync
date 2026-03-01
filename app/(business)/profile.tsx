import { RoleSelector } from '@/components/profile/RoleSelector';
import { ScreenLayout } from '@/components/ScreenLayout';
import { ThemedText } from '@/components/themed-text';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

export default function BusinessProfileScreen() {
    return (
        <ScreenLayout style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    <Ionicons name="business" size={40} color={ZyncTheme.colors.background} />
                </View>
                <ThemedText style={styles.name}>Business Name</ThemedText>
                <ThemedText style={styles.email}>business@zync.com</ThemedText>
            </View>

            <RoleSelector />

            <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>BUSINESS SETTINGS</ThemedText>
                <View style={styles.menuItem}>
                    <ThemedText>Business Details</ThemedText>
                    <Ionicons name="chevron-forward" size={20} color={ZyncTheme.colors.textSecondary} />
                </View>
                <View style={styles.menuItem}>
                    <ThemedText>Staff Management</ThemedText>
                    <Ionicons name="chevron-forward" size={20} color={ZyncTheme.colors.textSecondary} />
                </View>
            </View>
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
    section: {
        gap: ZyncTheme.spacing.s,
        marginTop: ZyncTheme.spacing.l,
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
        paddingHorizontal: ZyncTheme.spacing.m,
        backgroundColor: ZyncTheme.colors.card,
        borderRadius: ZyncTheme.borderRadius.m,
    }
});
