import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList } from 'react-native';
import { enterEvent, leaveEvent as leaveEventApi } from '../../dashboard/services/event.service';
import { Message } from '../domain/chat.types';
import { getChatMessages, getEventMessages } from '../services/chat.service';
import {
    connectSocket,
    joinEvent,
    leaveEvent,
    offSocket,
    onEventMessage,
    onMessageDelivered,
    onMessageSeen,
    onNewMessage,
    onTyping,
    sendEventMessage,
    sendMessage,
    sendMessageDelivered,
    sendMessageSeen,
    sendTyping,
} from '../services/socket.service';

export const useChat = (eventId: string, currentUserId: string, otherUserId?: string) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [isJoined, setIsJoined] = useState(false);
    const [messageText, setMessageText] = useState('');
    const [typingUser, setTypingUser] = useState<string | null>(null);
    const flatListRef = useRef<FlatList>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastTypingSentRef = useRef<number>(0);

    const scrollToBottom = () => {
        flatListRef.current?.scrollToEnd({ animated: true });
    };

    // --- Typing Logic ---
    const handleTypingInput = (text: string) => {
        setMessageText(text);
        if (!text) return;

        const now = Date.now();
        if (now - lastTypingSentRef.current <= 2000) return;
        lastTypingSentRef.current = now;

        sendTyping(eventId, otherUserId);
    };

    // --- Status Updates ---
    const markAsSeen = useCallback((messageId: string) => {
        sendMessageSeen(messageId);
        setMessages(prev => prev.map(msg =>
            msg.id === messageId ? { ...msg, seenAt: new Date().toISOString() } : msg
        ));
    }, []);

    const markAllAsSeen = useCallback(() => {
        messages.forEach(msg => {
            if (msg.fromUserId !== currentUserId && !msg.seenAt) {
                markAsSeen(msg.id);
            }
        });
    }, [messages, markAsSeen, currentUserId]);

    useEffect(() => {
        let isMounted = true;

        const handleNewMessage = (raw: any) => {
            // Normalize field names: server sends `userId` for group msgs, `fromUserId` for private;
            // and `sentAt` instead of `createdAt`.
            const newMessage: Message = {
                id: raw.id,
                fromUserId: raw.fromUserId || raw.userId,
                content: raw.content,
                createdAt: raw.createdAt || raw.sentAt,
                sender: raw.sender,
                deliveredAt: raw.deliveredAt,
                seenAt: raw.seenAt,
            };

            const isMyMessage = newMessage.fromUserId === currentUserId;
            // Ignore own messages from socket to prevent duplication (handled optimistically)
            if (isMyMessage) return;

            sendMessageDelivered(newMessage.id!);

            if (isMounted) {
                setMessages(prev => {
                    const exists = prev.some(m => m.id === newMessage.id);
                    if (exists) return prev;
                    return [...prev, newMessage];
                });
                setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);
            }
        };

        const handleTyping = (data: any) => {
            const fromUserId = data?.fromUserId || data?.userId || (typeof data === 'string' ? data : null);
            if (!fromUserId || fromUserId === currentUserId) return;

            setTypingUser(fromUserId);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                if (isMounted) setTypingUser(null);
            }, 3000) as unknown as NodeJS.Timeout;
        };

        const handleMessageDelivered = ({ messageId, at }: { messageId: string; at: string }) => {
            setMessages(prev => prev.map(msg =>
                msg.id === messageId ? { ...msg, deliveredAt: at || new Date().toISOString() } : msg
            ));
        };

        const handleMessageSeen = ({ messageId, at }: { messageId: string; at: string }) => {
            setMessages(prev => prev.map(msg =>
                msg.id === messageId ? { ...msg, seenAt: at || new Date().toISOString() } : msg
            ));
        };

        const runInit = async () => {
            setLoading(true);
            await connectSocket();
            if (!isMounted) return;

            if (otherUserId) {
                onNewMessage(handleNewMessage);
            } else {
                onEventMessage(handleNewMessage);
            }
            onTyping(handleTyping);
            onMessageDelivered(handleMessageDelivered);
            onMessageSeen(handleMessageSeen);

            try {
                let history: Message[] = [];
                if (otherUserId) {
                    history = await getChatMessages(eventId, otherUserId);
                } else {
                    history = await getEventMessages(eventId);
                }

                if (isMounted) {
                    // Merge history with any messages already received via socket
                    // during the async fetch to avoid losing real-time messages.
                    setMessages(prev => {
                        const ids = new Set(history.map(m => m.id));
                        const socketOnly = prev.filter(m => !ids.has(m.id));
                        return [...history, ...socketOnly];
                    });
                    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
                }
            } catch (e) {
                console.error('useChat: Error fetching history:', e);
            } finally {
                try {
                    await enterEvent(eventId);
                } catch {
                    // enterEvent failure (already entered, event full, etc.) must not
                    // prevent the socket from joining the room.
                }
                joinEvent(eventId, () => {
                    if (isMounted) setIsJoined(true);
                });
                if (isMounted) setLoading(false);
            }
        };

        if (currentUserId && eventId) {
            runInit();
        }

        return () => {
            isMounted = false;
            offSocket('new-message', handleNewMessage);
            offSocket('event-message', handleNewMessage);
            offSocket('typing', handleTyping);
            offSocket('message-delivered', handleMessageDelivered);
            offSocket('message-seen', handleMessageSeen);

            leaveEvent(eventId);
            leaveEventApi(eventId);
            // No llamar disconnectSocket() aquí: el socket es singleton compartido
            // con useConnectedUsers. Se desconecta al hacer logout.
        };
    }, [eventId, otherUserId, currentUserId]);

    const handleSend = () => {
        if (!messageText.trim() || !isJoined) return;

        const content = messageText.trim();
        setMessageText('');

        const optimisticMsg: Message = {
            id: Math.random().toString(),
            fromUserId: currentUserId,
            content,
            createdAt: new Date().toISOString(),
        };

        setMessages(prev => [...prev, optimisticMsg]);
        setTimeout(scrollToBottom, 50);

        if (otherUserId) {
            sendMessage({ eventId, toUserId: otherUserId, content });
        } else {
            sendEventMessage({ eventId, content });
        }
    };

    return {
        messages,
        loading,
        isJoined,
        messageText,
        setMessageText: handleTypingInput,
        handleSend,
        flatListRef,
        scrollToBottom,
        typingUser,
        markAllAsSeen,
    };
};
