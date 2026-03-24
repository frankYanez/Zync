import { CyberCard } from '@/components/CyberCard';
import { ScreenLayout } from '@/components/ScreenLayout';
import { ThemedText } from '@/components/themed-text';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Switch, TouchableOpacity, View } from 'react-native';

const PREFS_KEY = 'zync_notification_prefs';

interface NotificationPrefs {
    events: boolean;
    promos: boolean;
    chat: boolean;
    orders: boolean;
    djUpdates: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = {
    events: true,
    promos: true,
    chat: true,
    orders: true,
    djUpdates: false,
};

const ITEMS: { key: keyof NotificationPrefs; label: string; description: string; icon: any }[] = [
    { key: 'events', label: 'Eventos', description: 'Recordatorios y novedades de eventos cercanos', icon: 'calendar-outline' },
    { key: 'promos', label: 'Promociones', description: 'Códigos de descuento y ofertas especiales', icon: 'pricetag-outline' },
    { key: 'chat', label: 'Mensajes', description: 'Nuevos mensajes y chats grupales de eventos', icon: 'chatbubble-outline' },
    { key: 'orders', label: 'Pedidos', description: 'Estado de tus pedidos (listo para retirar, etc.)', icon: 'receipt-outline' },
    { key: 'djUpdates', label: 'DJs que seguís', description: 'Nuevos gigs y actualizaciones de los DJs que seguís', icon: 'musical-notes-outline' },
];

export default function NotificationsScreen() {
    const router = useRouter();
    const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        SecureStore.getItemAsync(PREFS_KEY)
            .then(json => {
                if (json) setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(json) });
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const toggle = async (key: keyof NotificationPrefs) => {
        const updated = { ...prefs, [key]: !prefs[key] };
        setPrefs(updated);
        await SecureStore.setItemAsync(PREFS_KEY, JSON.stringify(updated));
    };

    return (
        <ScreenLayout style={styles.container} noPadding>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={ZyncTheme.colors.text} />
                </TouchableOpacity>
                <ThemedText style={styles.title}>Notificaciones</ThemedText>
            </View>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={ZyncTheme.colors.primary} />
                </View>
            ) : (
                <View style={styles.content}>
                    <ThemedText style={styles.sectionLabel}>PREFERENCIAS</ThemedText>
                    <CyberCard style={styles.card}>
                        {ITEMS.map((item, index) => (
                            <View key={item.key} style={[styles.row, index > 0 && styles.rowBorder]}>
                                <View style={styles.rowIcon}>
                                    <Ionicons name={item.icon} size={20} color={prefs[item.key] ? ZyncTheme.colors.primary : ZyncTheme.colors.textSecondary} />
                                </View>
                                <View style={styles.rowText}>
                                    <ThemedText style={styles.rowLabel}>{item.label}</ThemedText>
                                    <ThemedText style={styles.rowDesc}>{item.description}</ThemedText>
                                </View>
                                <Switch
                                    value={prefs[item.key]}
                                    onValueChange={() => toggle(item.key)}
                                    trackColor={{ false: ZyncTheme.colors.border, true: ZyncTheme.colors.primary + '88' }}
                                    thumbColor={prefs[item.key] ? ZyncTheme.colors.primary : '#888'}
                                />
                            </View>
                        ))}
                    </CyberCard>

                    <ThemedText style={styles.hint}>
                        Las notificaciones también dependen de los permisos del sistema operativo.
                    </ThemedText>
                </View>
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
        borderBottomColor: 'rgba(255,255,255,0.08)',
    },
    backButton: { marginRight: 16 },
    title: { fontSize: 22, fontWeight: 'bold', color: 'white' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    content: { padding: ZyncTheme.spacing.m, gap: ZyncTheme.spacing.s },
    sectionLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: ZyncTheme.colors.textSecondary,
        letterSpacing: 1,
        marginBottom: ZyncTheme.spacing.xs,
    },
    card: { padding: 0, overflow: 'hidden' },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: ZyncTheme.spacing.m,
        gap: ZyncTheme.spacing.m,
    },
    rowBorder: { borderTopWidth: 1, borderTopColor: ZyncTheme.colors.border },
    rowIcon: { width: 28, alignItems: 'center' },
    rowText: { flex: 1 },
    rowLabel: { fontSize: 15, fontWeight: '600', color: 'white' },
    rowDesc: { fontSize: 12, color: ZyncTheme.colors.textSecondary, marginTop: 2 },
    hint: {
        fontSize: 12,
        color: ZyncTheme.colors.textSecondary,
        textAlign: 'center',
        marginTop: ZyncTheme.spacing.m,
        paddingHorizontal: ZyncTheme.spacing.m,
        lineHeight: 18,
    },
});
