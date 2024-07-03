import { View, Text, FlatList, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native'
import PlayVideoListItem from './PlayVideoListItem';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../Utils/SupabaseConfig';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useUser } from '@clerk/clerk-expo';

export default function PlayVideoList() {
  const params = useRoute().params;
  const [VideoList, setVideoList] = useState([]);
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const {user}=useUser();
  const WindowHeight = Dimensions.get('window').height;
  const BottomTabHeight = useBottomTabBarHeight();

  useEffect(() => {
    setVideoList([params.selectedVideo]);
    GetLatestVideoList();
  }, []);

  const GetLatestVideoList = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('PostList')
      .select('*,Users(username,name,profileImage),VideoLikes(postIdRef,userEmail)')
      .range(0, 7)
      .order('id', { ascending: false });
    
    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    const result = data.filter(item => item.id !== params.selectedVideo.id);
    setVideoList(videoList => [...videoList, ...result]);
    setLoading(false);
  }

  const userLikeHandler=async(videoPost,isLike)=>{
    if(!isLike){
      const {data,error}= await supabase
      .from('VideoLikes')
      .insert([{
        postIdRef:videoPost.id,
        userEmail:user.primaryEmailAddress.emailAddress
      }])
      .select();
      GetLatestVideoList();
    }else{ 
      const { error } = await supabase
      .from('VideoLikes')
      .delete()
      .eq('postIdRef', videoPost.id)
      .eq('userEmail',user?.primaryEmailAddress?.emailAddress)
      GetLatestVideoList();
              
    }
  }
  return (
    <View>
      <TouchableOpacity style={{ position: 'absolute', zIndex: 10, padding: 20, marginTop: 30 }}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <FlatList
        data={VideoList}
        style={{ zIndex: -1 }}
        pagingEnabled
        onScroll={e => {
          const index = Math.round(e.nativeEvent.contentOffset.y / (WindowHeight - BottomTabHeight));
          setCurrentVideoIndex(index);
        }}
        renderItem={({ item, index }) => (
          <PlayVideoListItem
            video={item}
            key={item.id}
            index={index}
            activeIndex={currentVideoIndex}
            userLikeHandler={userLikeHandler}
            user={user}
          />
        )}
        keyExtractor={(item, index) => item.id.toString()}  // Ensure unique keys
      />
    </View>
  );
}