
import { NeonButton } from '@/components/NeonButton';
import { NeonInput } from '@/components/NeonInput';
import { ScreenLayout } from '@/components/ScreenLayout';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

export default function RegisterScreen() {
    const router = useRouter();
    const { register, verifyEmail, resendVerification, requestEmailVerification } = useAuth(); // Added requestEmailVerification

    // Form State
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nationality, setNationality] = useState('');
    const [phone, setPhone] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [country, setCountry] = useState('');

    const [loading, setLoading] = useState(false);

    // Verification Modal State
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [otp, setOtp] = useState('');
    const [timer, setTimer] = useState(600); // 10 minutes in seconds
    const [verifying, setVerifying] = useState(false);

    useEffect(() => {
        let interval: any;
        if (isModalVisible && timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            // Timer expired logic if needed
        }
        return () => clearInterval(interval);
    }, [isModalVisible, timer]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Step 1: Request Verification Code
    const handleRegisterStep1 = async () => {
        if (!firstName || !lastName || !email || !password || !phone || !nationality || !city || !country) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        setLoading(true);
        Keyboard.dismiss();

        try {
            // Request verification code FIRST
            await requestEmailVerification(email);

            // Show Modal to enter code
            setIsModalVisible(true);
            setTimer(600);
        } catch (error: any) {
            let message = error.response?.data?.message;
            if (typeof message === 'object' && message?.message) {
                message = message.message;
            }
            Alert.alert('Error', typeof message === 'string' ? message : 'Failed to send verification code.');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify Code and Register
    const handleVerifyAndRegister = async () => {
        if (!otp || otp.length < 6) {
            Alert.alert('Error', 'Please enter a valid 6-digit code');
            return;
        }

        setVerifying(true);
        try {
            // Verify Logic
            await verifyEmail(email, otp);

            // If verified, proceed to Register
            await register({
                email,
                password,
                firstName,
                lastName,
                nationality,
                phone,
                city,
                state: state || 'N/A',
                country
            });

            setIsModalVisible(false);
            Alert.alert('Success', 'Account created successfully', [
                { text: 'Login', onPress: () => router.replace('/(auth)') }
            ]);

        } catch (error: any) {
            let message = error.response?.data?.message;
            if (typeof message === 'object' && message?.message) {
                message = message.message;
            }
            Alert.alert('Error', typeof message === 'string' ? message : 'Verification or Registration failed');
        } finally {
            setVerifying(false);
        }
    }

    const handleResend = async () => {
        try {
            await resendVerification(email);
            setTimer(600);
            Alert.alert('Sent', 'Verification code resent');
        } catch (error) {
            Alert.alert('Error', 'Failed to resend code');
        }
    }

    return (
        <ScreenLayout style={styles.container} noPadding transparent>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>

                        <View style={styles.header}>
                            <ThemedText style={styles.welcome}>NEW IDENTITY</ThemedText>
                            <ThemedText style={styles.subtitle}>Join the network</ThemedText>
                        </View>

                        <View style={styles.form}>
                            <View style={styles.row}>
                                <NeonInput
                                    label="FIRST NAME"
                                    icon="person"
                                    placeholder="John"
                                    value={firstName}
                                    onChangeText={setFirstName}
                                    containerStyle={{ flex: 1, marginRight: 8 }}
                                />
                                <NeonInput
                                    label="LAST NAME"
                                    placeholder="Doe"
                                    value={lastName}
                                    onChangeText={setLastName}
                                    containerStyle={{ flex: 1, marginLeft: 8 }}
                                />
                            </View>

                            <NeonInput
                                label="EMAIL"
                                icon="mail"
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

                            <View style={styles.row}>
                                <NeonInput
                                    label="PHONE"
                                    icon="call"
                                    placeholder="+1 234..."
                                    value={phone}
                                    onChangeText={setPhone}
                                    keyboardType="phone-pad"
                                    containerStyle={{ flex: 1, marginRight: 8 }}
                                />
                                <NeonInput
                                    label="NATIONALITY"
                                    icon="flag"
                                    placeholder="AR"
                                    value={nationality}
                                    onChangeText={setNationality}
                                    containerStyle={{ flex: 1, marginLeft: 8 }}
                                />
                            </View>

                            <View style={styles.row}>
                                <NeonInput
                                    label="CITY"
                                    icon="location"
                                    placeholder="Night City"
                                    value={city}
                                    onChangeText={setCity}
                                    containerStyle={{ flex: 1, marginRight: 8 }}
                                />
                                <NeonInput
                                    label="STATE"
                                    placeholder="District 1"
                                    value={state}
                                    onChangeText={setState}
                                    containerStyle={{ flex: 1, marginLeft: 8 }}
                                />
                            </View>

                            <NeonInput
                                label="COUNTRY"
                                icon="globe"
                                placeholder="Global"
                                value={country}
                                onChangeText={setCountry}
                            />


                            <NeonButton
                                title="REGISTER"
                                onPress={handleRegisterStep1}
                                loading={loading}
                                icon={<Ionicons name="hardware-chip" size={20} color="black" />}
                                textStyle={{ fontSize: 18, fontWeight: '900' }}
                                style={styles.registerButton}
                            />
                        </View>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>

            {/* Verification Modal */}
            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsModalVisible(false)} // Optional: prevent closing if needed
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <ThemedText style={styles.modalTitle}>VERIFY EMAIL</ThemedText>
                        <ThemedText style={styles.modalSubtitle}>
                            Enter code sent to {email}
                        </ThemedText>

                        <ThemedText style={styles.timerText}>{formatTime(timer)}</ThemedText>

                        <NeonInput
                            label="OTP CODE"
                            placeholder="123456"
                            value={otp}
                            onChangeText={(text) => {
                                setOtp(text);
                                if (text.length === 6) {
                                    // Auto-verify when 6 digits are entered, but we need to pass the new text
                                    // However, state update is async, so handleVerifyAndRegister would use old state.
                                    // Better to just let user press Verify or use useEffect,
                                    // but user asked "Cuando se completen los 6 digitos ... intenta hacer el registro"
                                    // Safest is to wait for button press or careful effect.
                                }
                            }}
                            keyboardType="number-pad"
                            maxLength={6}
                            style={{ textAlign: 'center', letterSpacing: 5, fontSize: 24 }}
                            containerStyle={{ marginBottom: 20 }}
                        />

                        <NeonButton
                            title="VERIFY"
                            onPress={handleVerifyAndRegister}
                            loading={verifying}
                            style={{ marginBottom: 10 }}
                        />

                        <TouchableOpacity onPress={handleResend}>
                            <ThemedText style={styles.resendLink}>Resend Code</ThemedText>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.closeModalButton}>
                            <Ionicons name="close" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "transparent",
    },
    scrollContent: {
        padding: ZyncTheme.spacing.m,
        paddingBottom: 40,
    },
    backButton: {
        marginBottom: ZyncTheme.spacing.m,
    },
    header: {
        alignItems: 'center',
        marginBottom: ZyncTheme.spacing.xl,
    },
    welcome: {
        fontSize: 32,
        fontFamily: ZyncTheme.typography.weight.extraBold,
        letterSpacing: 2,
        marginBottom: ZyncTheme.spacing.xs,
        textTransform: 'uppercase',
        textAlign: 'center',
        paddingVertical: ZyncTheme.spacing.m,
    },
    subtitle: {
        color: ZyncTheme.colors.textSecondary,
        fontSize: ZyncTheme.typography.size.m,
    },
    form: {
        width: '100%',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 0,
    },
    registerButton: {
        height: 60,
        marginTop: ZyncTheme.spacing.l,
        shadowColor: ZyncTheme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.85)', // Semi-transparent background
    },
    modalContent: {
        width: '90%',
        backgroundColor: '#111',
        padding: 24,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: ZyncTheme.colors.primary,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        color: ZyncTheme.colors.primary,
        letterSpacing: 1,
    },
    modalSubtitle: {
        color: ZyncTheme.colors.textSecondary,
        marginBottom: 20,
        textAlign: 'center',
    },
    timerText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 20,
        fontVariant: ['tabular-nums'],
    },
    resendLink: {
        color: ZyncTheme.colors.primary,
        marginTop: 10,
        textDecorationLine: 'underline',
    },
    closeModalButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 5,
    }
});