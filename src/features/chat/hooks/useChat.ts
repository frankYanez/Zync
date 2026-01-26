import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList } from 'react-native';
import { Message } from '../domain/chat.types';
import { enterEvent, getChatMessages, getEventMessages, leaveEventApi, sendPrivateMessage } from '../services/chat.service';
import {
    connectSocket,
    disconnectSocket,
    joinEvent,
    leaveEvent,
    offSocket,
    onEventMessage,
    onJoinedEvent,
    onMessageDelivered,
    onMessageSeen,
    onNewMessage,
    onTyping,
    sendEventMessage,
    sendMessageDelivered,
    sendMessageSeen,
    sendTyping
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
        if (flatListRef.current && messages.length > 0) {
            flatListRef.current.scrollToEnd({ animated: true });
        }
    };

    // --- Typing Logic ---
    const handleTypingInput = (text: string) => {
        setMessageText(text);
        if (!text) return;

        const now = Date.now();
        if (now - lastTypingSentRef.current <= 2000) return;
        lastTypingSentRef.current = now;

        sendTyping(eventId, otherUserId); // si otherUserId viene, 1-1; si no, grupo
    };


    // --- Status Updates ---
    const markAsSeen = useCallback((messageId: string) => {
        sendMessageSeen(messageId);
        // Optimistic update?
        setMessages(prev => prev.map(msg =>
            msg.id === messageId ? { ...msg, seenAt: new Date().toISOString() } : msg
        ));
    }, []);

    const markAllAsSeen = useCallback(() => {
        // Find messages from others that are not seen
        messages.forEach(msg => {
            if (msg.fromUserId !== currentUserId && !msg.seenAt) {
                markAsSeen(msg.id);
            }
        });
    }, [messages, markAsSeen, currentUserId]);


    useEffect(() => {
        let isMounted = true;

        // Named callbacks for specific cleanup
        const handleJoinedEvent = () => {
            if (isMounted) setIsJoined(true);
        };

        const handleNewMessage = (newMessage: Message & { self?: boolean }) => {
            console.log('useChat: NEW MESSAGE RECEIVED', newMessage);
            const isMyMessage = newMessage.fromUserId === currentUserId;
            // Ignore own messages from socket to prevent duplication (handled optimistically + via HTTP)
            if (isMyMessage) return;

            if (!isMyMessage) {
                sendMessageDelivered(newMessage.id!);
            }

            if (isMounted) {
                setMessages(prev => {
                    const exists = prev.some(m => m.id === newMessage.id);
                    if (exists) return prev;
                    return [...prev, newMessage];
                });
                setTimeout(scrollToBottom, 50);
            }
        };

        const handleTyping = ({ fromUserId }: { fromUserId: string }) => {
            if (fromUserId === currentUserId) return;
            setTypingUser(fromUserId);

            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                if (isMounted) setTypingUser(null);
            }, 3000) as unknown as NodeJS.Timeout;
        };

        const handleMessageDelivered = ({ messageId, at }: { messageId: string, at: string }) => {
            setMessages(prev => prev.map(msg =>
                msg.id === messageId ? { ...msg, deliveredAt: at || new Date().toISOString() } : msg
            ));
        };

        const handleMessageSeen = ({ messageId, at }: { messageId: string, at: string }) => {
            setMessages(prev => prev.map(msg =>
                msg.id === messageId ? { ...msg, seenAt: at || new Date().toISOString() } : msg
            ));
        };

        const runInit = async () => {
            setLoading(true);
            await connectSocket();
            if (!isMounted) return;

            console.log('useChat: Socket connected, registered listeners');
            onJoinedEvent(handleJoinedEvent);
            if (otherUserId) {
                console.log('useChat: Listening for private messages');
                onNewMessage(handleNewMessage);
            } else {
                console.log('useChat: Listening for event messages');
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
                    setMessages(history);
                    setTimeout(scrollToBottom, 100);
                }
            } catch (e) {
                console.error('useChat: Error fetching history:', e);
            } finally {
                console.log('useChat: Entering event API', eventId);
                await enterEvent(eventId);

                console.log('useChat: Joining event socket', eventId);
                joinEvent(eventId);
                if (isMounted) setLoading(false);
            }
        };

        if (currentUserId) {
            runInit();
        }

        return () => {
            isMounted = false;
            // Clean up listeners with specific callbacks
            offSocket('joined-event', handleJoinedEvent);
            offSocket('new-message', handleNewMessage);
            offSocket('event-message', handleNewMessage);
            offSocket('typing', handleTyping);
            offSocket('message-delivered', handleMessageDelivered);
            offSocket('message-seen', handleMessageSeen);

            leaveEvent(eventId); // Socket leave
            leaveEventApi(eventId); // API leave
            disconnectSocket();
        };
    }, [eventId, otherUserId, currentUserId]);

    const handleSend = () => {
        console.log('Attempting to send message. isJoined:', isJoined, 'text:', messageText);
        if (!messageText.trim() || !isJoined) {
            console.log('Send aborted. Empty text or not joined.');
            return;
        }

        const content = messageText.trim();
        setMessageText('');

        // Optimistic UI Update
        const tempId = Math.random().toString();
        const optimisticMsg: Message = {
            id: tempId,
            fromUserId: currentUserId, // Placeholder
            content: content,
            createdAt: new Date().toISOString(),
        };

        setMessages(prev => [...prev, optimisticMsg]);
        setTimeout(scrollToBottom, 50);

        console.log(otherUserId);


        if (otherUserId) {
            sendPrivateMessage(eventId, otherUserId, content)
                .then((savedMsg) => {
                    // Replace optimistic ID with real one
                    setMessages(prev => prev.map(m => m.id === tempId ? { ...m, ...savedMsg } : m));
                })
                .catch(err => {
                    console.error('Failed to send private message', err);
                    // Optionally remove the optimistic message
                });
        } else {
            sendEventMessage({
                eventId,
                content
            });
        }
    };

    return {
        messages,
        loading,
        isJoined,
        messageText,
        setMessageText: handleTypingInput, // Use wrapper
        handleSend,
        flatListRef,
        scrollToBottom,
        setIsJoined,
        typingUser,
        markAllAsSeen,
        leaveEvent,
        sendTyping,
        lastTypingSentRef,
        onNewMessage,
    };
};
