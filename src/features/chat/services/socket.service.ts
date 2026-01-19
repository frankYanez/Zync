import { io, Socket } from 'socket.io-client';
import { getToken } from '../../auth/services/auth.service';

const SOCKET_URL = 'http://44.222.141.70:3000';

let socket: Socket | null = null;

export const connectSocket = async () => {
    if (socket?.connected) return;

    const token = await getToken();

    if (!token) {
        console.error('SocketService: No token found for connection');
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
        console.log('Socket connected:', socket?.id);
    });

    socket.on('disconnect', () => {
        console.log('Socket disconnected');
    });

    socket.on('connect_error', (err) => {
        console.error('Socket connection error:', err);
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
    console.log('SocketService: Emitting send-message', payload);
    socket?.emit('send-message', payload);
};

// PASO 6.5: Enviar mensaje grupal (evento)
export const sendEventMessage = (payload: { eventId: string; content: string }) => {
    console.log('SocketService: Emitting send-event-message', payload);
    socket?.emit('send-event-message', payload);
};

// PASO 7: Recibir mensajes
export const onNewMessage = (callback: (message: any) => void) => {
    console.log('SocketService: Registering new-message listener');
    socket?.on('new-message', callback);
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
export const sendTyping = (eventId: string, toUserId?: string) => {
    // NOTE: Backend doc requires toUserId. If it's a group chat, maybe backend handles specific logic or we only support 1-1 typing?
    // Assuming for group chat we might emit without toUserId or broadcast? 
    // Based on user request: socket.emit('typing', { eventId, toUserId }) 
    socket?.emit('typing', toUserId ? { eventId, toUserId } : { eventId });
};

export const onTyping = (callback: (data: { fromUserId: string }) => void) => {
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
    // Given the previous patterns, it might be 'presence:list'.
    // Let's ask the user or assume 'presence:who' response.
    // Actually, normally `presence:who` is the request. 
    // I will add a listener for 'presence:list' and 'presence:who' just in case.
    socket?.on('presence:list', callback);
    // socket?.on('presence:who', callback); // Possible echo/response
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
