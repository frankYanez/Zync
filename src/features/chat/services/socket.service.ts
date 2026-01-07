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
    console.log('SocketService: Emitting join-event for', eventId);
    socket?.emit('join-event', {
        eventId,
    });
};

// Listener for joined confirmation
export const onJoinedEvent = (callback: () => void) => {
    socket?.on('joined-event', () => {
        console.log('Usuario habilitado para chatear');
        if (callback) callback();
    });
};

// PASO 6: Enviar mensaje
export const sendMessage = (payload: { eventId: string; toUserId: string; content: string }) => {
    console.log('SocketService: Emitting send-message', payload);
    socket?.emit('send-message', payload);
};

// PASO 7: Recibir mensajes
export const onNewMessage = (callback: (message: any) => void) => {
    socket?.on('new-message', callback);
};

// PASO 9: Salir del evento
export const leaveEvent = (eventId: string) => {
    socket?.emit('leave-event', { eventId });
};

// Cleanup listeners
export const offSocket = (event: string) => {
    socket?.off(event);
};
