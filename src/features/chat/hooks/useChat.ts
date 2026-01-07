import { useEffect, useRef, useState } from 'react';
import { FlatList } from 'react-native';
import { Message } from '../domain/chat.types';
import { getChatMessages } from '../services/chat.service';
import { connectSocket, disconnectSocket, joinEvent, onJoinedEvent, onNewMessage, sendMessage } from '../services/socket.service';

export const useChat = (eventId: string, otherUserId: string) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [isJoined, setIsJoined] = useState(false);
    const [messageText, setMessageText] = useState('');
    const flatListRef = useRef<FlatList>(null);

    const scrollToBottom = () => {
        if (flatListRef.current && messages.length > 0) {
            flatListRef.current.scrollToEnd({ animated: true });
        }
    };

    useEffect(() => {
        let isMounted = true;

        const initChat = async () => {
            setLoading(true);
            try {
                // 1. Connect and Setup Socket Listeners
                await connectSocket();
                if (!isMounted) return;

                onJoinedEvent(() => {
                    if (isMounted) setIsJoined(true);
                });

                onNewMessage((newMessage: Message & { self?: boolean }) => {
                    if (newMessage.self) return; // Logic for echo
                    if (isMounted) {
                        setMessages(prev => [...prev, newMessage]);
                        setTimeout(scrollToBottom, 100);
                    }
                });

                // 2. Load History
                const history = await getChatMessages(eventId, otherUserId);
                if (isMounted) {
                    setMessages(history);
                    setTimeout(scrollToBottom, 100);
                }

                // 3. Join Event (Realtime)
                joinEvent(eventId);

            } catch (error) {
                console.error("Chat Init Error:", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        initChat();

        return () => {
            isMounted = false;
            disconnectSocket();
        };
    }, [eventId, otherUserId]);

    const handleSend = () => {
        if (!messageText.trim() || !isJoined) return;

        const content = messageText.trim();
        setMessageText('');

        // Optimistic UI Update
        const tempId = Math.random().toString();
        const optimisticMsg: Message = {
            id: tempId,
            fromUserId: 'ME', // Placeholder, logic checks !== otherUserId
            content: content,
            createdAt: new Date().toISOString(),
        };
        setMessages(prev => [...prev, optimisticMsg]);
        setTimeout(scrollToBottom, 50);

        sendMessage({
            eventId,
            toUserId: otherUserId,
            content
        });
    };

    return {
        messages,
        loading,
        isJoined,
        messageText,
        setMessageText,
        handleSend,
        flatListRef,
        scrollToBottom,
        setIsJoined
    };
};
