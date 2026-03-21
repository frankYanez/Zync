import { io, Socket } from 'socket.io-client';
import { getToken } from '../../auth/services/auth.service';

const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL;

let socket: Socket | null = null;

export const connectSocket = async () => {
    if (socket?.connected) return;

    // Socket exists but disconnected — reconnect the same instance to avoid
    // creating a duplicate where listeners live on the old socket.
    if (socket) {
        socket.connect();
        return;
    }

    const token = await getToken();
    if (!token) {
        console.warn('SocketService: No token, cannot connect');
        return;
    }

    // API expects the token as a query param: ws://host:3000?token=<jwt>
    socket = io(SOCKET_URL, {
        transports: ['websocket'],
        query: { token },
        autoConnect: true,
    });

    socket.on('connect', () => {
        console.log('Socket connected:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
    });

    socket.on('connect_error', (err) => {
        console.warn('Socket connection error:', err.message);
    });
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

// Join event room. Calls onJoined once the emit actually goes out
// (either immediately if connected, or after the connect fires).
export const joinEvent = (eventId: string, onJoined?: () => void) => {
    const emitJoin = () => {
        socket?.emit('event:join', { eventId });
        onJoined?.();
    };

    if (socket?.connected) {
        emitJoin();
    } else {
        socket?.once('connect', emitJoin);
    }
};

export const leaveEvent = (eventId: string) => {
    socket?.emit('event:leave', { eventId });
};

// Group chat
export const sendEventMessage = (payload: { eventId: string; content: string }) => {
    socket?.emit('chat:send_public', payload);
};

export const onEventMessage = (callback: (message: any) => void) => {
    socket?.on('chat:public_message', callback);
};

// Private chat
export const sendMessage = (payload: { eventId: string; toUserId: string; content: string }) => {
    socket?.emit('chat:send_private', payload);
};

export const onNewMessage = (callback: (message: any) => void) => {
    socket?.on('chat:private_message', callback);
};

// Typing
export const sendTyping = (eventId: string, toUserId?: string) => {
    const payload = toUserId ? { eventId, toUserId } : { eventId };
    socket?.emit('chat:typing', payload);
};

export const onTyping = (callback: (data: { fromUserId: string; eventId: string }) => void) => {
    socket?.on('chat:typing_status', callback);
};

// Delivery / seen receipts
export const sendMessageDelivered = (messageId: string) => {
    socket?.emit('chat:mark_delivered', { messageId });
};

export const sendMessageSeen = (messageId: string) => {
    socket?.emit('chat:mark_seen', { messageId });
};

export const onMessageDelivered = (callback: (data: { messageId: string; userId: string; at: string }) => void) => {
    socket?.on('message-delivered', callback);
};

export const onMessageSeen = (callback: (data: { messageId: string; userId: string; at: string }) => void) => {
    socket?.on('message-seen', callback);
};

// Presence
export const getOnlineUsers = (eventId: string) => {
    socket?.emit('presence:get_list', { eventId });
};

export const onOnlineUsersList = (callback: (users: any[]) => void) => {
    socket?.on('presence:list', callback);
};

export const onPresenceUpdate = (callback: (data: { userId: string; online: boolean; user?: any }) => void) => {
    socket?.on('presence:joined', (data) => callback({ ...data, online: true }));
    socket?.on('presence:left', (data) => callback({ ...data, online: false }));
};

// Cleanup a specific listener
export const offSocket = (event: string, callback?: any) => {
    // Map logical event names to the real server event names
    const eventMap: Record<string, string> = {
        'event-message':      'chat:public_message',
        'new-message':        'chat:private_message',
        'typing':             'chat:typing_status',
        'joined-event':       'joined-event', // not used anymore but kept for safety
    };
    const realEvent = eventMap[event] ?? event;

    if (callback) {
        socket?.off(realEvent, callback);
    } else {
        socket?.off(realEvent);
    }
};
