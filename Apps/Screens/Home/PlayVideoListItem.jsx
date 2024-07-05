import React, { useRef, useState, useEffect } from 'react';
import { Text, View, StyleSheet, Dimensions, Image, TouchableHighlight } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import Colors from '../../Utils/Colors';
import { Ionicons } from '@expo/vector-icons';

export default function PlayVideoListItem({ video, activeIndex, index, userLikeHandler, user }) {
  const videoRef = useRef(null);
  const [status, setStatus] = useState({});
  const [checkLike, setCheckLike] = useState(false);
  const [likeCount, setLikeCount] = useState(video?.VideoLikes?.length || 0);

  useEffect(() => {
    // Check if the user has already liked the video on mount
    setCheckLike(!!video.VideoLikes?.find(item => item.userEmail === user.primaryEmailAddress.emailAddress));
  }, [video]);

  const handleLikePress = async () => {
    // Optimistically update the like state and count
    setCheckLike(prev => !prev);
    setLikeCount(prevCount => checkLike ? prevCount - 1 : prevCount + 1);

    const isLike = checkLike;
    await userLikeHandler(video, isLike);
  };

  return (
    <View>
      <View style={styles.overlay}>
        <View>
          <View style={styles.userInfo}>
            <Image source={{ uri: video?.Users.profileImage }} style={styles.profileImage} />
            <Text style={styles.userName}>{video.Users.name}</Text>
          </View>
          <Text style={styles.description}>{video.description}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableHighlight onPress={handleLikePress}>
            <Ionicons name={checkLike ? "heart" : "heart-outline"} size={45} color={checkLike ? "red" : "white"} />
          </TouchableHighlight>
          <Text style={styles.likeCount}>{likeCount}</Text>
          <Ionicons name="chatbubble-outline" size={40} color="white" />
          <Ionicons name="share-social-outline" size={40} color="white" />
        </View>
      </View>
      <Video
        ref={videoRef}
        style={styles.video}
        source={{ uri: video?.videoUrl }}
        useNativeControls={false}
        resizeMode={ResizeMode.COVER}
        isLooping
        shouldPlay={activeIndex === index}
        onPlaybackStatusUpdate={status => setStatus(() => status)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  video: {
    alignSelf: 'center',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  overlay: {
    position: 'absolute',
    zIndex: 10,
    bottom: 20,
    padding: 20,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'flex-end',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    backgroundColor: Colors.WHITE,
    borderRadius: 99,
  },
  userName: {
    fontFamily: 'outfit',
    color: Colors.WHITE,
    fontSize: 16,
  },
  description: {
    fontFamily: 'outfit',
    color: Colors.WHITE,
    fontSize: 16,
    marginTop: 7,
  },
  actions: {
    display: 'flex',
    gap: 20,
  },
  likeCount: {
    color: Colors.WHITE,
    textAlign: 'center',
    marginTop: -15,
  },
});
