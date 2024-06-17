import {View, Text} from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import AddScreen from "../Screens/Add/AddScreen";
import PreviewScreen from "../Screens/Add/PreviewScreen";

const Stack=createStackNavigator();
export default function AddScreenNavigation() {
    return (
        <Stack.Navigator screenOptions={{
            headerShown:false
        }}>
            <Stack.Screen name='add-screen' component={AddScreen}/>
            <Stack.Screen name='preview-screen' component={PreviewScreen}/>
        </Stack.Navigator>

    )
}