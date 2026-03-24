import { useRole } from '@/context/RoleContext';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';

export function useProtectedRoute() {
    const { user, isLoading } = useAuth();
    const { currentRole, isLoading: roleLoading } = useRole();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (isLoading || roleLoading) return;

        const inAuthGroup = segments[0] === '(auth)';
        const inTabsGroup = segments[0] === '(tabs)';
        const inBusinessGroup = segments[0] === '(business)';

        if (
            // If the user is not signed in and the initial segment is not anything in the auth group.
            !user &&
            !inAuthGroup
        ) {
            // Redirect to the sign-in page.
            router.replace('/(auth)');
        } else if (user && inAuthGroup) {
            // Redirect away from the sign-in page.
            if (currentRole === 'business' || currentRole === 'dj') {
                router.replace('/(business)');
            } else {
                router.replace('/(tabs)');
            }
        } else if (user) {
            // Role enforcement
            if (inTabsGroup && (currentRole === 'business' || currentRole === 'dj')) {
                router.replace('/(business)');
            } else if (inBusinessGroup && currentRole === 'user') {
                router.replace('/(tabs)');
            }
        }
    }, [user, segments, isLoading, roleLoading, currentRole]);
}
