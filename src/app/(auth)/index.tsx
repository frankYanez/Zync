import { useZync } from '@/application/ZyncContext';
import { ScreenLayout } from '@/presentation/components/ScreenLayout';
import { ThemedText } from '@/presentation/components/themed-text';
import { NeonButton } from '@/presentation/components/ui/NeonButton';
import { NeonInput } from '@/presentation/components/ui/NeonInput';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Keyboard, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

export default function AuthScreen() {
    const router = useRouter();
    const { login } = useZync();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        setLoading(true);
        Keyboard.dismiss();

        // Simulate network delay
        setTimeout(async () => {
            const success = await login(email || 'user@zync.com');
            setLoading(false);

            if (success) {
                router.replace('/(tabs)');
            } else {
                Alert.alert('Access Denied', 'Invalid credentials');
            }
        }, 1500);
    };

    return (
        <ScreenLayout style={styles.container}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={{ flex: 1, justifyContent: 'space-between' }}>
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <Ionicons name="flash" size={40} color="black" />
                        </View>

                        <ThemedText style={styles.welcome}>WELCOME BACK</ThemedText>
                        <ThemedText style={styles.subtitle}>Enter the system</ThemedText>
                    </View>

                    <View style={styles.form}>
                        <NeonInput
                            label="ID / EMAIL"
                            icon="person"
                            placeholder="username@cyber.net"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                        />

                        <NeonInput
                            label="PASSWORD"
                            icon="lock-closed"
                            placeholder="••••••••"
                            isPassword
                            value={password}
                            onChangeText={setPassword}
                        />

                        <TouchableOpacity style={styles.forgotContainer}>
                            <ThemedText style={styles.forgotText}>Forgot access code?</ThemedText>
                        </TouchableOpacity>

                        <NeonButton
                            title="INITIALIZE"
                            onPress={handleLogin}
                            loading={loading}
                            icon={<Ionicons name="arrow-forward" size={20} color="black" />}
                            textStyle={{ fontSize: 18, fontWeight: '900' }}
                            style={styles.loginButton}
                        />
                    </View>

                    <View style={styles.footer}>
                        <View style={styles.signupContainer}>
                            <ThemedText style={styles.footerText}>New user? </ThemedText>
                            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
                                <ThemedText style={styles.createAccount}>CREATE ACCOUNT</ThemedText>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.bioContainer}>
                            <Ionicons name="finger-print" size={40} color={ZyncTheme.colors.primary} style={{ opacity: 0.5 }} />
                            <ThemedText style={styles.bioText}>BIOMETRIC SCAN AVAILABLE</ThemedText>
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'space-between',
        paddingVertical: ZyncTheme.spacing.xxl,
    },
    header: {
        alignItems: 'center',
        // marginTop: 40,
    },
    logoContainer: {
        width: 60,
        height: 60,
        backgroundColor: ZyncTheme.colors.primary,
        borderRadius: ZyncTheme.borderRadius.m,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: ZyncTheme.spacing.l,
        shadowColor: ZyncTheme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
        elevation: 10,
    },
    welcome: {
        paddingTop: ZyncTheme.spacing.xxl,
        fontSize: 32,
        fontFamily: ZyncTheme.typography.weight.extraBold,
        letterSpacing: 2,
        marginBottom: ZyncTheme.spacing.xs,
        textTransform: 'uppercase',
    },
    subtitle: {
        color: ZyncTheme.colors.textSecondary,
        fontSize: ZyncTheme.typography.size.m,
    },
    form: {
        width: '100%',
        paddingHorizontal: ZyncTheme.spacing.m,
    },
    forgotContainer: {
        alignItems: 'flex-end',
        marginBottom: ZyncTheme.spacing.xl,
    },
    forgotText: {
        color: ZyncTheme.colors.textSecondary,
        fontSize: ZyncTheme.typography.size.s,
    },
    loginButton: {
        height: 60,
        shadowColor: ZyncTheme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 10,
    },
    footer: {
        alignItems: 'center',
        gap: ZyncTheme.spacing.xl,
    },
    signupContainer: {
        flexDirection: 'row',
    },
    footerText: {
        color: ZyncTheme.colors.textSecondary,
    },
    createAccount: {
        color: ZyncTheme.colors.primary,
        fontWeight: 'bold',
    },
    bioContainer: {
        alignItems: 'center',
        gap: ZyncTheme.spacing.s,
    },
    bioText: {
        color: ZyncTheme.colors.primary,
        opacity: 0.5,
        fontSize: 10,
        letterSpacing: 1.5,
    }
});
