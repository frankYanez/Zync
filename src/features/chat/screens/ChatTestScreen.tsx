import { ScreenLayout } from '@/components/ScreenLayout';
import { ZyncTheme } from '@/shared/constants/theme';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, FlatList, ImageBackground, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { ChatBubble } from '../components/ChatBubble';
import { ChatHeader } from '../components/ChatHeader';
import { ChatInput } from '../components/ChatInput';
import { useChat } from '../hooks/useChat';

const HARDCODED_EVENT_ID = "47cf262b-0517-49ee-a551-67d5ae786121";
const HARDCODED_OTHER_USER_ID = "1d601b30-f7e8-47c6-8eb9-0e831384b4aa";

export default function ChatScreen() {
    const router = useRouter();
    const {
        messages,
        loading,
        isJoined,
        messageText,
        setMessageText,
        handleSend,
        flatListRef,
        scrollToBottom
    } = useChat(HARDCODED_EVENT_ID, HARDCODED_OTHER_USER_ID);

    return (
        <ScreenLayout noPadding>
            <ChatHeader isJoined={isJoined} />
            <ImageBackground
                source={{ uri: 'https://images.pexels.com/photos/2311713/pexels-photo-2311713.jpeg' }}
                style={styles.backgroundImage}
                resizeMode="cover"
            >
                <View style={styles.overlay} />
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{ flex: 1 }}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
                >
                    {loading && messages.length === 0 ? (
                        <View style={styles.centerContainer}>
                            <ActivityIndicator size="large" color={ZyncTheme.colors.primary} />
                        </View>
                    ) : (
                        <FlatList
                            ref={flatListRef}
                            data={messages}
                            keyExtractor={item => item.id}
                            renderItem={({ item }) => (
                                <ChatBubble
                                    item={item}
                                    isMe={item.fromUserId !== HARDCODED_OTHER_USER_ID}
                                />
                            )}
                            contentContainerStyle={styles.listContent}
                            onContentSizeChange={scrollToBottom}
                            onLayout={scrollToBottom}
                        />
                    )}

                    <ChatInput
                        value={messageText}
                        onChangeText={setMessageText}
                        onSend={handleSend}
                        isJoined={isJoined}
                    />
                </KeyboardAvoidingView>
            </ImageBackground>
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        width: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.75)', // Dark overlay to ensure readability
    },
    listContent: {
        padding: ZyncTheme.spacing.m,
        paddingBottom: 20,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
});
