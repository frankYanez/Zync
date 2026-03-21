import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../auth/context/AuthContext';
import { createStory, getEventStories } from '../../stories/services/story.service';

interface EventStoriesCarouselProps {
    eventId: string;
}

export const EventStoriesCarousel = ({ eventId }: EventStoriesCarouselProps) => {
    const { user } = useAuth();
    const [stories, setStories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const loadStories = async () => {
        try {
            const data = await getEventStories(eventId);
            // Si la API devuelve un array, o un objeto con { stories: [] }
            const storiesArray = Array.isArray(data) ? data : data.stories || data.data || [];
            setStories(storiesArray);
        } catch (error) {
            console.error('Error loading stories:', error);
        }
    };

    useEffect(() => {
        loadStories();
    }, [eventId]);

    const handleAddStory = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [9, 16],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0].uri) {
            setIsLoading(true);
            try {
                const formData = new FormData() as any;
                formData.append('eventId', eventId);
                formData.append('file', {
                    uri: result.assets[0].uri,
                    type: 'image/jpeg',
                    name: 'story.jpg',
                });

                await createStory(formData);
                await loadStories();
            } catch (error) {
                console.error('Error uploading story:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const renderStory = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.storyContainer} activeOpacity={0.8}>
            <View style={styles.storyRing}>
                <Image source={{ uri: item.mediaUrl }} style={styles.storyImage} />
            </View>
            <Text style={styles.storyText} numberOfLines={1}>
                {item.userId === user?.sub ? 'You' : item.user?.firstName || 'User'}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={[{ id: 'add-button', isAdd: true }, ...stories]}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item }) => {
                    if (item.isAdd) {
                        return (
                            <TouchableOpacity style={styles.storyContainer} onPress={handleAddStory} disabled={isLoading}>
                                <View style={[styles.storyRing, styles.addRing]}>
                                    {isLoading ? (
                                        <Text style={{ color: 'white', fontSize: 10 }}>...</Text>
                                    ) : (
                                        <Ionicons name="add" size={24} color="#fff" />
                                    )}
                                </View>
                                <Text style={styles.storyText}>Add Story</Text>
                            </TouchableOpacity>
                        );
                    }
                    return renderStory({ item });
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 100,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    listContainer: {
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    storyContainer: {
        alignItems: 'center',
        marginRight: 16,
        width: 64,
    },
    storyRing: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: '#AACC00', // Zync Primary
        justifyContent: 'center',
        alignItems: 'center',
        padding: 2,
        marginBottom: 4,
    },
    addRing: {
        borderColor: 'rgba(255,255,255,0.3)',
        borderStyle: 'dashed',
        backgroundColor: 'rgba(255,255,255,0.1)',
        padding: 0,
    },
    storyImage: {
        width: '100%',
        height: '100%',
        borderRadius: 26,
    },
    storyText: {
        color: 'white',
        fontSize: 10,
        textAlign: 'center',
    }
});
