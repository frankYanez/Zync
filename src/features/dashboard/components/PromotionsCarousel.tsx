import { ThemedText } from '@/components/themed-text';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';


const { width } = Dimensions.get('window');

const PROMOTIONS = [
    {
        id: '1',
        title: '2x1 en Tragos de Autor',
        subtitle: 'OFERTA FLASH',
        icon: 'ticket' as const,
        color: '#ccff00'
    },
    {
        id: '2',
        title: 'Botella de Vodka 50% OFF',
        subtitle: 'SOLO POR 1 HORA',
        icon: 'wine' as const,
        color: '#00ffff'
    },
    {
        id: '3',
        title: 'Free Shot con tu Zync ID',
        subtitle: 'BIENVENIDA',
        icon: 'flash' as const,
        color: '#ff00ff'
    }
];

export function PromotionsCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % PROMOTIONS.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const currentPromo = PROMOTIONS[currentIndex];

    // Progress Bar Animation
    const progress = useSharedValue(0);

    useEffect(() => {
        progress.value = 0;
        progress.value = withTiming(1, { duration: 5000 });
    }, [currentIndex]);

    const progressStyle = useAnimatedStyle(() => ({
        width: `${progress.value * 100}%`
    }));

    return (
        <View style={styles.container}>
            <Animated.View
                key={currentPromo.id}
                entering={FadeIn.duration(500)}
                exiting={FadeOut.duration(500)}
                style={styles.cardContainer}
            >
                <LinearGradient
                    colors={['rgba(30,30,30,0.9)', 'rgba(10,10,10,0.95)']}
                    style={styles.card}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={[styles.iconContainer, { backgroundColor: `${currentPromo.color}20` }]}>
                        <Ionicons name={currentPromo.icon} size={24} color={currentPromo.color} />
                    </View>

                    <View style={styles.content}>
                        <ThemedText style={styles.title}>{currentPromo.title}</ThemedText>
                        <ThemedText style={[styles.subtitle, { color: currentPromo.color }]}>
                            {currentPromo.subtitle}
                        </ThemedText>
                    </View>

                    <Ionicons name="arrow-forward-circle-outline" size={24} color="#666" />
                </LinearGradient>
            </Animated.View>

            {/* Progress Bar Background */}
            <View style={styles.progressContainer}>
                <Animated.View style={[styles.progressBar, progressStyle, { backgroundColor: currentPromo.color }]} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: width * 0.9,
        alignSelf: 'center',
        marginVertical: ZyncTheme.spacing.l,
        overflow: 'hidden',
        borderRadius: 16,
    },
    cardContainer: {
        width: '100%',
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        minHeight: 80,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 11,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginTop: 4,
    },
    progressContainer: {
        height: 2,
        backgroundColor: 'rgba(255,255,255,0.1)',
        width: '100%',
        position: 'absolute',
        bottom: 0,
    },
    progressBar: {
        height: '100%',
    }
});