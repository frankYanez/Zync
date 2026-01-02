import { ThemedText } from '@/components/themed-text';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { ImageBackground, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';


const QUICK_ACCESS_ITEMS = [
    {
        id: 'menu',
        title: 'Menú\ndel Bar',
        icon: 'wine' as const,
        route: '/menu',
        image: 'https://images.pexels.com/photos/1283219/pexels-photo-1283219.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
        id: 'beats',
        title: 'Zync\nBeats',
        icon: 'musical-notes' as const,
        route: '/beats',
        image: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
        id: 'wallet',
        title: 'Cargar\nSaldo',
        icon: 'wallet' as const,
        route: '/wallet',
        image: 'https://images.pexels.com/photos/259027/pexels-photo-259027.jpeg?auto=compress&cs=tinysrgb&w=600',
    },
    {
        id: 'promo',
        title: 'Mis\nPromos',
        icon: 'ticket' as const,
        route: '/profile',
        image: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=600',
    }
];

export function QuickAccessCarousel() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <ThemedText style={styles.sectionTitle}>EXPLORAR CLUB</ThemedText>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {QUICK_ACCESS_ITEMS.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        onPress={() => router.push(item.route as any)}
                        activeOpacity={0.8}
                    >
                        <View style={styles.cardContainer}>
                            <ImageBackground
                                source={{ uri: item.image }}
                                style={styles.cardBg}
                                imageStyle={{ borderRadius: 24 }}
                            >
                                <LinearGradient
                                    colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.8)']}
                                    style={styles.gradient}
                                >
                                    <View style={styles.iconContainer}>
                                        <Ionicons name={item.icon} size={20} color="white" />
                                    </View>
                                    <ThemedText style={styles.cardTitle}>{item.title}</ThemedText>
                                </LinearGradient>
                            </ImageBackground>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: ZyncTheme.spacing.m,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#666',
        letterSpacing: 1.5,
        marginLeft: ZyncTheme.spacing.m,
        marginBottom: ZyncTheme.spacing.m,
        textTransform: 'uppercase',
    },
    scrollContent: {
        paddingHorizontal: ZyncTheme.spacing.m,
        gap: ZyncTheme.spacing.m,
        paddingBottom: 20
    },
    cardContainer: {
        width: 160,
        height: 220,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        backgroundColor: '#1E1E1E',
    },
    cardBg: {
        width: '100%',
        height: '100%',
    },
    gradient: {
        flex: 1,
        padding: 16,
        justifyContent: 'space-between',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(10px)', // Works on web/some native views if reinforced
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        lineHeight: 22,
        color: 'white',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowRadius: 4,
    }
});