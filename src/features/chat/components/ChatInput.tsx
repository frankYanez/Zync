import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface ChatInputProps {
    value: string;
    onChangeText: (text: string) => void;
    onSend: () => void;
    isJoined: boolean;
}

export const ChatInput = ({ value, onChangeText, onSend, isJoined }: ChatInputProps) => {
    return (
        <View style={styles.inputContainer}>
            <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChangeText}
                placeholder="Escribe un mensaje..."
                placeholderTextColor="#666"
                cursorColor={ZyncTheme.colors.primary}
                editable={isJoined}
                multiline
            />
            <TouchableOpacity
                style={[styles.sendButton, (!value.trim() || !isJoined) && styles.sendButtonDisabled]}
                onPress={onSend}
                disabled={!value.trim() || !isJoined}
            >
                <Ionicons
                    name="send"
                    size={20}
                    color={(!value.trim() || !isJoined) ? '#666' : '#000'}
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        paddingHorizontal: 16,
        backgroundColor: ZyncTheme.colors.card,
        borderTopWidth: 1,
        borderTopColor: ZyncTheme.colors.border,
    },
    input: {
        flex: 1,
        backgroundColor: ZyncTheme.colors.background,
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        color: '#FFF',
        maxHeight: 100,
        marginRight: 10,
        borderWidth: 1,
        borderColor: ZyncTheme.colors.border,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: ZyncTheme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        // Glow
        shadowColor: ZyncTheme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 5,
    },
    sendButtonDisabled: {
        backgroundColor: ZyncTheme.colors.border,
        shadowOpacity: 0,
        elevation: 0,
    },
});
