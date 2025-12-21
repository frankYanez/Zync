import { ZyncTheme } from '@/shared/constants/theme';
import { Stack } from 'expo-router';

export default function AuthLayout() {
    return (
        <Stack screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: ZyncTheme.colors.background },
        }}>
            <Stack.Screen name="index" />
        </Stack>
    );
}
