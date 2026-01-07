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
