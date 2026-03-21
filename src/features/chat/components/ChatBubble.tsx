import { ThemedText } from '@/components/themed-text';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { View as MotiView } from 'moti';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Message } from '../domain/chat.types';

interface ChatMessageBubbleProps {
    message: Message;
    currentUserId: string; // ID of the current user (ME) to compare against
}

export const ChatMessageBubble = ({ message, currentUserId }: ChatMessageBubbleProps) => {
    // Determine if message is mine. 
    // Logic: If fromUserId is NOT the other person's ID (passed as prop? Wait, logic was !otherUserId == Me)
    // Actually, simpler: Pass "isMe" prop or handle ID check here.
    // Let's stick to the screen logic: `isMe = item.fromUserId !== otherUserId`.
    // But passing `isMe` is cleaner. let's change prop to `isMe`.
    return null;
}
// Rewriting to cleaner interface

interface BubbleProps {
    item: Message;
    isMe: boolean;
}

export const ChatBubble = ({ item, isMe }: BubbleProps) => {
    return (
        <MotiView
            from={{ opacity: 0, scale: 0.9, translateY: 10 }}
            animate={{ opacity: 1, scale: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 300 }}
            style={[styles.messageRow, isMe ? styles.rowMe : styles.rowOther]}
        >
            {!isMe && (
                <View style={styles.avatarPlaceholder}>
                    <Ionicons name="person" size={12} color="#000" />
                </View>
            )}
            <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
                <ThemedText style={[styles.messageText, isMe ? styles.textMe : styles.textOther]}>
                    {item.content}
                </ThemedText>
                <ThemedText style={styles.timeText}>
                    {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </ThemedText>
            </View>
        </MotiView>
    );
};

const styles = StyleSheet.create({
    messageRow: {
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    rowMe: {
        justifyContent: 'flex-end',
    },
    rowOther: {
        justifyContent: 'flex-start',
    },
    avatarPlaceholder: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: ZyncTheme.colors.border, // gray
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
        marginBottom: 2,
    },
    bubble: {
        maxWidth: '75%',
        paddingHorizontal: 21,
        // paddingVertical: 7,
        paddingTop: 10,
        borderRadius: 10,
    },
    bubbleMe: {
        backgroundColor: ZyncTheme.colors.primary,

        shadowColor: ZyncTheme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 8,
        elevation: 4,
    },
    bubbleOther: {
        backgroundColor: ZyncTheme.colors.card,


    },
    messageText: {
        fontSize: 14,
        lineHeight: 18,
    },
    textMe: {
        color: '#000000',
        fontWeight: '500',
        paddingVertical: 3,
    },
    textOther: {
        color: '#FFFFFF',
    },
    timeText: {
        fontSize: 10,
        alignSelf: 'flex-end',
        opacity: 0.6,
        color: 'gray',
    },
});
