import { ThemedText } from '@/components/themed-text';
import { useZync } from '@/context/ZyncContext';
import { validateTicket } from '@/features/tickets/services/ticket.service';
import { updateOrderStatus } from '@/features/wallet/services/order.service';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ScanMode = 'ticket' | 'order';
type ResultState = { valid: boolean; message: string; userName?: string } | null;

export default function BusinessScannerScreen() {
    const { currentEstablishment } = useZync();
    const [mode, setMode] = useState<ScanMode>('ticket');
    const [permission, requestPermission] = useCameraPermissions();
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<ResultState>(null);
    const lastScanned = useRef<string>('');

    const handleBarCodeScanned = async ({ data }: { data: string }) => {
        if (isProcessing || data === lastScanned.current) return;
        lastScanned.current = data;
        setIsProcessing(true);
        setResult(null);

        try {
            if (mode === 'ticket') {
                const eventId = currentEstablishment?.id ?? '';
                const res = await validateTicket(data, eventId);
                setResult({
                    valid: res.valid,
                    message: res.valid ? '¡Acceso permitido!' : (res.reason ?? 'Acceso denegado'),
                    userName: res.user?.name,
                });
            } else {
                // order mode: data is the orderId
                await updateOrderStatus(data, 'delivered');
                setResult({ valid: true, message: 'Pedido marcado como entregado' });
            }
        } catch {
            setResult({ valid: false, message: 'Error al procesar el código' });
        } finally {
            setIsProcessing(false);
            // reset after 3s to allow another scan
            setTimeout(() => {
                setResult(null);
                lastScanned.current = '';
            }, 3000);
        }
    };

    if (!permission) {
        return (
            <SafeAreaView style={styles.safe}>
                <View style={styles.center}>
                    <ActivityIndicator color={ZyncTheme.colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    if (!permission.granted) {
        return (
            <SafeAreaView style={styles.safe}>
                <View style={styles.center}>
                    <Ionicons name="camera-outline" size={56} color="#333" />
                    <ThemedText style={styles.permText}>Se necesita acceso a la cámara</ThemedText>
                    <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
                        <ThemedText style={styles.permBtnText}>Dar permiso</ThemedText>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFill}
                facing="back"
                onBarcodeScanned={result ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            />

            {/* Mode selector */}
            <SafeAreaView style={styles.topBar}>
                <View style={styles.modeSelector}>
                    <TouchableOpacity
                        style={[styles.modeBtn, mode === 'ticket' && styles.modeBtnActive]}
                        onPress={() => setMode('ticket')}
                    >
                        <Ionicons name="ticket-outline" size={16} color={mode === 'ticket' ? '#000' : '#aaa'} />
                        <ThemedText style={[styles.modeBtnText, mode === 'ticket' && styles.modeBtnTextActive]}>
                            Entradas
                        </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.modeBtn, mode === 'order' && styles.modeBtnActive]}
                        onPress={() => setMode('order')}
                    >
                        <Ionicons name="receipt-outline" size={16} color={mode === 'order' ? '#000' : '#aaa'} />
                        <ThemedText style={[styles.modeBtnText, mode === 'order' && styles.modeBtnTextActive]}>
                            Pedidos
                        </ThemedText>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            {/* Viewfinder */}
            <View style={styles.viewfinder}>
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />
            </View>

            {/* Processing / Result overlay */}
            {(isProcessing || result) && (
                <View style={[styles.resultOverlay, result && (result.valid ? styles.resultSuccess : styles.resultError)]}>
                    {isProcessing ? (
                        <ActivityIndicator size="large" color="white" />
                    ) : result ? (
                        <>
                            <Ionicons
                                name={result.valid ? 'checkmark-circle' : 'close-circle'}
                                size={64}
                                color="white"
                            />
                            {result.userName && (
                                <ThemedText style={styles.resultName}>{result.userName}</ThemedText>
                            )}
                            <ThemedText style={styles.resultMessage}>{result.message}</ThemedText>
                        </>
                    ) : null}
                </View>
            )}

            <SafeAreaView style={styles.bottomLabel} edges={['bottom']}>
                <ThemedText style={styles.hint}>
                    {mode === 'ticket' ? 'Apuntá al QR de la entrada del usuario' : 'Apuntá al QR del pedido para marcarlo entregado'}
                </ThemedText>
            </SafeAreaView>
        </View>
    );
}

const CORNER_SIZE = 28;
const CORNER_BORDER = 3;

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: ZyncTheme.colors.background },
    container: { flex: 1, backgroundColor: '#000' },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
    permText: { fontSize: 15, color: ZyncTheme.colors.textSecondary, textAlign: 'center', paddingHorizontal: 40 },
    permBtn: { backgroundColor: ZyncTheme.colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
    permBtnText: { fontWeight: '800', color: '#000', fontSize: 15 },
    topBar: { position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center', paddingTop: 8 },
    modeSelector: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderRadius: 12, padding: 4, gap: 4,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    },
    modeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 9 },
    modeBtnActive: { backgroundColor: ZyncTheme.colors.primary },
    modeBtnText: { fontSize: 13, fontWeight: '600', color: '#aaa' },
    modeBtnTextActive: { color: '#000' },
    viewfinder: {
        position: 'absolute',
        top: '50%', left: '50%',
        width: 220, height: 220,
        marginTop: -110, marginLeft: -110,
    },
    corner: { position: 'absolute', width: CORNER_SIZE, height: CORNER_SIZE, borderColor: ZyncTheme.colors.primary, borderWidth: CORNER_BORDER },
    cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 4 },
    cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 4 },
    cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 4 },
    cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 4 },
    resultOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.75)',
        alignItems: 'center', justifyContent: 'center', gap: 12,
    },
    resultSuccess: { backgroundColor: 'rgba(34,197,94,0.85)' },
    resultError:   { backgroundColor: 'rgba(255,68,102,0.85)' },
    resultName:    { fontSize: 22, fontWeight: '800', color: 'white' },
    resultMessage: { fontSize: 16, fontWeight: '600', color: 'white', textAlign: 'center', paddingHorizontal: 32 },
    bottomLabel: { position: 'absolute', bottom: 0, left: 0, right: 0, alignItems: 'center', paddingBottom: 20 },
    hint: { fontSize: 12, color: 'rgba(255,255,255,0.6)', textAlign: 'center', paddingHorizontal: 40 },
});
