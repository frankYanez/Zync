import { ZyncTheme } from '@/shared/constants/theme';
import React from 'react';
import { SafeAreaView, StatusBar, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

interface ScreenLayoutProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    noPadding?: boolean;
}

export function ScreenLayout({ children, style, noPadding = false, transparent = false }: ScreenLayoutProps & { transparent?: boolean }) {
    return (
        <SafeAreaView style={[styles.safeArea, transparent && { backgroundColor: 'transparent' }]}>
            <StatusBar barStyle="light-content" backgroundColor={transparent ? 'transparent' : ZyncTheme.colors.background} translucent={transparent} />
            <View style={[
                styles.container,
                !transparent && { backgroundColor: ZyncTheme.colors.background },
                !noPadding && styles.padding,
                style
            ]}>
                {children}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: ZyncTheme.colors.background,
    },
    container: {
        flex: 1,
        backgroundColor: ZyncTheme.colors.background,
    },
    padding: {
        paddingHorizontal: ZyncTheme.spacing.m,
    }
});
