import { useEffect, useRef, useState } from 'react';
import { connectSocket, getOnlineUsers, joinEvent, offSocket, onOnlineUsersList, onPresenceUpdate } from '../services/socket.service';

export interface ConnectedUser {
    id: string;
    name: string;
    avatar?: string;
    isOnline: boolean;
}

export const useConnectedUsers = (eventId: string) => {

    const [users, setUsers] = useState<ConnectedUser[]>([]);
    const [loading, setLoading] = useState(false);
    const hasJoinedRef = useRef(false);

    useEffect(() => {
        let isMounted = true;
        hasJoinedRef.current = false; // Reset on event change

        const handleOnlineUsers = (data: any) => {
            if (!isMounted) return;
            // console.log('Received online users:', data);

            if (Array.isArray(data)) {
                setUsers(data.map(u => ({ ...u, isOnline: true })));
            } else if (data && Array.isArray(data.users)) {
                setUsers(data.users.map((u: any) => ({ ...u, isOnline: true })));
            } else if (data && Array.isArray(data.userIds)) {
                // Handle list of IDs
                setUsers(data.userIds.map((id: string) => ({
                    id,
                    name: 'User', // Placeholder until we can fetch details
                    isOnline: true
                })));
            } else {
                // console.warn('Received online users list in unknown format:', data);
                setUsers([]);
            }
            setLoading(false);
        };

        const handlePresenceUpdate = (data: any) => {
            if (!isMounted) return;
            console.log('Presence update:', data);

            // Handle { online: boolean, userId: string } format from backend logs
            const isOnline = data.online === true || data.type === 'join';
            const userId = data.userId || (data.user ? data.user.id : null);

            if (!userId) {
                // console.warn('Presence update missing userId:', data);
                return;
            }

            if (isOnline) {
                setUsers(prev => {
                    const exists = prev.find(u => u.id === userId);
                    if (exists) return prev.map(u => u.id === userId ? { ...u, isOnline: true } : u);

                    // If we have user details in data.user, use them. Otherwise placeholder.
                    const newUser = data.user || { id: userId, name: 'User', avatar: undefined };
                    return [...prev, { ...newUser, isOnline: true }];
                });
            } else {
                setUsers(prev => prev.filter(u => u.id !== userId));
            }
        };

        const init = async () => {
            setLoading(true);
            await connectSocket();
            if (!isMounted) return;

            onOnlineUsersList(handleOnlineUsers);
            onPresenceUpdate(handlePresenceUpdate);

            // joinEvent callback fires once the emit goes out (connected or deferred)
            joinEvent(eventId, () => {
                if (isMounted) {
                    hasJoinedRef.current = true;
                    getOnlineUsers(eventId);
                }
            });
        };

        init();

        return () => {
            isMounted = false;
            offSocket('presence:update', handlePresenceUpdate);
            offSocket('presence:list', handleOnlineUsers);
        };
    }, [eventId]);

    return { users, loading };
};
