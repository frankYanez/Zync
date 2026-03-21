import { VideoBackground } from '@/components/VideoBackground';
import { Stack } from 'expo-router';

export default function AuthLayout() {
    return (
        <VideoBackground>
            <Stack screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: 'transparent' },
                animation: 'fade',
            }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="register" />
            </Stack>
        </VideoBackground>
    );
}
