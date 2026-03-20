import { NeonButton } from '@/components/NeonButton';
import { NeonInput } from '@/components/NeonInput';
import { ScreenLayout } from '@/components/ScreenLayout';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/features/auth/context/AuthContext';
import { DjProfile } from '@/features/dj/domain/dj.types';
import { getMyDjProfile } from '@/features/dj/services/dj.service';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { patchDjProfile, uploadDjBanner, uploadDjLogo } from '../services/profile.service';

export default function EditDjProfileScreen() {
    const router = useRouter();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [profile, setProfile] = useState<DjProfile | null>(null);

    // Form states
    const [artistName, setArtistName] = useState('');
    const [genres, setGenres] = useState('');
    const [pricePerSong, setPricePerSong] = useState('');
    const [soundcloudUrl, setSoundcloudUrl] = useState('');
    const [spotifyUrl, setSpotifyUrl] = useState('');
    const [instagramUrl, setInstagramUrl] = useState('');
    const [bio, setBio] = useState('');
    const [city, setCity] = useState('');
    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [bannerUrl, setBannerUrl] = useState<string | null>(null);

    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            if (user?.sub) {
                try {
                    const data = await getMyDjProfile(user.sub);
                    if (data) {
                        setProfile(data);
                        setArtistName(data.artistName || '');
                        setGenres(data.genres?.join(', ') || '');
                        setPricePerSong(data.pricePerSong?.toString() || '');
                        setSoundcloudUrl(data.soundcloudUrl || '');
                        setSpotifyUrl(data.spotifyUrl || '');
                        setInstagramUrl(data.instagramUrl || '');
                        setBio(data.bio || '');
                        setCity(data.city || '');
                        setLogoUrl(data.logoUrl || null);
                        setBannerUrl(data.bannerUrl || null);
                    }
                } catch (error) {
                    console.error('Error fetching DJ profile:', error);
                    Alert.alert('Error', 'Failed to load DJ profile.');
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchProfile();
    }, [user?.sub]);

    const handleImagePick = async (type: 'logo' | 'banner') => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: type === 'logo' ? [1, 1] : [16, 9],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0].uri) {
            const isLogo = type === 'logo';
            isLogo ? setUploadingLogo(true) : setUploadingBanner(true);

            try {
                const formData = new FormData() as any;
                formData.append('file', {
                    uri: result.assets[0].uri,
                    type: 'image/jpeg',
                    name: `${type}.jpg`,
                });

                if (isLogo) {
                    const response = await uploadDjLogo(formData);
                    setLogoUrl(response.logoUrl);
                } else {
                    const response = await uploadDjBanner(formData);
                    setBannerUrl(response.bannerUrl);
                }
            } catch (error) {
                console.error(`Error uploading ${type}:`, error);
                Alert.alert('Error', `Failed to upload ${type}.`);
            } finally {
                isLogo ? setUploadingLogo(false) : setUploadingBanner(false);
            }
        }
    };

    const handleSave = async () => {
        setSubmitting(true);
        try {
            const genresArray = genres.split(',').map(g => g.trim()).filter(g => g.length > 0);
            const data = {
                artistName,
                genres: genresArray,
                pricePerSong: parseFloat(pricePerSong) || 0,
                soundcloudUrl: soundcloudUrl || null,
                spotifyUrl: spotifyUrl || null,
                instagramUrl: instagramUrl || null,
                bio: bio || null,
                city: city || null,
            };

            await patchDjProfile(data);
            Alert.alert('Success', 'DJ Profile updated', [{ text: 'OK', onPress: () => router.back() }]);
        } catch (error: any) {
            console.error('Error updating DJ profile:', error);
            const msg = error?.response?.data?.message || 'Failed to update profile.';
            Alert.alert('Error', Array.isArray(msg) ? msg.join('\n') : msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <ScreenLayout style={styles.centered}>
                <ActivityIndicator size="large" color={ZyncTheme.colors.primary} />
            </ScreenLayout>
        );
    }

    return (
        <ScreenLayout style={styles.container} noPadding>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={ZyncTheme.colors.text} />
                </TouchableOpacity>
                <ThemedText style={styles.title}>Edit DJ Profile</ThemedText>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    
                    {/* Banner Section */}
                    <TouchableOpacity 
                        style={styles.bannerContainer} 
                        onPress={() => handleImagePick('banner')}
                        disabled={uploadingBanner}
                    >
                        {bannerUrl ? (
                            <Image source={{ uri: bannerUrl }} style={styles.bannerImage} />
                        ) : (
                            <View style={styles.bannerPlaceholder}>
                                <Ionicons name="image-outline" size={40} color={ZyncTheme.colors.textSecondary} />
                                <ThemedText style={styles.placeholderText}>Add Banner</ThemedText>
                            </View>
                        )}
                        <View style={styles.imageOverlay}>
                            {uploadingBanner ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Ionicons name="camera" size={24} color="#fff" />
                            )}
                        </View>
                    </TouchableOpacity>

                    {/* Logo Section */}
                    <View style={styles.logoSection}>
                        <TouchableOpacity 
                            style={styles.logoContainer} 
                            onPress={() => handleImagePick('logo')}
                            disabled={uploadingLogo}
                        >
                            {logoUrl ? (
                                <Image source={{ uri: logoUrl }} style={styles.logoImage} />
                            ) : (
                                <View style={styles.logoPlaceholder}>
                                    <Ionicons name="musical-notes" size={30} color={ZyncTheme.colors.background} />
                                </View>
                            )}
                            <View style={styles.logoOverlay}>
                                {uploadingLogo ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Ionicons name="camera" size={16} color="#000" />
                                )}
                            </View>
                        </TouchableOpacity>
                        <View style={styles.logoInfo}>
                            <ThemedText style={styles.logoTitle}>Profile Picture</ThemedText>
                            <ThemedText style={styles.logoDesc}>Recommended: Square image</ThemedText>
                        </View>
                    </View>

                    <View style={styles.form}>
                        <NeonInput
                            label="Artist Name"
                            value={artistName}
                            onChangeText={setArtistName}
                            placeholder="Your stage name"
                        />
                        <NeonInput
                            label="Genres (comma separated)"
                            value={genres}
                            onChangeText={setGenres}
                            placeholder="Techno, House, Melodic"
                        />
                        <NeonInput
                            label="Price Per Song Request ($)"
                            value={pricePerSong}
                            onChangeText={setPricePerSong}
                            placeholder="0.00"
                            keyboardType="decimal-pad"
                        />
                        <NeonInput
                            label="City"
                            value={city}
                            onChangeText={setCity}
                            placeholder="City, Country"
                        />
                        <NeonInput
                            label="Bio"
                            value={bio}
                            onChangeText={setBio}
                            placeholder="Tell us about yourself..."
                            multiline
                            numberOfLines={4}
                            style={{ height: 100, textAlignVertical: 'top' }}
                        />

                        <ThemedText style={styles.sectionHeading}>Social Links</ThemedText>
                        
                        <NeonInput
                            label="Spotify URL"
                            value={spotifyUrl}
                            onChangeText={setSpotifyUrl}
                            placeholder="https://open.spotify.com/artist/..."
                        />
                        <NeonInput
                            label="SoundCloud URL"
                            value={soundcloudUrl}
                            onChangeText={setSoundcloudUrl}
                            placeholder="https://soundcloud.com/..."
                        />
                        <NeonInput
                            label="Instagram URL"
                            value={instagramUrl}
                            onChangeText={setInstagramUrl}
                            placeholder="https://instagram.com/..."
                        />

                        <View style={styles.buttonContainer}>
                            <NeonButton
                                title={submitting ? "Saving..." : "Save Changes"}
                                onPress={handleSave}
                                disabled={submitting || uploadingLogo || uploadingBanner}
                                loading={submitting}
                            />
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: ZyncTheme.spacing.m,
        paddingTop: ZyncTheme.spacing.l,
        paddingBottom: ZyncTheme.spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    backButton: {
        marginRight: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    bannerContainer: {
        width: '100%',
        height: 180,
        backgroundColor: ZyncTheme.colors.card,
        position: 'relative',
    },
    bannerImage: {
        width: '100%',
        height: '100%',
    },
    bannerPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        marginTop: 8,
        color: ZyncTheme.colors.textSecondary,
        fontSize: 14,
    },
    imageOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoSection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: ZyncTheme.spacing.m,
        marginTop: -40,
        marginBottom: 20,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: ZyncTheme.colors.background,
        backgroundColor: ZyncTheme.colors.primary,
        overflow: 'hidden',
        position: 'relative',
    },
    logoImage: {
        width: '100%',
        height: '100%',
    },
    logoPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoOverlay: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: ZyncTheme.colors.primary,
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#000',
    },
    logoInfo: {
        marginLeft: 16,
        marginTop: 40,
    },
    logoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    logoDesc: {
        fontSize: 12,
        color: ZyncTheme.colors.textSecondary,
    },
    form: {
        padding: ZyncTheme.spacing.m,
    },
    sectionHeading: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 16,
        color: ZyncTheme.colors.primary,
    },
    buttonContainer: {
        marginTop: 30,
    },
});
