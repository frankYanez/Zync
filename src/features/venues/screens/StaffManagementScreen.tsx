import { ScreenLayout } from '@/components/ScreenLayout';
import { ThemedText } from '@/components/themed-text';
import { useZync } from '@/context/ZyncContext';
import { StaffMember, getVenueStaff, addStaffMember, removeStaffMember } from '@/features/venues/services/staff.service';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function StaffManagementScreen() {
    const router = useRouter();
    const { currentEstablishment } = useZync();
    const venueId = currentEstablishment?.id;

    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [isInviting, setIsInviting] = useState(false);

    const loadStaff = useCallback(async () => {
        if (!venueId) return;
        try {
            const data = await getVenueStaff(venueId);
            setStaff(data);
        } catch (e) {
            console.error('Failed to load staff', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [venueId]);

    useEffect(() => { loadStaff(); }, [loadStaff]);

    const onRefresh = () => { setRefreshing(true); loadStaff(); };

    const handleInvite = async () => {
        if (!venueId || !inviteEmail.trim()) return;
        setIsInviting(true);
        try {
            const newStaff = await addStaffMember(venueId, inviteEmail.trim());
            setStaff(prev => [...prev, newStaff]);
            setInviteEmail('');
            Alert.alert('¡Listo!', 'Invitación enviada al staff.');
        } catch (e: any) {
            const msg = e?.response?.data?.message;
            Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg || 'No se pudo enviar la invitación.');
        } finally {
            setIsInviting(false);
        }
    };

    const handleRemove = (member: StaffMember) => {
        if (!venueId) return;
        Alert.alert(
            'Eliminar staff',
            `¿Eliminar a ${member.name || member.email} del staff?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await removeStaffMember(venueId, member.id);
                            setStaff(prev => prev.filter(s => s.id !== member.id));
                        } catch (e: any) {
                            const msg = e?.response?.data?.message;
                            Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg || 'No se pudo eliminar.');
                        }
                    },
                },
            ],
        );
    };

    const renderStaffMember = ({ item }: { item: StaffMember }) => (
        <View style={styles.staffRow}>
            <View style={styles.staffAvatar}>
                <Ionicons name="person" size={18} color={ZyncTheme.colors.primary} />
            </View>
            <View style={styles.staffInfo}>
                <ThemedText style={styles.staffName}>{item.name || 'Sin nombre'}</ThemedText>
                <ThemedText style={styles.staffEmail}>{item.email}</ThemedText>
            </View>
            <TouchableOpacity style={styles.removeBtn} onPress={() => handleRemove(item)}>
                <Ionicons name="trash-outline" size={18} color={ZyncTheme.colors.error} />
            </TouchableOpacity>
        </View>
    );

    if (!venueId) {
        return (
            <ScreenLayout style={styles.centered} noPadding>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <ThemedText style={styles.title}>Staff</ThemedText>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.emptyState}>
                    <Ionicons name="business-outline" size={48} color={ZyncTheme.colors.textSecondary} />
                    <ThemedText style={styles.emptyText}>Selecciona un venue primero</ThemedText>
                </View>
            </ScreenLayout>
        );
    }

    return (
        <ScreenLayout style={styles.container} noPadding>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <ThemedText style={styles.title}>Staff</ThemedText>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.inviteSection}>
                <ThemedText style={styles.sectionTitle}>INVITAR NUEVO STAFF</ThemedText>
                <View style={styles.inviteRow}>
                    <TextInput
                        style={styles.emailInput}
                        placeholder="Email del nuevo staff"
                        placeholderTextColor="#555"
                        value={inviteEmail}
                        onChangeText={setInviteEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                    <TouchableOpacity
                        style={[styles.inviteBtn, isInviting && styles.inviteBtnDisabled]}
                        onPress={handleInvite}
                        disabled={isInviting || !inviteEmail.trim()}
                    >
                        {isInviting ? (
                            <ActivityIndicator size="small" color="#000" />
                        ) : (
                            <Ionicons name="add" size={20} color="#000" />
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            <ThemedText style={styles.sectionTitle}>MIEMBROS DEL STAFF</ThemedText>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color={ZyncTheme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={staff}
                    keyExtractor={item => item.id}
                    renderItem={renderStaffMember}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ZyncTheme.colors.primary} />}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="people-outline" size={48} color={ZyncTheme.colors.textSecondary} />
                            <ThemedText style={styles.emptyText}>No hay staff agregado</ThemedText>
                        </View>
                    }
                />
            )}
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: ZyncTheme.spacing.l, paddingTop: ZyncTheme.spacing.l, paddingBottom: ZyncTheme.spacing.m,
        borderBottomWidth: 1, borderBottomColor: ZyncTheme.colors.border,
    },
    title: { fontSize: 20, fontWeight: '800', color: 'white' },
    inviteSection: { padding: ZyncTheme.spacing.m, borderBottomWidth: 1, borderBottomColor: ZyncTheme.colors.border },
    sectionTitle: {
        fontSize: 11, fontWeight: '700', color: ZyncTheme.colors.textSecondary,
        letterSpacing: 1.5, marginBottom: ZyncTheme.spacing.s,
    },
    inviteRow: { flexDirection: 'row', gap: ZyncTheme.spacing.s },
    emailInput: {
        flex: 1, backgroundColor: ZyncTheme.colors.card, borderWidth: 1, borderColor: ZyncTheme.colors.border,
        borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, color: 'white', fontSize: 14,
    },
    inviteBtn: {
        width: 44, height: 44, borderRadius: 10, backgroundColor: ZyncTheme.colors.primary,
        justifyContent: 'center', alignItems: 'center',
    },
    inviteBtnDisabled: { opacity: 0.5 },
    list: { padding: ZyncTheme.spacing.m },
    staffRow: {
        flexDirection: 'row', alignItems: 'center', paddingVertical: ZyncTheme.spacing.s,
        borderBottomWidth: 1, borderBottomColor: ZyncTheme.colors.border, gap: ZyncTheme.spacing.m,
    },
    staffAvatar: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(204,255,0,0.1)',
        borderWidth: 1, borderColor: ZyncTheme.colors.primary, justifyContent: 'center', alignItems: 'center',
    },
    staffInfo: { flex: 1 },
    staffName: { fontSize: 14, fontWeight: '600', color: 'white' },
    staffEmail: { fontSize: 12, color: ZyncTheme.colors.textSecondary },
    removeBtn: { padding: 8 },
    emptyState: { alignItems: 'center', paddingVertical: 48, gap: 12 },
    emptyText: { fontSize: 14, color: ZyncTheme.colors.textSecondary },
});