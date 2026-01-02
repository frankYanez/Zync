import { CustomTabBar } from '@/components/CustomTabBar';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: '', // No title for scanner button
        }}
      />
      <Tabs.Screen
        name="beats"
        options={{
          title: 'Beats',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
    </Tabs>
  );
}
