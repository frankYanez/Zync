import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useConnectedUsers } from '../hooks/useConnectedUsers';

export const ConnectedUsersScreen = () => {
    const router = useRouter();
    // const { eventId } = useLocalSearchParams<{ eventId: string }>();

    const eventId = '68164919-88df-4a63-b9b3-6d4fc793a8c2';

    const { users } = useConnectedUsers(eventId);

    const handleUserPress = (userId: string) => {
        router.push({ pathname: '/chat/[id]', params: { id: userId, eventId } });
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.userRow} onPress={() => handleUserPress(item.id)}>
            <Image source={{ uri: item.avatar || 'https://i.pravatar.cc/150' }} style={styles.avatar} />
            <Text style={styles.userName}>{item.name || item.id}</Text>
            <View style={styles.statusIndicator}>
                <View style={[styles.dot, { backgroundColor: '#4CAF50' }]} />
                <Text style={styles.statusText}>En línea</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Personas Conectadas</Text>
            </View>

            <FlatList
                data={users}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#222',
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    listContent: {
        padding: 16,
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#1a1a1a',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 16,
    },
    userName: {
        flex: 1,
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
    statusIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 4,
    },
    statusText: {
        color: '#666',
        fontSize: 12,
    },
});
