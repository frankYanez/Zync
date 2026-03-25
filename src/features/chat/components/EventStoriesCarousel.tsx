import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../auth/context/AuthContext';
import { createStory, getEventStories } from '../../stories/services/story.service';
import { StoryViewerModal } from './StoryViewerModal';

interface EventStoriesCarouselProps {
    eventId: string;
    canLoad?: boolean;
}

const PICKER_OPTIONS = [
    { key: 'camera', icon: 'camera-outline', label: 'Take photo' },
    { key: 'gallery', icon: 'images-outline', label: 'Choose from gallery' },
] as const;

interface UserStoryGroup {
    userId: string;
    user?: any;
    stories: any[];
    thumbnail: string;
}

export const EventStoriesCarousel = ({ eventId, canLoad = true }: EventStoriesCarouselProps) => {
    const { user } = useAuth();
    const insets = useSafeAreaInsets();
    const [stories, setStories] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [viewerVisible, setViewerVisible] = useState(false);
    const [viewerStories, setViewerStories] = useState<any[]>([]);
    const [pickerVisible, setPickerVisible] = useState(false);

    // Group flat stories array into one entry per user
    const userGroups: UserStoryGroup[] = React.useMemo(() => {
        const map = new Map<string, UserStoryGroup>();
        for (const s of stories) {
            const uid = s.userId;
            if (!map.has(uid)) {
                map.set(uid, { userId: uid, user: s.user, stories: [], thumbnail: s.mediaUrl });
            }
            map.get(uid)!.stories.push(s);
        }
        return Array.from(map.values());
    }, [stories]);

    const loadStories = async () => {
        try {
            const data = await getEventStories(eventId);
            const storiesArray = Array.isArray(data) ? data : data.stories || data.data || [];
            setStories(storiesArray);
        } catch (error) {
            console.error('Error loading stories:', error);
        }
    };

    useEffect(() => {
        if (canLoad && eventId) loadStories();
    }, [eventId, canLoad]);

    const uploadStory = async (uri: string) => {
        setIsLoading(true);
        try {
            const formData = new FormData() as any;
            formData.append('eventId', eventId);
            formData.append('file', {
                uri,
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
    };

    const handlePickerOption = async (key: 'camera' | 'gallery') => {
        setPickerVisible(false);

        // Small delay so the picker modal fully closes before the system picker opens
        await new Promise(r => setTimeout(r, 250));

        let result: ImagePicker.ImagePickerResult;

        if (key === 'camera') {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') return;
            result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [9, 16],
                quality: 0.85,
            });
        } else {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') return;
            result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [9, 16],
                quality: 0.85,
            });
        }

        if (!result.canceled && result.assets[0]?.uri) {
            await uploadStory(result.assets[0].uri);
        }
    };

    const handleOpenGroup = (group: UserStoryGroup) => {
        setViewerStories(group.stories);
        setViewerVisible(true);
    };

    const renderGroup = ({ item }: { item: UserStoryGroup }) => {
        const label = item.userId === user?.sub ? 'You' : item.user?.firstName || 'User';
        return (
            <TouchableOpacity
                style={styles.storyContainer}
                activeOpacity={0.8}
                onPress={() => handleOpenGroup(item)}
            >
                <View style={styles.storyRing}>
                    <Image source={{ uri: item.thumbnail }} style={styles.storyImage} />
                </View>
                <Text style={styles.storyText} numberOfLines={1}>{label}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={userGroups}
                keyExtractor={(item) => item.userId}
                contentContainerStyle={styles.listContainer}
                ListHeaderComponent={
                    <TouchableOpacity
                        style={styles.storyContainer}
                        onPress={() => setPickerVisible(true)}
                        disabled={isLoading}
                    >
                        <View style={[styles.storyRing, styles.addRing]}>
                            {isLoading ? (
                                <Text style={{ color: 'white', fontSize: 10 }}>...</Text>
                            ) : (
                                <Ionicons name="add" size={24} color="#fff" />
                            )}
                        </View>
                        <Text style={styles.storyText}>Add Story</Text>
                    </TouchableOpacity>
                }
                renderItem={renderGroup}
            />

            {/* Source picker bottom sheet */}
            <Modal
                visible={pickerVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setPickerVisible(false)}
            >
                <TouchableOpacity
                    style={styles.pickerBackdrop}
                    activeOpacity={1}
                    onPress={() => setPickerVisible(false)}
                />
                <View style={[styles.pickerSheet, { paddingBottom: insets.bottom + 16 }]}>
                    <View style={styles.pickerHandle} />
                    <Text style={styles.pickerTitle}>Add Story</Text>

                    {PICKER_OPTIONS.map(opt => (
                        <TouchableOpacity
                            key={opt.key}
                            style={styles.pickerRow}
                            activeOpacity={0.7}
                            onPress={() => handlePickerOption(opt.key)}
                        >
                            <View style={styles.pickerIconWrap}>
                                <Ionicons name={opt.icon as any} size={22} color="#CCFF00" />
                            </View>
                            <Text style={styles.pickerLabel}>{opt.label}</Text>
                            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
                        </TouchableOpacity>
                    ))}

                    <TouchableOpacity
                        style={styles.pickerCancel}
                        onPress={() => setPickerVisible(false)}
                    >
                        <Text style={styles.pickerCancelText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            <StoryViewerModal
                stories={viewerStories}
                initialIndex={0}
                currentUserId={user?.sub}
                visible={viewerVisible}
                onClose={() => setViewerVisible(false)}
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
        borderColor: '#CCFF00',
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
    },
    // Picker bottom sheet
    pickerBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    pickerSheet: {
        backgroundColor: '#111',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingTop: 12,
        paddingHorizontal: 20,
        borderTopWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    pickerHandle: {
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignSelf: 'center',
        marginBottom: 16,
    },
    pickerTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 16,
        letterSpacing: 0.4,
    },
    pickerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.06)',
    },
    pickerIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: 'rgba(204,255,0,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    pickerLabel: {
        flex: 1,
        color: 'white',
        fontSize: 15,
        fontWeight: '500',
    },
    pickerCancel: {
        marginTop: 12,
        alignItems: 'center',
        paddingVertical: 14,
    },
    pickerCancelText: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 15,
    },
});
