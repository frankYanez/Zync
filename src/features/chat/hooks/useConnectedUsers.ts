import { useEffect, useRef, useState } from 'react';
import { connectSocket, getOnlineUsers, joinEvent, offSocket, onJoinedEvent, onOnlineUsersList, onPresenceUpdate } from '../services/socket.service';

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

        const handleJoinedEvent = () => {
            if (!isMounted) return;
            hasJoinedRef.current = true;
            // console.log('Successfully joined event via useConnectedUsers');
            // Now it's safe to ask who is online
            getOnlineUsers(eventId);
        };

        const init = async () => {
            setLoading(true);
            await connectSocket();
            if (!isMounted) return;

            // Register Listeners with specific callbacks
            onOnlineUsersList(handleOnlineUsers);
            onPresenceUpdate(handlePresenceUpdate);
            onJoinedEvent(handleJoinedEvent);

            // Join the event
            // console.log('useConnectedUsers: Joining event:', eventId);
            joinEvent(eventId);

            // Backup mechanism: in case we are already joined or event doesn't fire 'joined-event' for re-joins

        };

        init();

        return () => {
            isMounted = false;
            // Cleanup specific listeners
            offSocket('presence:update', handlePresenceUpdate);
            offSocket('presence:list', handleOnlineUsers);
            offSocket('joined-event', handleJoinedEvent);
        };
    }, [eventId]);

    return { users, loading };
};
