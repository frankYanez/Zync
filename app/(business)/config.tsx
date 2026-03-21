import { RoleSelector } from '@/components/profile/RoleSelector';
import { ScreenLayout } from '@/components/ScreenLayout';
import { ThemedText } from '@/components/themed-text';
import { ZyncTheme } from '@/shared/constants/theme';
import { StyleSheet, View } from 'react-native';

const PlaceholderScreen = ({ title }: { title: string }) => (
    <ScreenLayout style={styles.container}>
        <View style={styles.content}>
            <ThemedText style={styles.title}>{title}</ThemedText>
            <RoleSelector />
            <ThemedText style={styles.subtitle}>Business Role Feature</ThemedText>
        </View>
    </ScreenLayout>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        alignItems: 'center',
        width: '100%',
        padding: ZyncTheme.spacing.xl,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: ZyncTheme.colors.primary,
        marginBottom: ZyncTheme.spacing.m,
    },
    subtitle: {
        color: ZyncTheme.colors.textSecondary,
        marginTop: ZyncTheme.spacing.m,
    }
});

export default function ConfigScreen() { return <PlaceholderScreen title="Config Screen" />; }
