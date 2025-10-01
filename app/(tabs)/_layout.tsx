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
                name="Category"
                options={{
                    title: 'Category',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="information-circle-outline" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="Favorites"
                options={{
                    title: "Favorites",
                    tabBarIcon: ({ color, size }) => (
                        <AntDesign name="heart" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="Restaurant"
                options={{
                    title: "Restaurant",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="restaurant" size={size} color={color} />
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
