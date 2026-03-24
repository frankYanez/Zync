import { ResizeMode, Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';

const DEFAULT_VIDEO_URI = 'https://www.pexels.com/es-es/download/video/854128/';

interface VideoBackgroundProps {
    videoUri?: string | null;
    /** Gradient applied on top of the video. Defaults to the Zync dark fade. */
    gradientColors?: readonly [string, string, ...string[]];
    children: React.ReactNode;
}

/**
 * Renders a full-screen looping muted video behind its children,
 * with a dark gradient overlay for readability.
 * Falls back to the default Zync background video when `videoUri` is falsy.
 */
export function VideoBackground({
    videoUri,
    gradientColors = ['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)', '#000'],
    children,
}: VideoBackgroundProps) {
    const source = videoUri ?? DEFAULT_VIDEO_URI;
    return (
        <View style={styles.container}>
            {source ? (
                <>
                    <Video
                        source={{ uri: source }}
                        style={StyleSheet.absoluteFill}
                        resizeMode={ResizeMode.COVER}
                        shouldPlay
                        isLooping
                        isMuted
                    />
                    <LinearGradient
                        colors={gradientColors}
                        style={StyleSheet.absoluteFill}
                    />
                </>
            ) : null}
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
