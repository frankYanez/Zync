import { ScreenLayout } from '@/presentation/components/ScreenLayout';
import { ThemedText } from '@/presentation/components/themed-text';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function ScannerScreen() {
    return (
        <ScreenLayout noPadding style={styles.container}>
            {/* Simulation of Camera View */}
            <View style={styles.cameraView}>
                <ThemedText style={{ color: '#555' }}>Camera Feed...</ThemedText>
            </View>

            <View style={styles.overlay}>
                <View style={styles.cornerTopLeft} />
                <View style={styles.cornerTopRight} />
                <View style={styles.cornerBottomLeft} />
                <View style={styles.cornerBottomRight} />

                <Ionicons name="scan" size={48} color={ZyncTheme.colors.primary} style={{ opacity: 0.5 }} />
            </View>

            <View style={styles.message}>
                <ThemedText style={styles.text}>Scan QR Code to Pay</ThemedText>
            </View>

        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#000',
    },
    cameraView: {
        flex: 1,
        backgroundColor: '#111',
        alignItems: 'center',
        justifyContent: 'center',
    },
    overlay: {
        position: 'absolute',
        top: '25%',
        left: (width - 250) / 2,
        width: 250,
        height: 250,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cornerTopLeft: {
        position: 'absolute', top: 0, left: 0, width: 40, height: 40,
        borderTopWidth: 4, borderLeftWidth: 4, borderColor: ZyncTheme.colors.primary,
    },
    cornerTopRight: {
        position: 'absolute', top: 0, right: 0, width: 40, height: 40,
        borderTopWidth: 4, borderRightWidth: 4, borderColor: ZyncTheme.colors.primary,
    },
    cornerBottomLeft: {
        position: 'absolute', bottom: 0, left: 0, width: 40, height: 40,
        borderBottomWidth: 4, borderLeftWidth: 4, borderColor: ZyncTheme.colors.primary,
    },
    cornerBottomRight: {
        position: 'absolute', bottom: 0, right: 0, width: 40, height: 40,
        borderBottomWidth: 4, borderRightWidth: 4, borderColor: ZyncTheme.colors.primary,
    },
    message: {
        position: 'absolute',
        bottom: 150,
        width: '100%',
        alignItems: 'center',
    },
    text: {
        color: 'white',
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 10,
        borderRadius: 5,
    }
});
