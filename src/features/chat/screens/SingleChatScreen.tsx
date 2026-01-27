import { useAuth } from '@/features/auth/context/AuthContext';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Image, ImageBackground, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TypingIndicator } from '../components/TypingIndicator';
import { useChat } from '../hooks/useChat';
import { useConnectedUsers } from '../hooks/useConnectedUsers';

export const SingleChatScreen = () => {
    const { id, eventId } = useLocalSearchParams<{ id: string, eventId: string }>();
    const router = useRouter();
    const { user } = useAuth();
    const currentUserId = user?.sub || '';
    const insets = useSafeAreaInsets();

    // Fetch other user details for header
    const { users: connectedUsers } = useConnectedUsers(eventId || 'general-event');
    const otherUser = connectedUsers.find(u => u.id === id);

    // Chat Hook
    const {
        messages,
        messageText,
        setMessageText,
        handleSend,
        flatListRef,
        typingUser,
        markAllAsSeen,
        isJoined,
        scrollToBottom
    } = useChat(eventId || 'general-event', currentUserId, id);

    const renderMessage = ({ item }: { item: any }) => {
        const isMe = item.fromUserId === currentUserId;

        if (isMe) {
            // Determine Status Icon
            let statusIcon = "checkmark-outline"; // Sent
            let statusColor = "rgba(0,0,0,0.4)";

            if (item.seenAt) {
                statusIcon = "checkmark-done"; // Seen
                statusColor = "#34B7F1"; // Blue
            } else if (item.deliveredAt) {
                statusIcon = "checkmark-done-outline"; // Delivered
                statusColor = "rgba(0,0,0,0.6)";
            }

            return (
                <View style={[styles.messageRow, { justifyContent: 'flex-end' }]}>
                    <LinearGradient
                        colors={[ZyncTheme.colors.primary, '#AACC00']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.messageBubble]}
                    >
                        <Text style={[styles.messageText, { color: '#000', fontWeight: '600' }]}>{item.content}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4 }}>
                            <Text style={[styles.timestamp, { color: 'rgba(0,0,0,0.6)', marginRight: 4 }]}>
                                {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                            <Ionicons name={statusIcon as any} size={14} color={statusColor} />
                        </View>
                    </LinearGradient>
                </View>
            );
        }

        return (
            <View style={[styles.messageRow, { justifyContent: 'flex-start' }]}>
                <View style={styles.avatarContainer}>
                    {otherUser?.avatar ? (
                        <Image source={{ uri: otherUser.avatar }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, { backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' }]}>
                            <Text style={{ color: '#888', fontSize: 10 }}>{(otherUser?.name || id || '?').substring(0, 2).toUpperCase()}</Text>
                        </View>
                    )}
                </View>

                <View>
                    <View style={[styles.messageBubble, styles.theirMessage]}>
                        <Text style={styles.messageText}>{item.content}</Text>
                        <Text style={styles.timestamp}>
                            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <ImageBackground
                source={{ uri: 'https://images.pexels.com/photos/34328350/pexels-photo-34328350.jpeg' }}
                style={styles.backgroundImage}
                resizeMode="cover"
            >
                <LinearGradient
                    colors={['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.95)']}
                    style={StyleSheet.absoluteFillObject}
                />

                {/* Header */}
                <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <BlurView intensity={30} tint="light" style={styles.iconButtonBlur}>
                            <Ionicons name="arrow-back" size={20} color="white" />
                        </BlurView>
                    </TouchableOpacity>

                    <View style={styles.headerUserContainer}>
                        {otherUser?.avatar ? (
                            <Image source={{ uri: otherUser.avatar }} style={styles.headerAvatar} />
                        ) : (
                            <View style={[styles.headerAvatar, { backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' }]}>
                                <Ionicons name="person" size={16} color="#888" />
                            </View>
                        )}
                        <View>
                            <Text style={styles.headerTitle}>{otherUser?.name || id}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <View style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: 3,
                                    backgroundColor: otherUser?.isOnline ? '#4CAF50' : '#888',
                                    marginRight: 4
                                }} />
                                <Text style={styles.headerSubtitle}>{otherUser?.isOnline ? 'Online' : 'Offline'}</Text>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.menuButton}>
                        <Ionicons name="ellipsis-vertical" size={20} color="white" />
                    </TouchableOpacity>
                </View>

                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.chatContent}
                    keyboardShouldPersistTaps="handled"
                    onContentSizeChange={() => {
                        markAllAsSeen();
                        scrollToBottom();
                    }}
                    onLayout={() => markAllAsSeen()}
                />

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardAvoidingView}
                >
                    {/* Typing Indicator */}
                    {typingUser === id && (
                        <TypingIndicator
                            avatarUrl={otherUser?.avatar}
                        />
                    )}

                    <BlurView intensity={90} tint="dark" style={[styles.inputContainer, { paddingBottom: insets.bottom + 10 }]}>
                        <TextInput
                            style={styles.input}
                            value={messageText}
                            onChangeText={setMessageText}
                            placeholder="Type a message..."
                            placeholderTextColor="#666"
                        />
                        <TouchableOpacity
                            onPress={handleSend}
                            activeOpacity={0.8}
                            disabled={!messageText.trim()}
                        >
                            <View style={[
                                styles.sendButton,
                                ZyncTheme.shadowGlow,
                                (!messageText.trim()) && { opacity: 0.5 }
                            ]}>
                                <Ionicons name="send" size={18} color="black" />
                            </View>
                        </TouchableOpacity>
                    </BlurView>
                </KeyboardAvoidingView>
            </ImageBackground>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    backgroundImage: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        zIndex: 10,
    },
    backButton: {
        marginRight: 10,
    },
    iconButtonBlur: {
        width: 36,
        height: 36,
        borderRadius: 18,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    headerUserContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    headerAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#333',
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#444',
    },
    headerTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        color: '#888',
        fontSize: 12,
    },
    menuButton: {
        marginLeft: 'auto',
    },
    chatContent: {
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 100,
    },
    messageRow: {
        flexDirection: 'row',
        marginBottom: 16,
        alignItems: 'flex-end',
    },
    avatarContainer: {
        marginRight: 8,
        marginBottom: 2,
    },
    avatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#333',
        borderWidth: 1,
        borderColor: '#444',
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 6,
        paddingHorizontal: 16,
        borderRadius: 10,
    },
    theirMessage: {
        backgroundColor: 'rgba(30, 30, 30, 0.7)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    messageText: {
        color: 'white',
        fontSize: 15,
        lineHeight: 20,
    },
    timestamp: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.4)',
        alignSelf: 'flex-end',
        marginTop: 4,
    },
    keyboardAvoidingView: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    input: {
        flex: 1,
        height: 44,
        backgroundColor: 'rgba(20,20,20,0.6)',
        borderRadius: 22,
        paddingHorizontal: 20,
        color: 'white',
        marginRight: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        fontSize: 15,
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: ZyncTheme.colors.primary,
    },
});
