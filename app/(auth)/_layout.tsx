import { ResizeMode, Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';

export default function AuthLayout() {
    return (
        <View style={{ flex: 1 }}>
            <View style={StyleSheet.absoluteFill}>
                <Video
                    source={{ uri: 'https://www.pexels.com/es-es/download/video/854128/' }}
                    style={StyleSheet.absoluteFill}
                    resizeMode={ResizeMode.COVER}
                    shouldPlay
                    isLooping
                    isMuted
                />
                <LinearGradient
                    colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)', '#000']}
                    style={StyleSheet.absoluteFill}
                />
            </View>
            <Stack screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: 'transparent' },
                animation: 'fade',
            }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="register" />
            </Stack>
        </View>
    );
}
