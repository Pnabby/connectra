import React, { useEffect, useState } from 'react';
import { FlatList, Image, Text, View, ScrollView, Alert } from 'react-native';
import { useUser, useAuth } from "@clerk/clerk-expo";
import { supabase } from "../../Utils/SupabaseConfig";
import VideoThumbnailItem from './VideoThumbnailItem';

export default function HomeScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const [videoList, setVideoList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadCount, setLoadCount] = useState(0);
  const [profileImage, setProfileImage] = useState(''); // State for storing profile image URL

  useEffect(() => {
    if (user) {
      setLoadCount(0);
      fetchUserProfileImage(); // Fetch profile image when user is available
      GetLatestVideoList();
      checkTimeLimit();
    }
  }, [user]);

  useEffect(() => {
    GetLatestVideoList();
  }, [loadCount]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (user) {
        checkTimeLimit();
      }
    }, 1000 * 60); // Run every minute

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [user]);

  // Fetch profile image from Users table
  const fetchUserProfileImage = async () => {
    try {
      const { data, error } = await supabase
        .from('Users')
        .select('profileImage')
        .eq('email', user.primaryEmailAddress.emailAddress)
        .single();

      if (error) {
        console.error('Error fetching profile image:', error);
      } else {
        setProfileImage(data.profileImage || ''); // Update state with the fetched profile image URL
      }
    } catch (error) {
      console.error('Error fetching profile image:', error);
    }
  };

  const GetLatestVideoList = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('PostList')
      .select('*, Users(username,name,profileImage), VideoLikes(postIdRef,userEmail)')
      // .range(loadCount, loadCount + 7)
      .order('id', { ascending: false });

    setVideoList(data);
    if (data) {
      setLoading(false);
    }
  };

  const delData = async () => {
    try {
      const { error } = await supabase
        .from('UserTimeSettings')
        .delete()
        .eq('email', user.primaryEmailAddress.emailAddress);
      
      if (error) {
        console.error('Error deleting user time settings:', error);
      }
    } catch (error) {
      console.error('Error deleting user time settings:', error);
    }
  };

  const checkTimeLimit = async () => {
    try {
      const { data, error } = await supabase
        .from('UserTimeSettings')
        .select('created_at, timeLimit, breakTime')
        .eq('email', user.primaryEmailAddress.emailAddress)
        .single();
  
      if (!data) {
        return;
      }
  
      const createdAt = new Date(data.created_at);
      const currentTime = new Date();
      const timeLimit = data.timeLimit;
      const breakTime = data.breakTime;
  
      const timeDifference = (currentTime - createdAt) / (1000 * 60); // Difference in minutes
  
      if (timeDifference > timeLimit && timeDifference < (breakTime + timeLimit)) {
        Alert.alert(
          "Time Limit Exceeded",
          `You have exceeded your screen time limit. You will be logged out. Come back in ${Math.ceil(breakTime + timeLimit - timeDifference)} minutes.`,
          [
            { text: "OK", onPress: handleLogout }
          ]
        );
      } else if (timeDifference > (breakTime + timeLimit)) {
        console.log("Good to go");
        delData();
      }
    } catch (error) {
      console.error('Error checking time limit:', error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      console.log("User logged out");
    } catch (error) {
      console.error('Error logging out:', error.message);
    }
  };

  return (
    <View style={{ padding: 20, paddingTop: 25 }}>
      <View style={{
        display: 'flex', flexDirection: 'row',
        justifyContent: 'space-between', alignItems: 'center'
      }}>
        <Text style={{ fontSize: 30, fontFamily: 'outfit-bold' }}>Connectra</Text>
        <Image 
          source={{ uri: profileImage || 'default_image_url_here' }} // Use profile image URL from state
          style={{ width: 50, height: 50, borderRadius: 99 }}
        />
      </View>
      <View style={{ paddingBottom: 80 }}>
        <FlatList
          data={videoList}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          style={{ display: 'flex' }}
          onRefresh={GetLatestVideoList}
          refreshing={loading}
          onEndReached={() => setLoadCount(loadCount + 7)}
          renderItem={({ item }) => (
            <VideoThumbnailItem video={item} />
          )}
        />
      </View>
    </View>
  );
}
