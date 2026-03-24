import { ScreenLayout } from '@/components/ScreenLayout';
import { ThemedText } from '@/components/themed-text';
import { CreateGigDto, Gig, GigStatus } from '@/features/dj/domain/dj.types';
import { useDjGigs } from '@/hooks/useDjGigs';
import { useDjProfile } from '@/hooks/useDjProfile';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    Platform,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const STATUS_COLORS: Record<GigStatus, { bg: string; text: string; label: string }> = {
    pending:   { bg: 'rgba(255,170,0,0.12)',   text: '#ffaa00', label: 'Pendiente'  },
    confirmed: { bg: 'rgba(34,197,94,0.12)',   text: '#22C55E', label: 'Confirmado' },
    cancelled: { bg: 'rgba(255,68,102,0.12)',  text: '#ff4466', label: 'Cancelado'  },
};

function GigCard({
    item,
    onConfirm,
    onCancel,
    onDelete,
}: {
    item: Gig;
    onConfirm: () => void;
    onCancel: () => void;
    onDelete: () => void;
}) {
    const status = STATUS_COLORS[item.status];
    const start = new Date(item.startsAt);
    const end   = new Date(item.endsAt);

    return (
        <View style={styles.card}>
            {/* Left accent bar */}
            <View style={[styles.cardAccent, { backgroundColor: status.text }]} />

            <View style={styles.cardBody}>
                <View style={styles.cardTop}>
                    <View style={{ flex: 1 }}>
                        <ThemedText style={styles.venueName}>{item.venueName}</ThemedText>
                        {item.eventName !== item.venueName && (
                            <ThemedText style={styles.eventName}>{item.eventName}</ThemedText>
                        )}
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                        <ThemedText style={[styles.statusText, { color: status.text }]}>
                            {status.label}
                        </ThemedText>
                    </View>
                </View>

                <View style={styles.metaRow}>
                    <Ionicons name="calendar-outline" size={13} color="#666" />
                    <ThemedText style={styles.metaText}>
                        {start.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </ThemedText>
                    <Ionicons name="time-outline" size={13} color="#666" style={{ marginLeft: 8 }} />
                    <ThemedText style={styles.metaText}>
                        {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {' – '}
                        {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </ThemedText>
                </View>

                {item.fee != null && (
                    <View style={styles.metaRow}>
                        <Ionicons name="cash-outline" size={13} color="#666" />
                        <ThemedText style={styles.feeText}>
                            ${item.fee.toLocaleString('es-AR')}
                        </ThemedText>
                    </View>
                )}

                {item.status !== 'cancelled' && (
                    <View style={styles.cardActions}>
                        {item.status === 'pending' && (
                            <TouchableOpacity style={styles.btnConfirm} onPress={onConfirm}>
                                <Ionicons name="checkmark" size={14} color="#000" />
                                <ThemedText style={styles.btnConfirmText}>Confirmar</ThemedText>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={styles.btnCancel} onPress={onCancel}>
                            <ThemedText style={styles.btnCancelText}>Cancelar</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.btnDelete} onPress={onDelete}>
                            <Ionicons name="trash-outline" size={16} color="#ff4466" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </View>
    );
}

// ── CREATE GIG MODAL ────────────────────────────────────────
function CreateGigModal({
    visible,
    onClose,
    onSubmit,
}: {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: CreateGigDto) => Promise<void>;
}) {
    const [venueName, setVenueName]   = useState('');
    const [fee, setFee]               = useState('');
    const [startsAt, setStartsAt]     = useState(new Date());
    const [endsAt, setEndsAt]         = useState(new Date(Date.now() + 3 * 3600000));
    const [showStart, setShowStart]   = useState(false);
    const [showEnd, setShowEnd]       = useState(false);
    const [saving, setSaving]         = useState(false);

    const handleSubmit = async () => {
        if (!venueName.trim()) {
            Alert.alert('Campo requerido', 'Ingresá el nombre del venue.');
            return;
        }
        setSaving(true);
        try {
            await onSubmit({
                venueName: venueName.trim(),
                startsAt: startsAt.toISOString(),
                endsAt: endsAt.toISOString(),
                fee: fee ? Number(fee) : undefined,
            });
            setVenueName('');
            setFee('');
            onClose();
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <View style={styles.modalHeader}>
                        <ThemedText style={styles.modalTitle}>Nuevo Gig</ThemedText>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="white" />
                        </TouchableOpacity>
                    </View>

                    <ThemedText style={styles.label}>Venue / Lugar *</ThemedText>
                    <TextInput
                        style={styles.input}
                        placeholder="Ej: Club Vértigo"
                        placeholderTextColor="#555"
                        value={venueName}
                        onChangeText={setVenueName}
                    />

                    <ThemedText style={styles.label}>Fee (opcional)</ThemedText>
                    <TextInput
                        style={styles.input}
                        placeholder="Ej: 50000"
                        placeholderTextColor="#555"
                        value={fee}
                        onChangeText={setFee}
                        keyboardType="numeric"
                    />

                    <ThemedText style={styles.label}>Inicio</ThemedText>
                    <TouchableOpacity style={styles.datePicker} onPress={() => setShowStart(true)}>
                        <Ionicons name="calendar-outline" size={16} color={ZyncTheme.colors.primary} />
                        <ThemedText style={styles.datePickerText}>
                            {startsAt.toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </ThemedText>
                    </TouchableOpacity>
                    {showStart && (
                        <DateTimePicker
                            value={startsAt}
                            mode="datetime"
                            display={Platform.OS === 'ios' ? 'inline' : 'default'}
                            onChange={(_, d) => { setShowStart(false); if (d) setStartsAt(d); }}
                        />
                    )}

                    <ThemedText style={styles.label}>Fin</ThemedText>
                    <TouchableOpacity style={styles.datePicker} onPress={() => setShowEnd(true)}>
                        <Ionicons name="time-outline" size={16} color={ZyncTheme.colors.primary} />
                        <ThemedText style={styles.datePickerText}>
                            {endsAt.toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </ThemedText>
                    </TouchableOpacity>
                    {showEnd && (
                        <DateTimePicker
                            value={endsAt}
                            mode="datetime"
                            display={Platform.OS === 'ios' ? 'inline' : 'default'}
                            onChange={(_, d) => { setShowEnd(false); if (d) setEndsAt(d); }}
                        />
                    )}

                    <TouchableOpacity
                        style={[styles.btnSubmit, saving && { opacity: 0.6 }]}
                        onPress={handleSubmit}
                        disabled={saving}
                    >
                        {saving
                            ? <ActivityIndicator size="small" color="#000" />
                            : <ThemedText style={styles.btnSubmitText}>Guardar Gig</ThemedText>
                        }
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

// ── MAIN SCREEN ─────────────────────────────────────────────
export default function DjGigsScreen() {
    const router = useRouter();
    const { profile, isLoading: profileLoading } = useDjProfile();
    const { gigs, isLoading, refetch, addGig, changeGigStatus, removeGig } = useDjGigs(profile?.id);
    const [showModal, setShowModal] = useState(false);

    const handleDelete = (gig: Gig) => {
        Alert.alert('Eliminar gig', `¿Eliminar el gig en ${gig.venueName}?`, [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Eliminar', style: 'destructive', onPress: () => removeGig(gig.id) },
        ]);
    };

    const handleCreate = async (data: CreateGigDto) => {
        if (!profile?.id) return;
        await addGig(data);
    };

    return (
        <ScreenLayout style={styles.container} noPadding>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <ThemedText style={styles.title}>Mis Gigs</ThemedText>
                <TouchableOpacity style={styles.addButton} onPress={() => setShowModal(true)}>
                    <Ionicons name="add-circle" size={30} color={ZyncTheme.colors.primary} />
                </TouchableOpacity>
            </View>

            {isLoading || profileLoading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={ZyncTheme.colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={gigs}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    onRefresh={refetch}
                    refreshing={isLoading}
                    renderItem={({ item }) => (
                        <GigCard
                            item={item}
                            onConfirm={() => changeGigStatus(item.id, 'confirmed')}
                            onCancel={() => changeGigStatus(item.id, 'cancelled')}
                            onDelete={() => handleDelete(item)}
                        />
                    )}
                    ListEmptyComponent={
                        <View style={styles.center}>
                            <Ionicons name="mic-outline" size={56} color="#333" />
                            <ThemedText style={styles.emptyText}>Sin gigs todavía.</ThemedText>
                            <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowModal(true)}>
                                <ThemedText style={styles.emptyBtnText}>Agregar primer gig</ThemedText>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}

            <CreateGigModal
                visible={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleCreate}
            />
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
        borderBottomColor: ZyncTheme.colors.border,
    },
    backButton: { marginRight: 16 },
    title: { flex: 1, fontSize: 22, fontWeight: '800', color: 'white' },
    addButton: { padding: 2 },
    list: { padding: ZyncTheme.spacing.m, paddingBottom: 100 },
    card: {
        flexDirection: 'row',
        backgroundColor: ZyncTheme.colors.card,
        borderRadius: ZyncTheme.borderRadius.m,
        marginBottom: ZyncTheme.spacing.m,
        borderWidth: 1,
        borderColor: ZyncTheme.colors.border,
        overflow: 'hidden',
    },
    cardAccent: { width: 4 },
    cardBody: { flex: 1, padding: ZyncTheme.spacing.m },
    cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
    venueName: { fontSize: 16, fontWeight: '700', color: 'white' },
    eventName: { fontSize: 12, color: ZyncTheme.colors.textSecondary, marginTop: 2 },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginLeft: 8 },
    statusText: { fontSize: 11, fontWeight: '700' },
    metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
    metaText: { fontSize: 13, color: ZyncTheme.colors.textSecondary },
    feeText: { fontSize: 13, color: ZyncTheme.colors.primary, fontWeight: '600' },
    cardActions: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 },
    btnConfirm: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: ZyncTheme.colors.primary,
        paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8,
    },
    btnConfirmText: { fontSize: 12, fontWeight: '800', color: '#000' },
    btnCancel: {
        paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8,
        borderWidth: 1, borderColor: ZyncTheme.colors.border,
    },
    btnCancelText: { fontSize: 12, color: ZyncTheme.colors.textSecondary },
    btnDelete: {
        marginLeft: 'auto',
        padding: 6,
    },
    // Modal
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'flex-end',
    },
    modal: {
        backgroundColor: ZyncTheme.colors.card,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: ZyncTheme.spacing.l,
        paddingBottom: 40,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: ZyncTheme.spacing.l,
    },
    modalTitle: { fontSize: 20, fontWeight: '800', color: 'white' },
    label: { fontSize: 12, fontWeight: '700', color: ZyncTheme.colors.textSecondary, letterSpacing: 1, marginBottom: 6, marginTop: 14 },
    input: {
        backgroundColor: '#1a1a1a',
        borderWidth: 1,
        borderColor: ZyncTheme.colors.border,
        borderRadius: 10,
        color: 'white',
        fontSize: 15,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    datePicker: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#1a1a1a',
        borderWidth: 1,
        borderColor: ZyncTheme.colors.border,
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    datePickerText: { fontSize: 14, color: 'white' },
    btnSubmit: {
        backgroundColor: ZyncTheme.colors.primary,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 24,
    },
    btnSubmitText: { fontSize: 15, fontWeight: '800', color: '#000' },
    // Empty
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 12 },
    emptyText: { fontSize: 14, color: ZyncTheme.colors.textSecondary },
    emptyBtn: {
        backgroundColor: ZyncTheme.colors.primary,
        paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, marginTop: 4,
    },
    emptyBtnText: { fontWeight: '800', color: '#000', fontSize: 14 },
});
