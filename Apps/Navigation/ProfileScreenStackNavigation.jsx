import { View, Text } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import FriendScreen from '../Screens/Friends/FriendScreen';
import ProfileScreen from '../Screens/Profile/ProfileScreen';
import TimeControl from '../Screens/Profile/TimeControl';
import SettingsScreen from '../Screens/Profile/SettingsScreen';
import ChangePasswordScreen from '../Screens/Profile/ChangePasswordScreen';

const Stack = createStackNavigator();
export default function ProfileScreenStackNavigation() {
  return (
    <Stack.Navigator screenOptions ={{
        headerShown:false
    }}>
        <Stack.Screen name='profile' component={ProfileScreen}/>
        <Stack.Screen name='friends' component={FriendScreen}/>
        <Stack.Screen name='time-control' component={TimeControl}/>
        <Stack.Screen name='settings' component={SettingsScreen}/>
        <Stack.Screen name='change-password' component={ChangePasswordScreen}/>
    </Stack.Navigator>
  )
}