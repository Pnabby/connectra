import React, {useEffect} from 'react';
import {Text, View} from 'react-native';
import {useUser} from "@clerk/clerk-expo";
import {supabase} from "../../Utils/SupabaseConfig";

export default function HomeScreen(){
    const {user}=useUser();

    useEffect(()=>{
        user&&updateProfileImage();
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
    return (
        <View style={{padding:20}}>
            <Text>HomeScreen</Text>
        </View>
    )
}




