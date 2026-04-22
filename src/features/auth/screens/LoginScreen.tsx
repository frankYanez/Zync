import { NeonButton } from '@/components/NeonButton';
import { NeonInput } from '@/components/NeonInput';
import { ScreenLayout } from '@/components/ScreenLayout';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Keyboard,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
    ActivityIndicator,
    Image,
} from 'react-native';

let GoogleSignin: any = null;
let statusCodes: any = {};
try {
    const GoogleModule = require('@react-native-google-signin/google-signin');
    GoogleSignin = GoogleModule.GoogleSignin;
    statusCodes = GoogleModule.statusCodes;
    GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    });
} catch (e) {
    console.log('Google Sign-In native module not available.');
}

export default function AuthScreen() {
    const router = useRouter();
    const { login, loginWithGoogle } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const handleGoogleLogin = async () => {
        setGoogleLoading(true);
        try {
            await GoogleSignin.hasPlayServices();
            await GoogleSignin.signIn();
            const tokens = await GoogleSignin.getTokens();
            if (!tokens.accessToken) throw new Error('No accessToken received');
            await loginWithGoogle(tokens.accessToken);
        } catch (error: any) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                // usuario canceló, no mostrar error
            } else if (error.code === statusCodes.IN_PROGRESS) {
                // ya hay un sign-in en progreso
            } else {
                const message = error.response?.data?.message || 'Google login failed.';
                Alert.alert('Error', message);
            }
        } finally {
            setGoogleLoading(false);
        }
    };

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        setLoading(true);
        Keyboard.dismiss();

        try {
            await login({ email: email.trim(), password });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Login failed. Please check your credentials.';
            Alert.alert('Access Denied', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenLayout style={styles.container} transparent>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={{ flex: 1, justifyContent: 'space-between', backgroundColor: "transparent" }}>
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

                        <View style={styles.dividerRow}>
                            <View style={styles.dividerLine} />
                            <ThemedText style={styles.dividerText}>OR</ThemedText>
                            <View style={styles.dividerLine} />
                        </View>

                        <TouchableOpacity
                            style={[styles.googleButton, googleLoading && styles.googleButtonDisabled]}
                            onPress={handleGoogleLogin}
                            disabled={googleLoading}
                            activeOpacity={0.8}
                        >
                            {googleLoading ? (
                                <ActivityIndicator size="small" color={ZyncTheme.colors.text} />
                            ) : (
                                <>
                                    <Image
                                        source={{ uri: 'https://www.google.com/favicon.ico' }}
                                        style={styles.googleIcon}
                                    />
                                    <ThemedText style={styles.googleButtonText}>CONTINUE WITH GOOGLE</ThemedText>
                                </>
                            )}
                        </TouchableOpacity>
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
        backgroundColor: "transparent",
    },
    header: {
        alignItems: 'center',
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
        color: ZyncTheme.colors.primary,
    },
    subtitle: {
        color: ZyncTheme.colors.textSecondary,
        fontSize: ZyncTheme.typography.size.m,
    },
    form: {
        width: '100%',
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
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: ZyncTheme.spacing.l,
        gap: ZyncTheme.spacing.m,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: ZyncTheme.colors.border,
    },
    dividerText: {
        color: ZyncTheme.colors.textSecondary,
        fontSize: ZyncTheme.typography.size.s,
        letterSpacing: 1,
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderWidth: 1,
        borderColor: ZyncTheme.colors.border,
        borderRadius: ZyncTheme.borderRadius.m,
        backgroundColor: ZyncTheme.colors.card,
        gap: ZyncTheme.spacing.s,
    },
    googleButtonDisabled: {
        opacity: 0.5,
    },
    googleIcon: {
        width: 20,
        height: 20,
    },
    googleButtonText: {
        color: ZyncTheme.colors.text,
        fontSize: ZyncTheme.typography.size.s,
        fontWeight: '700',
        letterSpacing: 1,
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
