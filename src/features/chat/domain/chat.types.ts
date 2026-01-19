export interface User {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
}

export interface Message {
    id: string;
    chatId?: string; // Optional in response?
    fromUserId: string;
    content: string;
    createdAt: string;
    sender?: User; // Optional, depends on backend response
    deliveredAt?: string;
    seenAt?: string;
}

export interface ChatRoom {
    id: string;
    participants: User[];
    lastMessage?: Message;
    createdAt: string;
    updatedAt: string;
}

export interface CreateMessageDto {
    chatId: string;
    content: string;
}

export interface TypingPayload {
    eventId: string;
    toUserId?: string; // Optional for group chat typing? Or strict 1-1? Backend doc says toUserId is required
    fromUserId?: string; // Received in event
}

export interface MessageStatusPayload {
    messageId: string;
    userId?: string; // Received in event
    at?: string; // Timestamp
}
