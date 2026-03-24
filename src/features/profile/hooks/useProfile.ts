import { useAuth } from '@/features/auth/context/AuthContext';
import { getPublicProfile, updateProfile } from '@/features/profile/services/profile.service';
import { useCallback, useEffect, useState } from 'react';

export type ProfileField = 'firstName' | 'lastName' | 'phone' | 'city' | 'state' | 'country' | 'nationality';

export interface ProfileData {
    firstName: string;
    lastName: string;
    phone: string;
    city: string;
    state: string;
    country: string;
    nationality: string;
    avatarUrl?: string;
}

const EMPTY_PROFILE: ProfileData = {
    firstName: '',
    lastName: '',
    phone: '',
    city: '',
    state: '',
    country: '',
    nationality: '',
};

export function useProfile() {
    const { user, updateUser } = useAuth();

    const [profile, setProfile] = useState<ProfileData>(EMPTY_PROFILE);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const fetchProfile = useCallback(async () => {
        if (!user?.sub) return;
        setIsLoading(true);
        try {
            const data = await getPublicProfile(user.sub);
            setProfile({
                firstName: data.firstName ?? '',
                lastName: data.lastName ?? '',
                phone: data.phone ?? '',
                city: data.city ?? '',
                state: data.state ?? '',
                country: data.country ?? '',
                nationality: data.nationality ?? '',
                avatarUrl: data.avatarUrl,
            });
        } catch {
            // profile fetch is non-critical — silently ignore
        } finally {
            setIsLoading(false);
        }
    }, [user?.sub]);

    useEffect(() => { fetchProfile(); }, [fetchProfile]);

    /**
     * Patches a single field via PATCH /users/profile and syncs the result
     * back into the global AuthContext so all screens reflect the change.
     */
    const updateField = useCallback(async (field: ProfileField, value: string) => {
        setIsSaving(true);
        try {
            const updated = await updateProfile({ [field]: value.trim() });
            setProfile(prev => ({ ...prev, [field]: value.trim() }));
            if (user && updated) {
                updateUser({ ...user, ...updated });
            }
        } finally {
            setIsSaving(false);
        }
    }, [user, updateUser]);

    const setAvatarUrl = useCallback((url: string) => {
        setProfile(prev => ({ ...prev, avatarUrl: url }));
    }, []);

    return { profile, isLoading, isSaving, updateField, setAvatarUrl, refetch: fetchProfile };
}
