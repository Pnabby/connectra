import { View, Text, Image, FlatList, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-expo';
import Colors from '../../Utils/Colors';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../Utils/SupabaseConfig';
import VideoThumbnailItem from '../Home/VideoThumbnailItem';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function ProfileIntro() {
    const navigation=useNavigation();
    const { user } = useUser();
    const [postCount,setpostCount]=useState(0);
    const [likesCount,setlikesCount]=useState(0);
    const [videoList,setVideoList]= useState([]);

    const getPostCount = async () => {
        const { data, error } = await supabase
          .from('PostList')
          .select('*', { count: 'exact' })
          .eq('emailRef', user?.primaryEmailAddress.emailAddress);
    
        if (error) {
          console.error('Error fetching likes count:', error);
          return 0;
        }

        data.length&&setpostCount(data.length)
    }
    const getLikesCount = async () => {
        const { data, error, count } = await supabase
        .from('PostList')
        .select('id', { count: 'exact' },'VideoLikes:postIdRef!inner(userEmail)') // Select a column to enable counting
        .eq('emailRef', user?.primaryEmailAddress.emailAddress);
        //.innerJoin('VideoLikes', 'PostList.id', 'VideoLikes.postIdRef');

        if (error) {
            console.error('Count error:', error.message);
        }

        //console.log('Count:', count);
        data.length&&setlikesCount(data.length)

    }
    const getVideoList = async()=>{
        try {
            const { data, error } = await supabase
              .from('PostList')
              .select('*, Users:emailRef!inner(username, name, profileImage),VideoLikes(postIdRef,userEmail)') // Select necessary fields
              .eq('emailRef',user?.primaryEmailAddress.emailAddress)
      
            if (error) {
              console.error('Search error:', error.message);
            } else {
              setVideoList(data);
            }
          } catch (error) {
            console.error('Search error:', error);
          }
    }

    useEffect(()=>{
        getPostCount()
        getLikesCount()
        getVideoList()
    }, [])
    
    return (
        <ScrollView style={{ marginTop:30,}}>
            <View style={{
                flexDirection:'row',
                justifyContent:'space-between'
            }}>
            <Text
                style={{
                    fontFamily: 'outfit-bold',
                    fontSize: 24,
                }}
            >
                Profile
            </Text>
            <TouchableOpacity onPress={()=>navigation.navigate('time-control')}>
                <Ionicons name="settings" size={24} color="black" />
            </TouchableOpacity>
            </View>

            <View style={{ alignItems: 'center', marginTop: 20 }}>
                <Image
                    source={{ uri: user?.imageUrl }}
                    style={{
                        width: 70,
                        height: 70,
                        borderRadius: 99,
                    }}
                />
                <Text
                    style={{
                        fontSize: 22,
                        fontFamily: 'outfit-medium',
                    }}
                >
                    {user?.fullName}
                </Text>
                <Text
                    style={{
                        fontSize: 22,
                        fontFamily: 'outfit',
                        color: Colors.BACKGROUND_TRANSPARENT,
                    }}
                >
                    {user?.primaryEmailAddress?.emailAddress}
                </Text>
            </View>
            <View
                style={{
                    marginBottom: -30,
                    marginTop: 20,
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent:'space-between'
                }}
            >
                <TouchableOpacity style={{ padding: 20, justifyContent:'center', alignItems:'center' }}
                    onPress={()=>navigation.navigate('friends')}
                >
                    <FontAwesome5 name="user-friends" size={24} color="black" />
                    <Text
                        style={{
                            fontFamily: 'outfit-bold',
                            fontSize: 15,
                        }}
                    >20 Friends
                    </Text>
                </TouchableOpacity>
                <View style={{ padding: 20, justifyContent:'center',alignItems:'center' }}>
                    <Ionicons name="videocam-outline" size={24} color="black" />
                    <Text
                        style={{
                            fontFamily: 'outfit-bold',
                            fontSize: 15,
                        }}
                    >{postCount} posts
                    </Text>
                </View>
                <View style={{ padding: 20, justifyContent:'center',alignItems:'center' }}>
                    <Ionicons name="heart" size={24} color="black" />
                    <Text
                        style={{
                            fontFamily: 'outfit-bold',
                            fontSize: 15,
                        }}
                    >
                        {likesCount} likes
                    </Text>
                </View>
            </View>
            <FlatList
                style={{zIndex: -1,marginTop:20}}
                data={videoList}
                keyExtractor={(item) => item.id.toString()} // Ensure unique keys
                numColumns={2} // Display 2 items per row
                columnWrapperStyle={styles.row}
                renderItem={({ item }) => (
                <VideoThumbnailItem video={item} />
                )}
            />
        </ScrollView>
    );
}
const styles = StyleSheet.create({})