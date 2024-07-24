import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import Colors from '../../Utils/Colors';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { supabase } from '../../Utils/SupabaseConfig';
import VideoThumbnailItem from '../Home/VideoThumbnailItem';
import { useNavigation } from '@react-navigation/native';
import { RefreshControl } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { s3bucket } from '../../Utils/S3BucketConfig'; // Import the S3 client
import { LongPressGestureHandler } from 'react-native-gesture-handler';

export default function ProfileIntro() {
    const navigation = useNavigation();
    const { user } = useUser();
    const [postCount, setPostCount] = useState(0);
    const [likesCount, setLikesCount] = useState(0);
    const [friendsCount, setFriendsCount] = useState(0); // State for friends count
    const [videoList, setVideoList] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [username, setUsername] = useState(''); // State for username
    const [profileImage, setProfileImage] = useState(user?.imageUrl); // State for profile image

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

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await getPostCount();
            await getLikesCount();
            await getFriendsCount();
            await getVideoList();
            await fetchUserProfileImage();
        } catch (error) {
            console.error('Error refreshing data:', error);
        }
        setRefreshing(false);
    };

    const getUsername = async () => {
        if (!user?.primaryEmailAddress.emailAddress) return;

        const { data, error } = await supabase
            .from('Users') // Adjust the table name if necessary
            .select('username')
            .eq('email', user.primaryEmailAddress.emailAddress)
            .single();

        if (error) {
            console.error('Error fetching username:', error);
        } else {
            setUsername(data?.username || ''); // Set the username state
        }
    };

    const getPostCount = async () => {
        const { data, error } = await supabase
            .from('PostList')
            .select('*', { count: 'exact' })
            .eq('emailRef', user?.primaryEmailAddress.emailAddress);

        if (error) {
            console.error('Error fetching post count:', error);
            return 0;
        }

        data.length && setPostCount(data.length);
    };

    const getLikesCount = async () => {
        const { data, error } = await supabase
            .from('PostList')
            .select('id', { count: 'exact' }, 'VideoLikes:postIdRef!inner(userEmail)')
            .eq('emailRef', user?.primaryEmailAddress.emailAddress);

        if (error) {
            console.error('Count error:', error.message);
        }

        data.length && setLikesCount(data.length);
    };

    const getFriendsCount = async () => {
        const { data, error } = await supabase.rpc('get_friends_count', { user_email: user?.primaryEmailAddress.emailAddress });

        if (error) {
            console.error('Error fetching friends count:', error);
        } else {
            setFriendsCount(data);
        }
    };

    const getVideoList = async () => {
        try {
            const { data, error } = await supabase
                .from('PostList')
                .select('*, Users:emailRef!inner(username, name, profileImage),VideoLikes(postIdRef,userEmail)')
                .eq('emailRef', user?.primaryEmailAddress.emailAddress);

            if (error) {
                console.error('Search error:', error.message);
            } else {
                setVideoList(data);
            }
        } catch (error) {
            console.error('Search error:', error);
        }
    };

    useEffect(() => {
        getUsername(); // Fetch username when component mounts
        getPostCount();
        getLikesCount();
        getFriendsCount();
        fetchUserProfileImage();
        getVideoList();
    }, []);

    const uploadToS3 = async (uri, fileName, contentType) => {
        const file = await fetch(uri);
        const blob = await file.blob();
        
        const params = {
            Bucket: 'connectra', // Replace with your bucket name
            Key: fileName,
            Body: blob,
            ContentType: contentType,
        };

        try {
            await s3bucket.upload(params).promise();
            console.log("uploaded")
            return `https://connectra.s3.amazonaws.com/${fileName}`; // Construct URL for the uploaded file
        } catch (error) {
            console.error('Error uploading to S3:', error);
            throw new Error('Failed to upload image');
        }
    };

    const updateProfileImage = async (imageUrl) => {
        const { error } = await supabase
            .from('Users')
            .update({ profileImage: imageUrl })
            .eq('email', user.primaryEmailAddress.emailAddress);

        if (error) {
            Alert.alert('Error', 'Failed to update profile image');
            console.error('Error updating profile image:', error);
        }
    };

    const handleProfileImageChange = async () => {
        Alert.alert('Change Profile Image', 'Would you like to change your profile image?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Choose from Gallery', onPress: async () => await pickImageFromGallery() },
            { text: 'Take a Photo', onPress: async () => await takePhoto() },
        ]);
    };

    const pickImageFromGallery = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            await handleImageUpload(result.assets[0]);
        }
    };

    const takePhoto = async () => {
        let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            await handleImageUpload(result.assets[0]);
        }
    };

    const handleImageUpload = async (asset) => {
        const { uri, fileName, type } = asset;
        const fileUrl = await uploadToS3(uri, `profile-images/${fileName}`, type);
        await updateProfileImage(fileUrl);
        setProfileImage(fileUrl);
    };

    return (
        <ScrollView style={{ marginTop: 20 }}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                />
            }
        >
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between'
            }}>
                <Text>       </Text>
                <Text
                    style={{
                        fontFamily: 'outfit-bold',
                        fontSize: 24,
                    }}
                >
                    Profile
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('settings')}>
                    <Ionicons name="settings" size={24} color="black" />
                </TouchableOpacity>
            </View>

            <View style={{ alignItems: 'center', marginTop: 20 }}>
                <LongPressGestureHandler
                    onHandlerStateChange={({ nativeEvent }) => {
                        if (nativeEvent.state === 4) { // State 4 is for long press
                            handleProfileImageChange();
                        }
                    }}
                >
                    <View>
                        <Image
                            source={{ uri: profileImage }}
                            style={{
                                width: 70,
                                height: 70,
                                borderRadius: 99,
                            }}
                        />
                    </View>
                </LongPressGestureHandler>
                <Text
                    style={{
                        fontSize: 22,
                        fontFamily: 'outfit-medium',
                    }}
                >
                    {username}  {/* Display the fetched username */}
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
                    justifyContent: 'space-between'
                }}
            >
                <TouchableOpacity style={{ padding: 20, justifyContent: 'center', alignItems: 'center' }}
                    onPress={() => navigation.navigate('friends')}
                >
                    <FontAwesome5 name="user-friends" size={24} color="black" />
                    <Text
                        style={{
                            fontFamily: 'outfit-bold',
                            fontSize: 15,
                        }}
                    >
                        {friendsCount} Friends
                    </Text>
                </TouchableOpacity>
                <View style={{ padding: 20, justifyContent: 'center', alignItems: 'center' }}>
                    <Ionicons name="videocam-outline" size={24} color="black" />
                    <Text
                        style={{
                            fontFamily: 'outfit-bold',
                            fontSize: 15,
                        }}
                    >
                        {postCount} posts
                    </Text>
                </View>
                <View style={{ padding: 20, justifyContent: 'center', alignItems: 'center' }}>
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
                style={{ zIndex: -1, marginTop: 20 }}
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

const styles = StyleSheet.create({
    row: {
        justifyContent: 'space-between',
    },
});
