import { io, Socket } from 'socket.io-client';
import { getToken } from '../../auth/services/auth.service';

const SOCKET_URL = 'http://44.222.141.70:3000';

let socket: Socket | null = null;

export const connectSocket = async () => {
    if (socket?.connected) return;

    const token = await getToken();

    if (!token) {
        // console.error('SocketService: No token found for connection');
        return;
    }

    socket = io(SOCKET_URL, {
        transports: ['websocket'],
        auth: {
            token: token
        },
        autoConnect: true
    });

    socket.on('connect', () => {
        // console.log('Socket connected:', socket?.id);
    });

    socket.on('disconnect', () => {
        console.log('Socket disconnected');
    });

    socket.on('connect_error', (err) => {
        console.warn('Socket connection error:', err);
    });
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

// PASO 5: Unirse al evento
export const joinEvent = (eventId: string) => {
    const emitJoin = () => {
        socket?.emit('join-event', { eventId });
    };

    if (socket?.connected) {
        emitJoin();
    } else {
        socket?.once('connect', emitJoin);
    }
};

// Listener for joined confirmation
export const onJoinedEvent = (callback: () => void) => {
    socket?.on('joined-event', callback);
};

// PASO 6: Enviar mensaje
export const sendMessage = (payload: { eventId: string; toUserId: string; content: string }) => {
    // console.log('SocketService: Emitting send-message', payload);
    socket?.emit('send-message', payload);
};

// PASO 6.5: Enviar mensaje grupal (evento)
export const sendEventMessage = (payload: { eventId: string; content: string }) => {
    // console.log('SocketService: Emitting send-event-message', payload);
    socket?.emit('send-event-message', payload);
};

// PASO 7: Recibir mensajes
export const onNewMessage = (callback: (message: any) => void) => {
    // console.log('SocketService: Registering new-message listener');
    socket?.on('new-message', callback);
};

export const onEventMessage = (callback: (message: any) => void) => {
    // console.log('SocketService: Registering event-message listener');
    socket?.on('event-message', callback);
};

// PASO 9: Salir del evento
export const leaveEvent = (eventId: string) => {
    socket?.emit('leave-event', { eventId });
};

export const onUserJoined = (callback: (user: any) => void) => {
    socket?.on('user-joined', callback);
};

export const onUserLeft = (callback: (data: { userId: string } | string) => void) => {
    socket?.on('user-left', callback);
};

// --- SIGNALING EVENTS ---

// TYPING
// TYPING
export const sendTyping = (eventId: string, toUserId?: string) => {
    // Backend Doc Example: socket.emit('typing', { eventId: '...', toUserId: '...' });
    // Note: If toUserId is missing (Group Chat), we still emit { eventId }.
    const payload = toUserId ? { eventId, toUserId } : { eventId };
    // console.log('SocketService: Emitting typing', payload);
    socket?.emit('typing', payload);
};

export const onTyping = (callback: (data: { fromUserId: string }) => void) => {
    // Backend Doc Example: socket.on('typing', ({ fromUserId }) => { ... });
    socket?.on('typing', callback);
};

// MESSAGE DELIVERED
export const sendMessageDelivered = (messageId: string) => {
    socket?.emit('message-delivered', { messageId });
};

export const onMessageDelivered = (callback: (data: { messageId: string, userId: string, at: string }) => void) => {
    socket?.on('message-delivered', callback); // Check if backend returns userId and timestamp
};

// MESSAGE SEEN
export const sendMessageSeen = (messageId: string) => {
    socket?.emit('message-seen', { messageId });
};

export const onMessageSeen = (callback: (data: { messageId: string, userId: string, at: string }) => void) => {
    socket?.on('message-seen', callback);
};

// PRESENCE
export const getOnlineUsers = (eventId: string) => {
    socket?.emit('presence:who', { eventId });
};

export const onOnlineUsersList = (callback: (users: any[]) => void) => {

    socket?.on('presence:list', callback);
    // socket?.on('presence:who', callback); // Possible echo/response
};

export const onPresenceUpdate = (callback: (data: { type: 'join' | 'leave'; user?: any; userId?: string }) => void) => {
    socket?.on('presence:update', callback);
};

// Cleanup listeners
// Cleanup listeners
export const offSocket = (event: string, callback?: any) => {
    if (callback) {
        socket?.off(event, callback);
    } else {
        socket?.off(event);
    }
};
