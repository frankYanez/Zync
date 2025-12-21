import { ScreenLayout } from '@/presentation/components/ScreenLayout';
import { ThemedText } from '@/presentation/components/themed-text';
import { NeonButton } from '@/presentation/components/ui/NeonButton';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function CartScreen() {
    const router = useRouter();
    return (
        <ScreenLayout style={styles.container}>
            <ThemedText type="title">Cart</ThemedText>
            <ThemedText>Order summary here...</ThemedText>
            <View style={{ marginTop: 20 }}>
                <NeonButton title="Checkout" onPress={() => router.back()} />
            </View>
        </ScreenLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        gap: 20,
    }
});
