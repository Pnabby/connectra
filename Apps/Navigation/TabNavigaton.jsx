import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {Text, View} from 'react-native';
import HomeScreen from "../Screens/Home/HomeScreen";
import SearchScreen from "../Screens/Search/SearchScreen";
import AddScreen from "../Screens/Add/AddScreen";
import ProfileScreen from "../Screens/Profile/ProfileScreen";
import { Ionicons } from '@expo/vector-icons';
import Colors from "../Utils/Colors";
import AddScreenNavigation from "./AddScreenNavigation";
import HomeScreenStackNavigation from './HomeScreenStackNavigation';
import ChatScreen from '../Screens/Chat/ChatScreen';
import ProfileScreenStackNavigation from './ProfileScreenStackNavigation';

const Tab=createBottomTabNavigator();
export default function TabNavigation (){
    return (
        <Tab.Navigator
        screenOptions={{
            tabBarActiveTintColor:Colors.BLACK,
            headerShown:false
        }}
        >
            <Tab.Screen name='Home' component={HomeScreenStackNavigation}
            options={{
                headerShown:false,
                tabBarIcon:({color,size})=>(
                    <Ionicons name="home" size={size} color={color}/>

                )
            }}
            />
            <Tab.Screen name='Search' component={SearchScreen}
                        options={{
                            tabBarIcon:({color,size})=>(
                                <Ionicons name="search" size={size} color={color}/>

                            )
                        }}
            />
            <Tab.Screen name='Add' component={AddScreenNavigation}
                        options={{
                            headerShown:false,
                            tabBarIcon:({color,size})=>(
                                <Ionicons name="add-circle" size={size} color={color}/>

                            )
                        }}
            />
            <Tab.Screen name='Chat' component={ChatScreen}
                        options={{
                            headerShown:false,
                            tabBarIcon:({color,size})=>(
                                <Ionicons name="chatbubbles" size={size} color={color}/>

                            )
                        }}
            />
            <Tab.Screen name='Profile' component={ProfileScreenStackNavigation}
                        options={{
                            tabBarIcon:({color,size})=>(
                                <Ionicons name="people-circle-sharp" size={size} color={color}/>

                            )
                        }}
            />
        </Tab.Navigator>

    );



} ;
