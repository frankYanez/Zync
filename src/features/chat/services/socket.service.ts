import { io, Socket } from 'socket.io-client';
import { getToken } from '../../auth/services/auth.service';

const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL;

let socket: Socket | null = null;

// Tracks every room the app has joined so they can be re-joined automatically
// after a disconnect/reconnect (server drops room membership on disconnect).
const activeRooms = new Set<string>();

export const connectSocket = async () => {
    if (socket?.connected) return;

    const token = await getToken();
    if (!token) {
        console.warn('SocketService: No token, cannot connect');
        return;
    }

    // Socket exists but disconnected — update the token (may have refreshed)
    // and reconnect the same instance to avoid duplicating listeners.
    if (socket) {
        (socket.io.opts as any).query = { token };
        socket.connect();
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
        // Re-join every active room after a reconnect. The server drops all
        // room memberships when a client disconnects, so we must re-emit
        // event:join for each room the app is currently in.
        activeRooms.forEach(eventId => {
            socket?.emit('event:join', { eventId });
        });
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
        activeRooms.clear();
    }
};

// Join event room. Registers the room for automatic re-join on reconnect.
// Calls onJoined once the emit actually goes out.
export const joinEvent = (eventId: string, onJoined?: () => void) => {
    activeRooms.add(eventId);

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
    activeRooms.delete(eventId);
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

export const onPresenceUpdate = (callback: (data: { userId: string; online: boolean; user?: any }) => void): (() => void) => {
    const onJoined = (data: any) => callback({ ...data, online: true });
    const onLeft = (data: any) => callback({ ...data, online: false });
    socket?.on('presence:joined', onJoined);
    socket?.on('presence:left', onLeft);
    return () => {
        socket?.off('presence:joined', onJoined);
        socket?.off('presence:left', onLeft);
    };
};

// Order events
// Received by Business (venue owner) when a new order is placed
export const onOrderNew = (callback: (order: any) => void) => {
    socket?.on('order:new', callback);
};

// Received by the User who placed the order when its status changes
export const onOrderStatusUpdate = (callback: (data: { orderId: string; status: string }) => void) => {
    socket?.on('order:status_update', callback);
};

// Received by the User who requested a song when the DJ updates its status
export const onSongRequestUpdated = (callback: (songRequest: any) => void) => {
    socket?.on('song_request:updated', callback);
};

// Cleanup a specific listener
export const offSocket = (event: string, callback?: any) => {
    // Map logical event names to the real server event names
    const eventMap: Record<string, string> = {
        'event-message':      'chat:public_message',
        'new-message':        'chat:private_message',
        'typing':             'chat:typing_status',
        'joined-event':       'joined-event', // not used anymore but kept for safety
        'message-delivered':  'message-delivered',
        'message-seen':       'message-seen',
    };
    const realEvent = eventMap[event] ?? event;

    if (callback) {
        socket?.off(realEvent, callback);
    } else {
        socket?.off(realEvent);
    }
};
