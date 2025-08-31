import { Tabs } from 'expo-router'
import React from 'react'
import { View,Text } from 'react-native'

function TabLayout() {
  return (
    <Tabs>
        <Tabs.Screen name='home' options={{title:"Home"}}/>
        <Tabs.Screen name='about' options={{title:"About"}}/>
        <Tabs.Screen name='profile' options={{title:"Profile"}}/>
    </Tabs>
  )
}

export default TabLayout
