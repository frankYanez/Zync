import { NeonButton } from '@/components/NeonButton';
import { NeonInput } from '@/components/NeonInput';
import { ScreenLayout } from '@/components/ScreenLayout';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function VerifyScreen() {
    const router = useRouter();
    const { email } = useLocalSearchParams<{ email: string }>();
    const { verifyEmail, resendVerification } = useAuth();

    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);

    const handleVerify = async () => {
        if (!otp || otp.length < 6) {
            Alert.alert('Error', 'Please enter a valid 6-digit code');
            return;
        }

        setLoading(true);
        try {
            const success = await verifyEmail(email || '', otp);
            if (success) {
                Alert.alert('Success', 'Email verified successfully', [
                    { text: 'Login', onPress: () => router.replace('/(auth)') }
                ]);
            }
        } catch (error: any) {
            Alert.alert('Error', error.response?.data?.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        try {
            await resendVerification(email || '');
            Alert.alert('Sent', 'Verification code resent to your email');
        } catch (error: any) {
            Alert.alert('Error', 'Failed to resend code');
        } finally {
            setResending(false);
        }
    };

    return (
        <ScreenLayout style={styles.container} transparent>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>

            <View style={styles.content}>
                <View style={styles.header}>
                    <Ionicons name="mail-open" size={48} color={ZyncTheme.colors.primary} />
                    <ThemedText style={styles.title}>VERIFY EMAIL</ThemedText>
                    <ThemedText style={styles.subtitle}>
                        Enter the code sent to {email}
                    </ThemedText>
                </View>

                <NeonInput
                    label="VERIFICATION CODE"
                    placeholder="123456"
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                    style={{ textAlign: 'center', letterSpacing: 8, fontSize: 24 }}
                />

                <NeonButton
                    title="VERIFY"
                    onPress={handleVerify}
                    loading={loading}
                    style={styles.verifyButton}
                />

                <TouchableOpacity onPress={handleResend} disabled={resending} style={styles.resendButton}>
                    <ThemedText style={styles.resendText}>
                        {resending ? 'Sending...' : 'Resend Code'}
                    </ThemedText>
                </TouchableOpacity>
            </View>
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: ZyncTheme.spacing.m,
    },
    backButton: {
        marginTop: 40,
        marginBottom: 20,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 16,
        color: 'white',
        letterSpacing: 2,
    },
    subtitle: {
        color: ZyncTheme.colors.textSecondary,
        marginTop: 8,
        textAlign: 'center',
    },
    verifyButton: {
        marginTop: 24,
        height: 50,
    },
    resendButton: {
        marginTop: 20,
        alignItems: 'center',
    },
    resendText: {
        color: ZyncTheme.colors.primary,
        fontSize: 14,
        fontWeight: 'bold',
    },
});
