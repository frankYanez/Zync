import { ZyncTheme } from '@/shared/constants/theme';
import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

interface CyberCardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    variant?: 'default' | 'neon-border';
}

export function CyberCard({ children, style, variant = 'default' }: CyberCardProps) {
    return (
        <View style={[
            styles.card,
            variant === 'neon-border' && styles.neonBorder,
            style
        ]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: ZyncTheme.colors.card,
        borderRadius: ZyncTheme.borderRadius.l,
        padding: ZyncTheme.spacing.m,
        overflow: 'hidden',
    },
    neonBorder: {
        borderWidth: 1,
        borderColor: ZyncTheme.colors.primary,
        shadowColor: ZyncTheme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    }
});
