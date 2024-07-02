import { View, Text } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import HomeScreen from '../Screens/Home/HomeScreen';
import PlayVideoList from '../Screens/Home/PlayVideoList';


const Stack = createStackNavigator();
export default function HomeScreenStackNavigation() {
  return (
    <Stack.Navigator screenOptions ={{
        headerShown:false
    }}>
        <Stack.Screen name = 'home' component={HomeScreen}/>
        <Stack.Screen name='play-video' component={PlayVideoList}/>
    </Stack.Navigator>
  )
}