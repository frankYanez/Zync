import { useAuth } from '@/features/auth/context/AuthContext';
import { useChat } from '@/features/chat/hooks/useChat';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Image, ImageBackground, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ConnectedUsersCarousel } from '../components/ConnectedUsersCarousel';
import { EventStoriesCarousel } from '../components/EventStoriesCarousel';
import { TypingIndicator } from '../components/TypingIndicator';


export const GroupChatScreen = () => {
    const { eventId } = useLocalSearchParams<{ eventId: string }>();
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();
    const effectiveUserId = user?.sub || '';

    const {
        sendTyping,
        messages,
        messageText,
        setMessageText,
        handleSend,
        flatListRef,
        typingUser,
        markAllAsSeen,
        isJoined,
        scrollToBottom,
        onNewMessage
    } = useChat(eventId, effectiveUserId);

    // Listen for new messages for side effects (e.g. sounds, haptics)
    React.useEffect(() => {
        onNewMessage((msg) => {
            // console.log('GroupChatScreen: New message received in view', msg);
            // Here we could trigger haptic feedback or a sound
        });
    }, [onNewMessage]);

    const renderMessage = ({ item }: { item: any }) => {
        const isMe = item.fromUserId === effectiveUserId;

        // Render My Message (Neon/Lime Gradient Bubble)
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
                        colors={[ZyncTheme.colors.primary, '#AACC00']} // Electric Lime Gradient
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

        // Render Their Message (Dark Glass Bubble)
        return (
            <View style={[styles.messageRow, { justifyContent: 'flex-start' }]}>
                {/* Avatar Placeholder or Actual Avatar */}
                <View style={styles.avatarContainer}>
                    {item.sender?.avatar ? (
                        <Image source={{ uri: item.sender.avatar }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, { backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' }]}>
                            <Text style={{ color: '#888', fontSize: 10 }}>{item.fromUserId.substring(0, 2).toUpperCase()}</Text>
                        </View>
                    )}
                </View>

                <View>
                    <Text style={styles.senderName}>{item.sender?.name || item.fromUserId}</Text>
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
                {/* Dark Gradient Overlay for Readability */}
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
                    <View>
                        <Text style={styles.headerTitle}>CHAT GENERAL</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{
                                width: 8,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: isJoined ? '#4CAF50' : '#FF5252',
                                marginRight: 6
                            }} />
                            <Text style={styles.headerSubtitle}>
                                {isJoined ? 'Live • ' : 'Connecting... '}
                            </Text>
                            <Text style={styles.headerSubtitle}>128 Online</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.menuButton}>
                        <Ionicons name="ellipsis-horizontal" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Event Stories */}
                <EventStoriesCarousel eventId={eventId} canLoad={isJoined} />

                {/* Connected Users - Transparent BG */}
                <View style={{ height: 100 }}>
                    <ConnectedUsersCarousel eventId={eventId} />
                </View>

                {/* Messages */}
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
                    onLayout={() => {
                        markAllAsSeen();
                        /*  scrollToBottom(); */
                    }}
                />

                {/* Input Area */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
                    style={styles.keyboardAvoidingView}
                >
                    {/* Typing Indicator */}
                    {typingUser && (
                        <TypingIndicator
                            avatarUrl={messages.find(m => m.fromUserId === typingUser)?.sender?.avatar}
                        />
                    )}

                    <BlurView intensity={90} tint="dark" style={[styles.inputContainer, { paddingBottom: insets.bottom + 10 }]}>
                        <TextInput
                            style={styles.input}
                            value={messageText}
                            onChangeText={(t) => {
                                // ⚠️ FIX: Pasar eventId explícitamente
                                setMessageText(t);
                            }}
                            placeholder="Type a message..."
                            placeholderTextColor="#666"
                            editable={isJoined} // Solo permitir escribir si está conectado
                        />
                        <TouchableOpacity
                            onPress={handleSend}
                            activeOpacity={0.8}
                            disabled={!isJoined || !messageText.trim()} // Deshabilitar si no está conectado o no hay texto
                        >
                            <View style={[
                                styles.sendButton,
                                ZyncTheme.shadowGlow,
                                (!isJoined || !messageText.trim()) && { opacity: 0.5 }
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
        marginRight: 16,
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
    headerTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    headerSubtitle: {
        color: ZyncTheme.colors.primary,
        fontSize: 12,
        fontWeight: '600',
        textShadowColor: ZyncTheme.colors.primary,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    menuButton: {
        marginLeft: 'auto',
    },
    chatContent: {
        paddingHorizontal: 16,
        paddingBottom: 100,
        paddingTop: 10,
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
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#333',
        borderWidth: 1,
        borderColor: '#444',
    },
    senderName: {
        color: '#888',
        fontSize: 10,
        marginBottom: 4,
        marginLeft: 2,
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
    typingContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: 'transparent',
    },
    typingText: {
        color: '#888',
        fontSize: 12,
        fontStyle: 'italic',
    },
});