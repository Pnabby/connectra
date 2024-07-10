import {View, Text} from 'react-native'
import React from 'react'
import ProfileIntro from "./ProfileIntro";

export default function ProfileScreen() {
    return (
        <View style={{padding: 20, paddingTop: 25}}>
            <ProfileIntro/>
        </View>
    )
}