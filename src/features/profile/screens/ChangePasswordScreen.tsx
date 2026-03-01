import { NeonButton } from '@/components/NeonButton';
import { NeonInput } from '@/components/NeonInput';
import { ScreenLayout } from '@/components/ScreenLayout';
import { ThemedText } from '@/components/themed-text';
import { changePassword } from '@/features/profile/services/profile.service';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ChangePasswordScreen() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            await changePassword({ oldPassword, newPassword });
            Alert.alert('Success', 'Password changed successfully', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error?.response?.data?.message || 'Failed to change password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScreenLayout style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={ZyncTheme.colors.text} />
                </TouchableOpacity>
                <ThemedText style={styles.title}>Change Password</ThemedText>
            </View>

            <View style={styles.formContainer}>
                <NeonInput
                    placeholder="Current Password"
                    secureTextEntry
                    value={oldPassword}
                    onChangeText={setOldPassword}
                />
                <View style={{ height: 16 }} />
                <NeonInput
                    placeholder="New Password"
                    secureTextEntry
                    value={newPassword}
                    onChangeText={setNewPassword}
                />
                <View style={{ height: 16 }} />
                <NeonInput
                    placeholder="Confirm New Password"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />

                <NeonButton
                    title={isLoading ? "UPDATING..." : "UPDATE PASSWORD"}
                    onPress={handleChangePassword}
                    disabled={isLoading}
                    style={styles.saveBtn}
                />
            </View>
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: ZyncTheme.spacing.m,
        paddingTop: ZyncTheme.spacing.l,
        marginBottom: ZyncTheme.spacing.xl,
    },
    backButton: {
        marginRight: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    formContainer: {
        paddingHorizontal: ZyncTheme.spacing.m,
    },
    saveBtn: {
        marginTop: 32,
    }
});
