import { View, Text } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import ChatScreen from '../Screens/Chat/ChatScreen';
import OpenChat from '../Screens/Chat/OpenChat';
const Stack=createStackNavigator();

export default function ChatScreenNavigation() {
    return (
        <Stack.Navigator screenOptions={{
            headerShown:false
        }}>
            <Stack.Screen name='chatScreen' component={ChatScreen}/>
            <Stack.Screen name='OpenChat' component={OpenChat}/>
        </Stack.Navigator>

    )
}