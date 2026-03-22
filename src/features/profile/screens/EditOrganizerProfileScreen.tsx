import { NeonButton } from '@/components/NeonButton';
import { NeonInput } from '@/components/NeonInput';
import { ScreenLayout } from '@/components/ScreenLayout';
import { ThemedText } from '@/components/themed-text';
import {
    getOrganizerProfile,
    patchOrganizerProfile,
    uploadOrganizerBanner,
    uploadOrganizerLogo,
} from '@/features/profile/services/profile.service';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

interface OrganizerForm {
    organizationName: string;
    description: string;
    address: string;
    websiteUrl: string;
    contactEmail: string;
}

export default function EditOrganizerProfileScreen() {
    const router = useRouter();

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [isUploadingBanner, setIsUploadingBanner] = useState(false);

    const [logoUrl, setLogoUrl] = useState<string | null>(null);
    const [bannerUrl, setBannerUrl] = useState<string | null>(null);

    const [form, setForm] = useState<OrganizerForm>({
        organizationName: '',
        description: '',
        address: '',
        websiteUrl: '',
        contactEmail: '',
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setIsLoading(true);
            const profile = await getOrganizerProfile();
            setForm({
                organizationName: profile.organizationName ?? '',
                description: profile.description ?? '',
                address: profile.address ?? '',
                websiteUrl: profile.websiteUrl ?? '',
                contactEmail: profile.contactEmail ?? '',
            });
            setLogoUrl(profile.logoUrl ?? null);
            setBannerUrl(profile.bannerUrl ?? null);
        } catch {
            // Profile may not exist yet — that's fine, show empty form
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!form.organizationName.trim()) {
            Alert.alert('Requerido', 'El nombre de la organización es obligatorio.');
            return;
        }
        setIsSaving(true);
        try {
            await patchOrganizerProfile({
                organizationName: form.organizationName.trim(),
                description: form.description.trim(),
                address: form.address.trim(),
                websiteUrl: form.websiteUrl.trim(),
                contactEmail: form.contactEmail.trim(),
            });
            router.back();
        } catch (error: any) {
            Alert.alert('Error', error?.response?.data?.message ?? 'No se pudo guardar el perfil.');
        } finally {
            setIsSaving(false);
        }
    };

    const pickAndUpload = async (type: 'logo' | 'banner') => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: type === 'logo' ? [1, 1] : [16, 9],
            quality: 0.85,
        });
        if (result.canceled) return;

        const asset = result.assets[0];
        const formData = new FormData();
        formData.append('file', {
            uri: asset.uri,
            type: asset.mimeType ?? 'image/jpeg',
            name: asset.fileName ?? `${type}.jpg`,
        } as any);

        try {
            if (type === 'logo') {
                setIsUploadingLogo(true);
                const data = await uploadOrganizerLogo(formData);
                setLogoUrl(data.logoUrl ?? data.url ?? null);
            } else {
                setIsUploadingBanner(true);
                const data = await uploadOrganizerBanner(formData);
                setBannerUrl(data.bannerUrl ?? data.url ?? null);
            }
        } catch (error: any) {
            Alert.alert('Error', `No se pudo subir ${type === 'logo' ? 'el logo' : 'el banner'}.`);
        } finally {
            setIsUploadingLogo(false);
            setIsUploadingBanner(false);
        }
    };

    const setField = (key: keyof OrganizerForm, value: string) =>
        setForm(prev => ({ ...prev, [key]: value }));

    if (isLoading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={ZyncTheme.colors.primary} />
            </View>
        );
    }

    return (
        <ScreenLayout style={styles.container} noPadding>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={ZyncTheme.colors.text} />
                </TouchableOpacity>
                <ThemedText style={styles.title}>Editar perfil</ThemedText>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scroll}>

                    {/* Banner */}
                    <TouchableOpacity style={styles.bannerContainer} onPress={() => pickAndUpload('banner')} activeOpacity={0.8}>
                        {bannerUrl ? (
                            <Image source={{ uri: bannerUrl }} style={styles.bannerImage} contentFit="cover" />
                        ) : (
                            <View style={styles.bannerPlaceholder}>
                                <Ionicons name="image-outline" size={32} color="#555" />
                                <ThemedText style={styles.placeholderText}>Subir banner</ThemedText>
                            </View>
                        )}
                        {isUploadingBanner && (
                            <View style={styles.uploadOverlay}>
                                <ActivityIndicator color="#fff" />
                            </View>
                        )}
                        <View style={styles.bannerEditBadge}>
                            <Ionicons name="camera" size={14} color="#fff" />
                        </View>
                    </TouchableOpacity>

                    {/* Logo */}
                    <TouchableOpacity style={styles.logoContainer} onPress={() => pickAndUpload('logo')} activeOpacity={0.8}>
                        {logoUrl ? (
                            <Image source={{ uri: logoUrl }} style={styles.logoImage} contentFit="cover" />
                        ) : (
                            <View style={styles.logoPlaceholder}>
                                <Ionicons name="business" size={28} color="#555" />
                            </View>
                        )}
                        {isUploadingLogo && (
                            <View style={styles.uploadOverlay}>
                                <ActivityIndicator color="#fff" size="small" />
                            </View>
                        )}
                        <View style={styles.logoCameraBadge}>
                            <Ionicons name="camera" size={12} color="#fff" />
                        </View>
                    </TouchableOpacity>

                    {/* Form fields */}
                    <View style={styles.fields}>
                        <ThemedText style={styles.label}>Nombre de la organización *</ThemedText>
                        <NeonInput
                            placeholder="Nombre de tu empresa / organizador"
                            value={form.organizationName}
                            onChangeText={v => setField('organizationName', v)}
                        />

                        <ThemedText style={styles.label}>Descripción</ThemedText>
                        <NeonInput
                            placeholder="Descripción breve de tu organización"
                            value={form.description}
                            onChangeText={v => setField('description', v)}
                            multiline
                            numberOfLines={3}
                            containerStyle={styles.textareaContainer}
                        />

                        <ThemedText style={styles.label}>Dirección</ThemedText>
                        <NeonInput
                            placeholder="Dirección física"
                            value={form.address}
                            onChangeText={v => setField('address', v)}
                        />

                        <ThemedText style={styles.label}>Sitio web</ThemedText>
                        <NeonInput
                            placeholder="https://tuorganizacion.com"
                            value={form.websiteUrl}
                            onChangeText={v => setField('websiteUrl', v)}
                            keyboardType="url"
                            autoCapitalize="none"
                        />

                        <ThemedText style={styles.label}>Email de contacto</ThemedText>
                        <NeonInput
                            placeholder="contacto@tuorganizacion.com"
                            value={form.contactEmail}
                            onChangeText={v => setField('contactEmail', v)}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <NeonButton
                        title={isSaving ? 'Guardando...' : 'Guardar cambios'}
                        onPress={handleSave}
                        disabled={isSaving}
                        style={styles.saveButton}
                    />

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    loaderContainer: {
        flex: 1,
        backgroundColor: ZyncTheme.colors.background,
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
    backButton: { marginRight: 16 },
    title: { fontSize: 22, fontWeight: 'bold', color: 'white' },
    scroll: { paddingBottom: 40 },

    /* Banner */
    bannerContainer: {
        width: '100%',
        height: 160,
        backgroundColor: '#111',
        position: 'relative',
        overflow: 'hidden',
    },
    bannerImage: { width: '100%', height: '100%' },
    bannerPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(0,212,255,0.04)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,212,255,0.15)',
    },
    placeholderText: { fontSize: 13, color: '#555' },
    uploadOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bannerEditBadge: {
        position: 'absolute',
        bottom: 10,
        right: 14,
        backgroundColor: 'rgba(0,212,255,0.8)',
        borderRadius: 999,
        padding: 7,
    },

    /* Logo */
    logoContainer: {
        alignSelf: 'center',
        marginTop: -40,
        width: 80,
        height: 80,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: 'rgba(0,212,255,0.5)',
        backgroundColor: ZyncTheme.colors.card,
        position: 'relative',
        marginBottom: 20,
    },
    logoImage: { width: '100%', height: '100%' },
    logoPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,212,255,0.06)',
    },
    logoCameraBadge: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        backgroundColor: 'rgba(0,212,255,0.85)',
        borderRadius: 999,
        padding: 4,
    },

    /* Fields */
    fields: { paddingHorizontal: ZyncTheme.spacing.m, gap: 4 },
    label: {
        fontSize: 13,
        color: ZyncTheme.colors.textSecondary,
        marginTop: 12,
        marginBottom: 4,
        fontWeight: '600',
    },
    textareaContainer: { minHeight: 80 },
    saveButton: { marginHorizontal: ZyncTheme.spacing.m, marginTop: 28 },
});
