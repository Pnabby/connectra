import React, {useEffect, useState} from 'react';
import {FlatList, Image, Text, View} from 'react-native';
import {useUser} from "@clerk/clerk-expo";
import {supabase} from "../../Utils/SupabaseConfig";
import VideoThumbnailItem from './VideoThumbnailItem';

export default function HomeScreen(){
    const {user}=useUser();
    const [videoList,setVideoList]= useState([]);
    const [loading,setLoading] = useState(false);
    const [loadCount,setLoadCount]=useState(0);

    useEffect(()=>{
        user&&updateProfileImage();
        setLoadCount(0)
        GetLatestVideoList();
    },[user])

    useEffect(()=>{
        GetLatestVideoList
    },[loadCount])

    const updateProfileImage=async ()=>{
        const {data,error}=await supabase
            .from('Users')
            .update({'profileImage':user?.imageUrl})
            .eq('email',user?.primaryEmailAddress?.emailAddress)
            .is('profileImage',null)
            .select();
            //console.log(data);
            
    }

    const GetLatestVideoList= async()=>{
        setLoading(true);
        const {data,error} = await supabase
        .from('PostList')
        .select('*,Users(username,name,profileImage),VideoLikes(postIdRef,userEmail)')
        .range(loadCount,loadCount+7)
        .order('id',{ascending:false})

        setVideoList(videoList=>[...videoList,...data]);
        //console.log(data);
        if (data){
            setLoading(false);
        }
        
    }
    return (
        <View style={{padding:20,paddingTop:25}}>
            <View style={{display:'flex',flexDirection:'row',
                justifyContent:'space-between',alignItems:'center'}}>
                <Text 
                style={{
                    fontSize:30,fontFamily:'outfit-bold'
                }}>Connectra</Text>
                <Image source={{uri:user?.imageUrl}}
                style={{width:50,height:50,borderRadius:99}}
                />
            </View>
            <View>
                <FlatList
                    data={videoList}
                    numColumns={2}
                    style = {{display:'flex'}}
                    onRefresh={GetLatestVideoList}
                    refreshing={loading}
                    onEndReached={()=>setLoadCount(loadCount+7)}
                    renderItem={({item,index})=>(
                        <VideoThumbnailItem video={item} />
                    )}
                />
            </View>
        </View>
    )
}




