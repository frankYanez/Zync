import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

interface TypingIndicatorProps {
    avatarUrl?: string;
}

const Dot = ({ index }: { index: number }) => {
    return (
        <MotiView
            from={{ opacity: 0.5, translateY: 0 }}
            animate={{ opacity: 1, translateY: -3 }}
            transition={{
                type: 'timing',
                duration: 500,
                loop: true,
                delay: index * 150,
            }}
            style={styles.dot}
        />
    );
};

export const TypingIndicator = ({ avatarUrl }: TypingIndicatorProps) => {
    return (
        <View style={styles.container}>
            {/* User Avatar */}
            <View style={styles.avatarContainer}>
                {avatarUrl ? (
                    <Image source={{ uri: avatarUrl }} style={styles.avatar} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Ionicons name="person" size={10} color="#888" />
                    </View>
                )}
            </View>

            {/* Bubble Animation */}
            <View style={styles.bubble}>
                <Dot index={0} />
                <Dot index={1} />
                <Dot index={2} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        marginBottom: 8,
        marginLeft: 16,
    },
    avatarContainer: {
        marginRight: 8,
        marginBottom: 2,
    },
    avatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
    },
    avatarPlaceholder: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#444',
    },
    bubble: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(30, 30, 30, 0.7)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        height: 36,
        gap: 4,
        borderBottomLeftRadius: 2, // Comic bubble effect
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: ZyncTheme.colors.primary,
    },
});
