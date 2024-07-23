import React, { useRef, useState, useEffect } from 'react';
import { Text, View, StyleSheet, Dimensions, Image, TouchableHighlight, Modal, FlatList, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import Colors from '../../Utils/Colors';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from "../../Utils/SupabaseConfig";

export default function PlayVideoListItem({ video, activeIndex, index, userLikeHandler, user, navigation }) {
  const videoRef = useRef(null);
  const commentInputRef = useRef(null);
  const [status, setStatus] = useState({});
  const [checkLike, setCheckLike] = useState(false);
  const [likeCount, setLikeCount] = useState(video?.VideoLikes?.length || 0);
  const [comments, setComments] = useState(video?.VideoComments || []);
  const [newComment, setNewComment] = useState('');
  const [showCommentModal, setShowCommentModal] = useState(false);

  useEffect(() => {
    // Check if the user has already liked the video on mount
    setCheckLike(!!video.VideoLikes?.find(item => item.userEmail === user.primaryEmailAddress.emailAddress));
  }, [video]);

  const handleLikePress = async () => {
    // Optimistically update the like state and count
    setCheckLike(prev =>!prev);
    setLikeCount(prevCount => checkLike? prevCount - 1 : prevCount + 1);

    const isLike = checkLike;
    await userLikeHandler(video, isLike);
  };

  const handleCommentPress = () => {
    setShowCommentModal(true);
  };

  const handleCommentChange = text => {
    setNewComment(text);
  };

  const handleCommentSubmit = async () => {
    if (newComment.trim()!== '') {
      const newCommentObj = {
        text: newComment,
        userEmail: user.primaryEmailAddress.emailAddress,
        userName: user.name,
        userProfileImage: user.profileImage,
      };
      setComments(prevComments => [...prevComments, newCommentObj]);
      setNewComment('');
      await addCommentHandler(video, newCommentObj);
    }
  };

  const handleCommentModalClose = () => {
    setShowCommentModal(false);
  };

  const addCommentHandler = async (video, newCommentObj) => {
    const { data, error } = await supabase
        .from('Comments')
        .insert([{ video_id: video.id, text: newCommentObj.text, user_email: newCommentObj.userEmail, user_name: newCommentObj.userName, user_profile_image: newCommentObj.userProfileImage }]);
    if (error) {
      console.error(error);
    } else {
      console.log('Comment inserted successfully!');
    }
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
              <Ionicons name={checkLike? "heart" : "heart-outline"} size={45} color={checkLike? "red" : "white"} />
            </TouchableHighlight>
            <Text style={styles.likeCount}>{likeCount}</Text>
            <TouchableHighlight onPress={handleCommentPress}>
              <Ionicons name="chatbubble-outline" size={40} color="white" />
            </TouchableHighlight>
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
        <Modal visible={showCommentModal} animationType="slide" onRequestClose={handleCommentModalClose}>
          <View style={styles.commentsContainer}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios'? 'padding' : 'height'} style={{ flex: 1 }}>
              <FlatList
                  data={comments}
                  renderItem={({ item }) => (
                      <View style={styles.commentContainer}>
                        <View style={styles.card}>
                          <Image source={{ uri: item.userProfileImage }} style={styles.commentProfileImage} />
                          <View style={styles.commentTextContainer}>
                            <Text style={styles.commentText}>{item.text}</Text>
                            <Ionicons name="heart" size={20} color="red" /> {/* add a heart icon */}
                          </View>
                        </View>
                      </View>
                  )}
                  keyExtractor={(item, index) => `comment-${index}`}
              />
              <View style={styles.newCommentContainer}>
                <TextInput
                    ref={commentInputRef}
                    style={styles.newCommentInput}
                    value={newComment}
                    onChangeText={handleCommentChange}
                    placeholder="Add a comment..."
                />
                <TouchableHighlight onPress={handleCommentSubmit}>
                  <Ionicons name="send" size={30} color="white" />
                </TouchableHighlight>
              </View>
            </KeyboardAvoidingView>
          </View>
          <TouchableHighlight onPress={handleCommentModalClose}>
            <Text style={styles.closeModal}>Close</Text>
          </TouchableHighlight>
        </Modal>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.WHITE,
  },
  description: {
    fontSize: 16,
    color: Colors.WHITE,
    marginTop: 10,
  },
  actions: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    gap:10
  },
  likeCount: {
    fontSize: 18,
    color: Colors.WHITE,
    marginLeft: 10,
  },
  commentsContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.WHITE,
  },
  commentContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  card: {
    backgroundColor: Colors.WHITE,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  commentProfileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  commentTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  commentUsername: {
    fontFamily: 'OpenSans-Bold',
    fontSize: 18,
    fontWeight: 'bold',
  },
  commentText: {
    fontFamily: 'OpenSans-Regular',
    fontSize: 16,
  },
  newCommentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  newCommentInput: {
    flex: 1,
    height: 40,
    borderColor: Colors.GRAY,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  closeModal: {
    fontSize: 18,
    color: Colors.WHITE,
    padding: 10,
  },
});