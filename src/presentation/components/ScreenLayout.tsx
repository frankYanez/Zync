import { ZyncTheme } from '@/shared/constants/theme';
import React from 'react';
import { SafeAreaView, StatusBar, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

interface ScreenLayoutProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    noPadding?: boolean;
}

export function ScreenLayout({ children, style, noPadding = false }: ScreenLayoutProps) {
    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" backgroundColor={ZyncTheme.colors.background} />
            <View style={[
                styles.container,
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
