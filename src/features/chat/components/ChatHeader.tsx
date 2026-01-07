import { ThemedText } from '@/components/themed-text';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface ChatHeaderProps {
    isJoined: boolean;
}

export const ChatHeader = ({ isJoined }: ChatHeaderProps) => {
    const router = useRouter();

    return (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="chevron-back" size={24} color={ZyncTheme.colors.text} />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
                <ThemedText style={styles.headerTitle}>CHAT SOPORTE</ThemedText>
                <View style={styles.statusRow}>
                    <View style={[styles.statusDot, { backgroundColor: isJoined ? '#00FF00' : '#FF0000' }]} />
                    <ThemedText style={styles.headerSubtitle}>
                        {isJoined ? 'En línea' : 'Conectando...'}
                    </ThemedText>
                </View>
            </View>
            <TouchableOpacity style={styles.moreButton}>
                <Ionicons name="ellipsis-vertical" size={20} color={ZyncTheme.colors.text} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: ZyncTheme.spacing.m,
        paddingVertical: ZyncTheme.spacing.m,
        backgroundColor: ZyncTheme.colors.card,
        borderBottomWidth: 1,
        borderBottomColor: ZyncTheme.colors.border,
    },
    backButton: {
        padding: 5,
        marginRight: 10,
    },
    headerInfo: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    headerSubtitle: {
        fontSize: 12,
        color: ZyncTheme.colors.textSecondary,
    },
    moreButton: {
        padding: 5,
    },
});
