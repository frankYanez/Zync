import { ThemedText } from '@/presentation/components/themed-text';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    return (
        <View style={styles.container}>
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const isFocused = state.index === index;

                // Skip if specific screens shouldn't be in tab bar (if needed)

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name, route.params);
                    }
                };

                const onLongPress = () => {
                    navigation.emit({
                        type: 'tabLongPress',
                        target: route.key,
                    });
                };

                let iconName: keyof typeof Ionicons.glyphMap = 'home';
                if (route.name === 'index') iconName = isFocused ? 'home' : 'home-outline';
                if (route.name === 'wallet') iconName = isFocused ? 'wallet' : 'wallet-outline';
                if (route.name === 'scanner') iconName = 'scan'; // different handling
                if (route.name === 'beats') iconName = isFocused ? 'musical-notes' : 'musical-notes-outline';
                if (route.name === 'profile') iconName = isFocused ? 'person' : 'person-outline';

                const isScanner = route.name === 'scanner';

                return (
                    <TouchableOpacity
                        key={route.key}
                        accessibilityRole="button"
                        accessibilityState={isFocused ? { selected: true } : {}}
                        accessibilityLabel={options.tabBarAccessibilityLabel}
                        testID={options.tabBarTestID}
                        onPress={onPress}
                        onLongPress={onLongPress}
                        style={[styles.tab, isScanner && styles.scannerTab]}
                    >
                        {isScanner ? (
                            <View style={styles.scannerButton}>
                                <Ionicons name="scan" size={28} color="#000" />
                            </View>
                        ) : (
                            <>
                                <Ionicons
                                    name={iconName}
                                    size={24}
                                    color={isFocused ? ZyncTheme.colors.primary : ZyncTheme.colors.textSecondary}
                                />
                                <ThemedText style={[
                                    styles.label,
                                    { color: isFocused ? ZyncTheme.colors.primary : ZyncTheme.colors.textSecondary }
                                ]}>
                                    {options.title || route.name}
                                </ThemedText>
                            </>
                        )}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: ZyncTheme.colors.tabBar,
        borderTopWidth: 1,
        borderTopColor: ZyncTheme.colors.border,
        paddingBottom: Platform.OS === 'ios' ? 20 : 10,
        paddingTop: 10,
        height: Platform.OS === 'ios' ? 85 : 65,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    label: {
        fontSize: 10,
        fontWeight: '600',
    },
    scannerTab: {
        marginTop: -30,
        justifyContent: 'flex-start',
    },
    scannerButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: ZyncTheme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: ZyncTheme.colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 8,
        borderWidth: 4,
        borderColor: ZyncTheme.colors.background,
    }
});
