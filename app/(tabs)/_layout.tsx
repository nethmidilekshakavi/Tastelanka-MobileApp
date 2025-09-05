import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';

function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#4CAF50',
                tabBarInactiveTintColor: 'gray',
            }}
        >
            <Tabs.Screen
                name="Home"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="Notification"
                options={{
                    title: 'Nitification',
                    tabBarIcon: ({ color, size }) => (
                        <AntDesign name="bells" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="About"
                options={{
                    title: 'About',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="information-circle-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="Profile"
                options={{
                    title: 'Account',
                    tabBarIcon: ({ color, size }) => (
                        <AntDesign name="user" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}

export default TabLayout;
