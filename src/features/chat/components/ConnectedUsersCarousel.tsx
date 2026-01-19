import { ZyncTheme } from '@/shared/constants/theme';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useConnectedUsers } from '../hooks/useConnectedUsers';

interface ConnectedUsersCarouselProps {
    eventId: string;
}

export const ConnectedUsersCarousel = ({ eventId }: ConnectedUsersCarouselProps) => {
    const router = useRouter();
    const { users } = useConnectedUsers(eventId);

    const handleUserPress = (userId: string) => {
        // Navigate to 1-on-1 chat
        router.push({ pathname: '/chat/[id]', params: { id: userId, eventId } });
    };

    const handleViewAll = () => {
        router.push({ pathname: '/chat/connected-users', params: { eventId } });
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.userItem} onPress={() => handleUserPress(item.id)}>
            <Image source={{ uri: item.avatar || 'https://i.pravatar.cc/150' }} style={styles.avatar} />
            <Text style={styles.userName} numberOfLines={1}>{item.name || item.id}</Text>
        </TouchableOpacity>
    );

    if (users.length === 0) return null;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Conectados ({users.length})</Text>
                <TouchableOpacity onPress={handleViewAll}>
                    <Text style={styles.viewAll}>Ver todos</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={users}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 10,
        backgroundColor: '#000000ff', // Dark theme background
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        zIndex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 10,
    },
    title: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    viewAll: {
        color: ZyncTheme.colors.primary, // Gold color from theme context
        fontSize: 12,
    },
    listContent: {
        paddingHorizontal: 12,
    },
    userItem: {
        alignItems: 'center',
        marginHorizontal: 8,
        width: 60,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#333',
        marginBottom: 4,
        borderWidth: 2,
        borderColor: '#CB9936', // Active status border
    },
    userName: {
        color: '#ccc',
        fontSize: 10,
        textAlign: 'center',
    },
});
