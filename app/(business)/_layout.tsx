import { CustomTabBar } from '@/components/CustomTabBar';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function BusinessTabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: ZyncTheme.colors.card,
                    borderTopColor: ZyncTheme.colors.border,
                },
                tabBarActiveTintColor: ZyncTheme.colors.primary,
                tabBarInactiveTintColor: ZyncTheme.colors.textSecondary,
            }}
            tabBar={(props) => <CustomTabBar {...props} />}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Resumen',
                    tabBarIcon: ({ color }) => <Ionicons name="stats-chart" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="products"
                options={{
                    title: 'Productos',
                    tabBarIcon: ({ color }) => <Ionicons name="cube" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="scanner"
                options={{
                    title: 'Scanner',
                    tabBarIcon: ({ color }) => <Ionicons name="qr-code" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Perfil',
                    tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}
