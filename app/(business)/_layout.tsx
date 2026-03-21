import { CustomTabBar } from '@/components/CustomTabBar';
import { useRoleManager } from '@/hooks/useRoleManager';
import { ZyncTheme } from '@/shared/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

/**
 * Layout de tabs para la sección de negocio/DJ.
 *
 * Tabs visibles según el rol activo:
 *   - DJ:      Home | Canciones | Descuentos | Perfil
 *   - Business: Home | Productos | Scanner   | Perfil
 */
export default function BusinessTabLayout() {
    const { currentRole } = useRoleManager();
    const isDj = currentRole === 'dj';
    const isBusiness = currentRole === 'business';

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
            {/* HOME - visible para todos los roles */}
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
                }}
            />

            {/* CANCIONES - solicitudes de canciones, solo visible para DJ */}
            <Tabs.Screen
                name="requests"
                options={{
                    title: 'Canciones',
                    href: isDj ? '/(business)/requests' : null,
                    tabBarIcon: ({ color }) => <Ionicons name="musical-notes" size={24} color={color} />,
                }}
            />

            {/* PRODUCTOS - gestión de productos, solo visible para Business */}
            <Tabs.Screen
                name="products"
                options={{
                    title: 'Productos',
                    href: isBusiness ? '/(business)/products' : null,
                    tabBarIcon: ({ color }) => <Ionicons name="cube" size={24} color={color} />,
                }}
            />

            {/* SCANNER - lector QR, solo visible para Business */}
            <Tabs.Screen
                name="scanner"
                options={{
                    title: 'Scanner',
                    href: isBusiness ? '/(business)/scanner' : null,
                    tabBarIcon: ({ color }) => <Ionicons name="qr-code" size={24} color={color} />,
                }}
            />

            {/* DESCUENTOS - códigos promo, solo visible para DJ */}
            <Tabs.Screen
                name="dj/promo-codes"
                options={{
                    title: 'Descuentos',
                    href: isDj ? '/(business)/dj/promo-codes' : null,
                    tabBarIcon: ({ color }) => <Ionicons name="pricetag" size={24} color={color} />,
                }}
            />

            {/* PERFIL - visible para todos los roles */}
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Perfil',
                    tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
                }}
            />

            {/* PANTALLAS AUXILIARES - ocultas del tab bar */}
            <Tabs.Screen name="dj/gigs" options={{ href: null }} />
            <Tabs.Screen name="events/lineup" options={{ href: null }} />
            <Tabs.Screen name="config" options={{ href: null }} />
        </Tabs>
    );
}
