import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ZyncTheme } from '../../../shared/constants/theme';
import { uploadAvatar } from '../services/profile.service';

interface AvatarUploadProps {
    currentAvatarUrl?: string;
    onUploadSuccess: (newUrl: string) => void;
}

export const AvatarUpload = ({ currentAvatarUrl, onUploadSuccess }: AvatarUploadProps) => {
    const [isLoading, setIsLoading] = useState(false);

    const handlePickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0].uri) {
            setIsLoading(true);
            try {
                const formData = new FormData() as any;
                formData.append('file', {
                    uri: result.assets[0].uri,
                    type: 'image/jpeg',
                    name: 'avatar.jpg',
                });

                const response = await uploadAvatar(formData);
                onUploadSuccess(response.avatarUrl);
            } catch (error) {
                console.error('Error uploading avatar:', error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <TouchableOpacity style={styles.container} onPress={handlePickImage} disabled={isLoading}>
            {currentAvatarUrl ? (
                <Image source={{ uri: currentAvatarUrl }} style={styles.avatarImage} />
            ) : (
                <View style={styles.placeholderContainer}>
                    <Ionicons name="person" size={40} color={ZyncTheme.colors.background} />
                </View>
            )}

            <View style={styles.editBadge}>
                {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                ) : (
                    <Ionicons name="camera" size={16} color="#000" />
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        width: 100,
        height: 100,
        marginBottom: ZyncTheme.spacing.m,
    },
    avatarImage: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
        borderWidth: 2,
        borderColor: ZyncTheme.colors.primary,
    },
    placeholderContainer: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
        backgroundColor: ZyncTheme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: ZyncTheme.colors.text,
    },
    editBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: ZyncTheme.colors.primary,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#000',
    }
});
