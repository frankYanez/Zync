import { ThemedText } from '@/presentation/components/themed-text';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleProp, StyleSheet, TextInput, TextInputProps, TouchableOpacity, View, ViewStyle } from 'react-native';

interface NeonInputProps extends TextInputProps {
    label?: string;
    icon?: keyof typeof Ionicons.glyphMap;
    containerStyle?: StyleProp<ViewStyle>;
}

export function NeonInput({ label, icon, containerStyle, style, isPassword, ...props }: NeonInputProps & { isPassword?: boolean }) {
    const [isSecure, setIsSecure] = React.useState(!!isPassword);

    return (
        <View style={[styles.container, containerStyle]}>
            {label && <ThemedText style={styles.label}>{label}</ThemedText>}
            <View style={styles.inputWrapper}>
                {icon && (
                    <Ionicons name={icon} size={20} color={ZyncTheme.colors.textSecondary} style={styles.icon} />
                )}
                <TextInput
                    style={[styles.input, style]}
                    placeholderTextColor={ZyncTheme.colors.textSecondary}
                    cursorColor={ZyncTheme.colors.primary}
                    secureTextEntry={isSecure}
                    {...props}
                />
                {isPassword && (
                    <TouchableOpacity onPress={() => setIsSecure(!isSecure)}>
                        <Ionicons
                            name={isSecure ? "eye-off-outline" : "eye-outline"}
                            size={20}
                            color={ZyncTheme.colors.textSecondary}
                            style={styles.rightIcon}
                        />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: ZyncTheme.spacing.m,
    },
    label: {
        fontSize: ZyncTheme.typography.size.xs,
        color: ZyncTheme.colors.primary,
        marginBottom: ZyncTheme.spacing.s,
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontWeight: 'bold',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: ZyncTheme.colors.card,
        borderRadius: ZyncTheme.borderRadius.s,
        borderWidth: 1,
        borderColor: ZyncTheme.colors.border,
        paddingHorizontal: ZyncTheme.spacing.m,
        height: 56,
    },
    icon: {
        marginRight: ZyncTheme.spacing.m,
    },
    rightIcon: {
        marginLeft: ZyncTheme.spacing.m,
    },
    input: {
        flex: 1,
        color: ZyncTheme.colors.text,
        fontSize: ZyncTheme.typography.size.m,
        height: '100%',
    },
});
