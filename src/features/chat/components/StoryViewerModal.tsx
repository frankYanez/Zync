import { deleteStory, markStorySeen } from '@/features/stories/services/story.service';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Dimensions,
    GestureResponderEvent,
    Image,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const STORY_WIDTH = SCREEN_WIDTH;
const STORY_HEIGHT = Math.min(SCREEN_WIDTH * (16 / 9), SCREEN_HEIGHT);
const STORY_VERTICAL_OFFSET = (SCREEN_HEIGHT - STORY_HEIGHT) / 2;

const STORY_DURATION_MS = 5000;

interface Story {
    id: string;
    mediaUrl: string;
    userId: string;
    isDjStory?: boolean;
    seenByViewer?: boolean;
    user?: { firstName?: string; lastName?: string; avatar?: string };
    createdAt?: string;
}

interface StoryViewerModalProps {
    stories: Story[];
    initialIndex?: number;
    currentUserId?: string;
    visible: boolean;
    onClose: () => void;
    onStoryDeleted?: (storyId: string) => void;
}

export const StoryViewerModal = ({
    stories,
    initialIndex = 0,
    currentUserId,
    visible,
    onClose,
    onStoryDeleted,
}: StoryViewerModalProps) => {
    const insets = useSafeAreaInsets();
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [paused, setPaused] = useState(false);
    const progressAnims = useRef<Animated.Value[]>([]);
    const elapsed = useRef<number>(0);
    const seenRef = useRef<Set<string>>(new Set());

    const story = stories[currentIndex];

    if (progressAnims.current.length !== stories.length) {
        progressAnims.current = stories.map(() => new Animated.Value(0));
    }

    const goTo = useCallback(
        (index: number) => {
            if (index >= stories.length || index < 0) {
                onClose();
                return;
            }
            for (let i = index; i < stories.length; i++) {
                progressAnims.current[i].setValue(0);
            }
            elapsed.current = 0;
            setCurrentIndex(index);
        },
        [stories.length, onClose]
    );

    // Mark story as seen when first displayed
    useEffect(() => {
        if (!visible || !story) return;
        if (seenRef.current.has(story.id)) return;
        seenRef.current.add(story.id);
        markStorySeen(story.id).catch(() => {});
    }, [currentIndex, visible, story]);

    useEffect(() => {
        if (!visible) return;

        const anim = progressAnims.current[currentIndex];
        if (!anim) return;

        for (let i = 0; i < currentIndex; i++) {
            progressAnims.current[i].setValue(1);
        }
        anim.setValue(0);

        const remaining = STORY_DURATION_MS - elapsed.current;
        Animated.timing(anim, {
            toValue: 1,
            duration: remaining,
            useNativeDriver: false,
        }).start(({ finished }) => {
            if (finished) {
                elapsed.current = 0;
                goTo(currentIndex + 1);
            }
        });

        return () => anim.stopAnimation();
    }, [currentIndex, visible]);

    useEffect(() => {
        if (!visible) return;
        const anim = progressAnims.current[currentIndex];
        if (!anim) return;

        if (paused) {
            anim.stopAnimation(value => {
                elapsed.current = value * STORY_DURATION_MS;
            });
        } else {
            const remaining = STORY_DURATION_MS - elapsed.current;
            Animated.timing(anim, {
                toValue: 1,
                duration: remaining,
                useNativeDriver: false,
            }).start(({ finished }) => {
                if (finished) {
                    elapsed.current = 0;
                    goTo(currentIndex + 1);
                }
            });
        }
    }, [paused]);

    useEffect(() => {
        if (visible) {
            setCurrentIndex(initialIndex);
            elapsed.current = 0;
            setPaused(false);
            seenRef.current.clear();
            progressAnims.current.forEach(a => a.setValue(0));
        } else {
            progressAnims.current.forEach(a => {
                a.stopAnimation();
                a.setValue(0);
            });
        }
    }, [visible, initialIndex]);

    const handleTap = (e: GestureResponderEvent) => {
        const x = e.nativeEvent.locationX;
        elapsed.current = 0;
        if (x < STORY_WIDTH / 2) {
            goTo(currentIndex - 1);
        } else {
            goTo(currentIndex + 1);
        }
    };

    const handleDelete = () => {
        if (!story) return;
        Alert.alert(
            'Eliminar historia',
            '¿Seguro que querés eliminar esta historia?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteStory(story.id);
                            onStoryDeleted?.(story.id);
                            if (stories.length <= 1) {
                                onClose();
                            } else {
                                goTo(currentIndex < stories.length - 1 ? currentIndex : currentIndex - 1);
                            }
                        } catch {
                            Alert.alert('Error', 'No se pudo eliminar la historia.');
                        }
                    },
                },
            ],
        );
    };

    if (!story) return null;

    const isOwner = story.userId === currentUserId;

    const userName =
        isOwner
            ? 'Tú'
            : story.user?.firstName
            ? `${story.user.firstName}${story.user.lastName ? ' ' + story.user.lastName : ''}`
            : 'User';

    const timeAgo = story.createdAt
        ? (() => {
              const diff = Date.now() - new Date(story.createdAt).getTime();
              const h = Math.floor(diff / 3600000);
              const m = Math.floor(diff / 60000);
              if (h >= 1) return `${h}h ago`;
              if (m >= 1) return `${m}m ago`;
              return 'just now';
          })()
        : '';

    const overlayTop = Math.max(insets.top - STORY_VERTICAL_OFFSET, 8);

    return (
        <Modal
            visible={visible}
            transparent={false}
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <View style={styles.screen}>
                <View style={styles.storyCard}>
                    <Image
                        source={{ uri: story.mediaUrl }}
                        style={StyleSheet.absoluteFillObject}
                        resizeMode="cover"
                    />

                    <View style={styles.topFade} />
                    <View style={styles.bottomFade} />

                    <Pressable
                        style={StyleSheet.absoluteFillObject}
                        onPress={handleTap}
                        onLongPress={() => setPaused(true)}
                        onPressOut={() => { if (paused) setPaused(false); }}
                        delayLongPress={150}
                    />

                    {/* Progress bars */}
                    <View style={[styles.progressRow, { top: overlayTop }]}>
                        {stories.map((_, i) => (
                            <View key={i} style={styles.progressTrack}>
                                <Animated.View
                                    style={[
                                        styles.progressFill,
                                        {
                                            width: progressAnims.current[i]
                                                ? progressAnims.current[i].interpolate({
                                                      inputRange: [0, 1],
                                                      outputRange: ['0%', '100%'],
                                                  })
                                                : '0%',
                                        },
                                    ]}
                                />
                            </View>
                        ))}
                    </View>

                    {/* Header */}
                    <View style={[styles.header, { top: overlayTop + 14 }]}>
                        <View style={styles.userInfo}>
                            <View style={styles.avatarRing}>
                                {story.user?.avatar ? (
                                    <Image source={{ uri: story.user.avatar }} style={styles.avatar} />
                                ) : (
                                    <View style={[styles.avatar, styles.avatarFallback]}>
                                        <Text style={styles.avatarInitial}>
                                            {userName.charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                )}
                            </View>
                            <View>
                                <Text style={styles.userName}>{userName}</Text>
                                {timeAgo ? <Text style={styles.timeAgo}>{timeAgo}</Text> : null}
                            </View>
                        </View>

                        <View style={styles.actions}>
                            {isOwner && (
                                <TouchableOpacity
                                    onPress={handleDelete}
                                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                                    style={styles.actionBtn}
                                >
                                    <Ionicons name="trash-outline" size={20} color="rgba(255,80,80,0.9)" />
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity
                                onPress={onClose}
                                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                                style={styles.closeBtn}
                            >
                                <Ionicons name="close" size={26} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {paused && (
                        <MotiView
                            from={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={styles.pauseIndicator}
                        >
                            <Ionicons name="pause" size={44} color="rgba(255,255,255,0.85)" />
                        </MotiView>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    storyCard: {
        width: STORY_WIDTH,
        height: STORY_HEIGHT,
        backgroundColor: '#111',
        overflow: 'hidden',
        borderRadius: STORY_VERTICAL_OFFSET > 0 ? 16 : 0,
    },
    topFade: {
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 160,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    bottomFade: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: 80,
        backgroundColor: 'rgba(0,0,0,0.35)',
    },
    progressRow: {
        position: 'absolute',
        left: 10, right: 10,
        flexDirection: 'row',
        gap: 4,
        zIndex: 10,
    },
    progressTrack: {
        flex: 1, height: 2.5,
        backgroundColor: 'rgba(255,255,255,0.35)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#fff',
        borderRadius: 2,
    },
    header: {
        position: 'absolute',
        left: 14, right: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10,
    },
    userInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    actionBtn: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
        padding: 4,
    },
    closeBtn: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
        padding: 4,
    },
    avatarRing: {
        width: 40, height: 40, borderRadius: 20,
        borderWidth: 2, borderColor: '#CCFF00',
        padding: 2,
        justifyContent: 'center', alignItems: 'center',
    },
    avatar: { width: 32, height: 32, borderRadius: 16 },
    avatarFallback: { backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' },
    avatarInitial: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
    userName: { color: '#fff', fontWeight: '700', fontSize: 14 },
    timeAgo: { color: 'rgba(255,255,255,0.55)', fontSize: 11, marginTop: 1 },
    pauseIndicator: {
        position: 'absolute',
        top: '50%', left: '50%',
        transform: [{ translateX: -22 }, { translateY: -22 }],
        zIndex: 20,
    },
});
