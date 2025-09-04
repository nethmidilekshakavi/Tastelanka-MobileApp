import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';

function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false, // hides the top header if you want
                tabBarActiveTintColor: '#4CAF50', // active icon color
                tabBarInactiveTintColor: 'gray',   // inactive icon color
                tabBarStyle: { backgroundColor: '#fff', height: 60 }, // tab bar style
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
                name="about"
                options={{
                    title: 'About',
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="info-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, size }) => (
                        <FontAwesome name="user-o" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}

export default TabLayout;
