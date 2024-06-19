import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';
import {useUser} from "@clerk/clerk-expo";
import {supabase} from "../../Utils/SupabaseConfig";
import {Image} from "react-native";
import {FlatList} from "react-native-gesture-handler";
import VideoThumbnailsItems from "./VideoThumbnailsItems";

export default function HomeScreen(){
    const {user}=useUser();

    useEffect(()=>{
        user&&updateProfileImage();
        GetLastestVideoList();
    },[user])

    const updateProfileImage=async ()=>{
        const {data,error}=await supabase
            .from('Users')
            .update({'profileImage':user?.imageUrl})
            .eq('email',user?.primaryEmailAddress?.emailAddress)
            .is('profileImage',null)
            .select();
            console.log(data);
    }

    const GetLastestVideoList=async ()=>{
        const {data,error}=await supabase
            .from('PostList')
            .select('*, Users(username,name,profileImage)')
            .range(0,9);

        console.log(data);
        console.log(error);

    }
    return (
        <View style={{padding:20,paddingTop:25}}>
            <View style={{display:'flex',flexDirection:'row',
            justifyContent:'space-between',alignItems:'center'}}>
            <Text style={{fontSize:30,fontFamily:'outfit-bold'}}>Connectra</Text>
            <Image source={{uri:user?.imageUrl}}
                   style={{width:50,height:50,borderRadius:99}}/>
            </View>
        </View>
    )
}




