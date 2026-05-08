import { RoleSelector } from '@/components/profile/RoleSelector';
import { ScreenLayout } from '@/components/ScreenLayout';
import { ThemedText } from '@/components/themed-text';
import { getPreferences, updatePreferences } from '@/features/profile/services/profile.service';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';

export default function ConfigScreen() {
    const router = useRouter();
    const { signOut } = useAuth();
    const [pushEnabled, setPushEnabled] = useState(true);
    const [emailEnabled, setEmailEnabled] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getPreferences()
            .then((pref) => {
                if (pref) {
                    setPushEnabled(pref.receivePushNotifications ?? true);
                    setEmailEnabled(pref.receiveEmailNotifications ?? true);
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleTogglePush = async (value: boolean) => {
        try {
            await updatePreferences({ receivePushNotifications: value });
            setPushEnabled(value);
        } catch {
            Alert.alert('Error', 'No se pudo actualizar.');
        }
    };

    const handleToggleEmail = async (value: boolean) => {
        try {
            await updatePreferences({ receiveEmailNotifications: value });
            setEmailEnabled(value);
        } catch {
            Alert.alert('Error', 'No se pudo actualizar.');
        }
    };

    const handleLogout = () => {
        Alert.alert('Cerrar sesión', '¿Seguro que quieres salir?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Salir', style: 'destructive', onPress: signOut },
        ]);
    };

    if (loading) {
        return (
            <ScreenLayout style={styles.loading} noPadding>
                <ActivityIndicator size="large" color={ZyncTheme.colors.primary} />
            </ScreenLayout>
        );
    }

    return (
        <ScreenLayout style={styles.container} noPadding>
            <View style={styles.header}>
                <ThemedText style={styles.title}>Configuración</ThemedText>
            </View>

            <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>NOTIFICACIONES</ThemedText>
                <View style={styles.sectionContent}>
                    <View style={styles.configItem}>
                        <View style={styles.configLeft}>
                            <Ionicons name="notifications-outline" size={18} color="#FBB724" />
                            <ThemedText style={styles.labelText}>Notificaciones push</ThemedText>
                        </View>
                        <Switch
                            value={pushEnabled}
                            onValueChange={handleTogglePush}
                            trackColor={{ false: ZyncTheme.colors.border, true: 'rgba(204,255,0,0.3)' }}
                            thumbColor={pushEnabled ? ZyncTheme.colors.primary : '#666'}
                        />
                    </View>
                    <View style={styles.configItem}>
                        <View style={styles.configLeft}>
                            <Ionicons name="mail-outline" size={18} color="#10B981" />
                            <ThemedText style={styles.labelText}>Notificaciones email</ThemedText>
                        </View>
                        <Switch
                            value={emailEnabled}
                            onValueChange={handleToggleEmail}
                            trackColor={{ false: ZyncTheme.colors.border, true: 'rgba(204,255,0,0.3)' }}
                            thumbColor={emailEnabled ? ZyncTheme.colors.primary : '#666'}
                        />
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>CUENTA</ThemedText>
                <View style={styles.sectionContent}>
                    <TouchableOpacity style={styles.configItem} onPress={() => router.push('/profile/change-password')}>
                        <View style={styles.configLeft}>
                            <Ionicons name="key-outline" size={18} color="#FF5500" />
                            <ThemedText style={styles.labelText}>Cambiar contraseña</ThemedText>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={ZyncTheme.colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.configItem} onPress={() => router.push('/profile/security')}>
                        <View style={styles.configLeft}>
                            <Ionicons name="shield-checkmark-outline" size={18} color="#00D4FF" />
                            <ThemedText style={styles.labelText}>Seguridad y privacidad</ThemedText>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={ZyncTheme.colors.textSecondary} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>SOPORTE</ThemedText>
                <View style={styles.sectionContent}>
                    <TouchableOpacity style={styles.configItem} onPress={() => Linking.openURL('https://zync.app/terms')}>
                        <View style={styles.configLeft}>
                            <Ionicons name="document-text-outline" size={18} color="#A855F7" />
                            <ThemedText style={styles.labelText}>Términos y condiciones</ThemedText>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={ZyncTheme.colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.configItem} onPress={() => Linking.openURL('https://zync.app/privacy')}>
                        <View style={styles.configLeft}>
                            <Ionicons name="shield-outline" size={18} color="#10B981" />
                            <ThemedText style={styles.labelText}>Política de privacidad</ThemedText>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={ZyncTheme.colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.configItem} onPress={() => Linking.openURL('mailto:soporte@zync.app')}>
                        <View style={styles.configLeft}>
                            <Ionicons name="chatbubbles-outline" size={18} color="#FBB724" />
                            <ThemedText style={styles.labelText}>Contactar soporte</ThemedText>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={ZyncTheme.colors.textSecondary} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>SESIÓN</ThemedText>
                <View style={styles.sectionContent}>
                    <TouchableOpacity style={styles.configItem} onPress={handleLogout}>
                        <View style={styles.configLeft}>
                            <Ionicons name="log-out-outline" size={18} color="#FF4466" />
                            <ThemedText style={styles.labelText}>Cerrar sesión</ThemedText>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={ZyncTheme.colors.textSecondary} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.roleSection}>
                <RoleSelector />
            </View>

            <View style={styles.footer}>
                <ThemedText style={styles.version}>Zync v1.0.0</ThemedText>
            </View>
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        paddingHorizontal: ZyncTheme.spacing.m,
        paddingTop: ZyncTheme.spacing.l,
        paddingBottom: ZyncTheme.spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: ZyncTheme.colors.border,
    },
    title: { fontSize: 22, fontWeight: '800', color: 'white' },
    section: { marginTop: ZyncTheme.spacing.l },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: ZyncTheme.colors.textSecondary,
        letterSpacing: 1.5,
        paddingHorizontal: ZyncTheme.spacing.m,
        marginBottom: ZyncTheme.spacing.s,
    },
    sectionContent: {
        backgroundColor: ZyncTheme.colors.card,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: ZyncTheme.colors.border,
    },
    configItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: ZyncTheme.spacing.m,
        paddingHorizontal: ZyncTheme.spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    configLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: ZyncTheme.spacing.m,
    },
    labelText: { fontSize: 15, color: 'white', fontWeight: '500' },
    roleSection: { paddingHorizontal: ZyncTheme.spacing.m, marginTop: ZyncTheme.spacing.xl },
    footer: { alignItems: 'center', marginTop: 'auto', paddingVertical: ZyncTheme.spacing.xl },
    version: { fontSize: 12, color: ZyncTheme.colors.textSecondary },
});