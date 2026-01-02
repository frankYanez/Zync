import { ZyncTheme } from '@/shared/constants/theme';
import React from 'react';
import { ActivityIndicator, StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';

interface NeonButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    loading?: boolean;
    disabled?: boolean;
    style?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    icon?: React.ReactNode;
}

export function NeonButton({
    title,
    onPress,
    variant = 'primary',
    loading = false,
    disabled = false,
    style,
    textStyle,
    icon
}: NeonButtonProps) {

    const getBackgroundColor = () => {
        if (disabled) return ZyncTheme.colors.card;
        switch (variant) {
            case 'primary': return ZyncTheme.colors.primary;
            case 'secondary': return ZyncTheme.colors.card;
            case 'outline': return 'transparent';
            case 'ghost': return 'transparent';
            default: return ZyncTheme.colors.primary;
        }
    };

    const getTextColor = () => {
        if (disabled) return ZyncTheme.colors.textSecondary;
        switch (variant) {
            case 'primary': return '#000000'; // Black text on neon green
            case 'secondary': return ZyncTheme.colors.text;
            case 'outline': return ZyncTheme.colors.primary;
            case 'ghost': return ZyncTheme.colors.text;
            default: return '#000000';
        }
    };

    const getBorder = () => {
        if (variant === 'outline') {
            return {
                borderWidth: 1,
                borderColor: disabled ? ZyncTheme.colors.textSecondary : ZyncTheme.colors.primary,
            };
        }
        return {};
    };

    return (
        <TouchableOpacity
            style={[
                styles.button,
                { backgroundColor: getBackgroundColor() },
                getBorder(),
                style,
                disabled && styles.disabled
            ]}
            onPress={onPress}
            activeOpacity={0.8}
            disabled={disabled || loading}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor()} />
            ) : (
                <>
                    {icon}
                    <Text style={[
                        styles.text,
                        { color: getTextColor() },
                        textStyle
                    ]}>
                        {title}
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        height: 50,
        borderRadius: ZyncTheme.borderRadius.m,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: ZyncTheme.spacing.l,
        gap: ZyncTheme.spacing.s,
    },
    text: {
        fontSize: ZyncTheme.typography.size.m,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    disabled: {
        opacity: 0.7,
    }
});
