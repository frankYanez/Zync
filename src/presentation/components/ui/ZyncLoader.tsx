import { ThemedText } from '@/presentation/components/themed-text';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

const { width, height } = Dimensions.get('window');

interface ZyncLoaderProps {
    visible: boolean;
    type?: 'splash' | 'overlay';
}

export function ZyncLoader({ visible, type = 'overlay' }: ZyncLoaderProps) {
    if (!visible) return null;

    if (type === 'splash') {
        return (
            <View style={styles.splashContainer}>
                {/* Background Pulse */}
                <MotiView
                    from={{ opacity: 0.3, scale: 0.8 }}
                    animate={{ opacity: 0, scale: 2 }}
                    transition={{
                        type: 'timing',
                        duration: 2000,
                        loop: true,
                    }}
                    style={[styles.ripple, { borderColor: ZyncTheme.colors.primary }]}
                />
                <MotiView
                    from={{ opacity: 0.3, scale: 0.8 }}
                    animate={{ opacity: 0, scale: 1.5 }}
                    transition={{
                        type: 'timing',
                        duration: 2000,
                        delay: 500,
                        loop: true,
                    }}
                    style={[styles.ripple, { borderColor: ZyncTheme.colors.primary }]}
                />

                {/* Central Logo Construction */}
                <MotiView
                    from={{ opacity: 0, scale: 0.5, translateY: 20 }}
                    animate={{ opacity: 1, scale: 1, translateY: 0 }}
                    transition={{ type: 'spring', damping: 10 }}
                    style={styles.logoContainer}
                >
                    <Ionicons name="flash" size={64} color={ZyncTheme.colors.primary} />
                    <ThemedText style={styles.splashText}>ZYNC</ThemedText>
                    <MotiView
                        from={{ width: 0, opacity: 0 }}
                        animate={{ width: 100, opacity: 1 }}
                        transition={{ type: 'timing', duration: 1000, delay: 500 }}
                        style={styles.underline}
                    />
                </MotiView>

                <MotiView
                    from={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: 'timing', duration: 1000, delay: 1000 }}
                    style={{ position: 'absolute', bottom: 50 }}
                >
                    <ThemedText style={styles.loadingText}>INITIALIZING SYSTEM...</ThemedText>
                </MotiView>
            </View>
        );
    }

    // Overlay Mode
    return (
        <View style={styles.overlayContainer}>
            <MotiView
                from={{ rotate: '0deg' }}
                animate={{ rotate: '360deg' }}
                transition={{
                    type: 'timing',
                    duration: 1500,
                    loop: true,
                    repeatReverse: false,
                }}
                style={styles.spinner}
            >
                <Ionicons name="sync" size={40} color={ZyncTheme.colors.primary} />
            </MotiView>
            <MotiView
                from={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                transition={{
                    type: 'timing',
                    duration: 800,
                    loop: true,
                    repeatReverse: true,
                }}
            >
                <ThemedText style={styles.overlayText}>PROCESSING</ThemedText>
            </MotiView>
        </View>
    );
}

const styles = StyleSheet.create({
    splashContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000', // Deep black
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    overlayContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    ripple: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        borderWidth: 2,
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    splashText: {
        fontSize: 48,
        fontWeight: '900',
        letterSpacing: 4,
        color: 'white',
        marginTop: 10,
        textShadowColor: ZyncTheme.colors.primary,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
        paddingVertical: 30,
    },
    underline: {
        height: 4,
        backgroundColor: ZyncTheme.colors.primary,
        marginTop: 5,
        borderRadius: 2,
    },
    loadingText: {
        color: ZyncTheme.colors.textSecondary,
        fontSize: 12,
        letterSpacing: 2,
    },
    spinner: {
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    overlayText: {
        color: 'white',
        fontWeight: 'bold',
        letterSpacing: 2,
    }
});
