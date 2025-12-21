import { ScreenLayout } from '@/presentation/components/ScreenLayout';
import { ThemedText } from '@/presentation/components/themed-text';
import { NeonButton } from '@/presentation/components/ui/NeonButton';
import { NeonInput } from '@/presentation/components/ui/NeonInput';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Keyboard, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

export default function RegisterScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if (!name || !email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        Keyboard.dismiss();

        // Simulate registration delay
        setTimeout(() => {
            setLoading(false);
            Alert.alert('Success', 'Account created successfully', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        }, 1500);
    };

    return (
        <ScreenLayout style={styles.container}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={{ flex: 1 }}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>

                    <View style={styles.header}>
                        <ThemedText style={styles.welcome}>NEW IDENTITY</ThemedText>
                        <ThemedText style={styles.subtitle}>Join the network</ThemedText>
                    </View>

                    <View style={styles.form}>
                        <NeonInput
                            label="FULL NAME"
                            icon="person"
                            placeholder="Cyber Punk"
                            value={name}
                            onChangeText={setName}
                        />

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

                        <NeonButton
                            title="REGISTER"
                            onPress={handleRegister}
                            loading={loading}
                            icon={<Ionicons name="hardware-chip" size={20} color="black" />}
                            textStyle={{ fontSize: 18, fontWeight: '900' }}
                            style={styles.registerButton}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: ZyncTheme.spacing.l,
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
        paddingTop: ZyncTheme.spacing.xl,
    },
    subtitle: {
        color: ZyncTheme.colors.textSecondary,
        fontSize: ZyncTheme.typography.size.m,
    },
    form: {
        width: '100%',
        paddingHorizontal: ZyncTheme.spacing.m,
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
});
