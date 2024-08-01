import React, { useRef, useState, useEffect } from 'react';
import { Text, View, StyleSheet, Dimensions, Image, TouchableHighlight, Modal, FlatList, TextInput, KeyboardAvoidingView, TouchableOpacity, Platform, TouchableWithoutFeedback } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import Colors from '../../Utils/Colors';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from "../../Utils/SupabaseConfig";
import * as Sharing from 'expo-sharing';


export default function PlayVideoListItem({ video, activeIndex, index, userLikeHandler, user, navigation }) {
  const videoRef = useRef(null);
  const commentInputRef = useRef(null);
  const [status, setStatus] = useState({});
  const [checkLike, setCheckLike] = useState(false);
  const [likeCount, setLikeCount] = useState(video?.VideoLikes?.length || 0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(activeIndex === index); // Track if video is playing
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

  const handleCommentPress = () => {
    setShowCommentModal(true);
    getComments();

  };

  const handleCommentChange = text => {
    setNewComment(text);
  };

  const handleCommentSubmit = async () => {
    //console.log('running')
    if (newComment != ''){
      const { data, error } = await supabase
      .from('Comments')
      .insert([{ postIdRef: video.id, text: newComment, userEmail: user.primaryEmailAddress.emailAddress}]);
    if (error) {
      console.error(error);
    } else {
      setNewComment('')
      getComments();
      console.log('Comment inserted successfully!');
    }
    }
    
  };

  const getComments = async () => {
    try {
      const { data, error } = await supabase
        .from('Comments')
        .select(`
          id,
          text,
          Users (
            username,
            email,
            profileImage
          )
        `)
        .eq('postIdRef', video.id);
  
      if (error) {
        console.error("Error fetching comments with user details:", error);
        return null;
      }
      console.log(data)
      setComments(data)
      
      return data;
    } catch (error) {
      console.error("Unexpected error fetching comments with user details:", error);
      return null;
    }
  };

  const handleDeleteComment = async (comment) => {
    try {
      const { data, error } = await supabase
        .from('Comments')
        .delete()
        .eq('id', comment.id); // Assuming each comment has a unique 'id'
  
      if (error) {
        console.error('Error deleting comment:', error);
      } else {
        console.log('Comment deleted successfully!');
        setComments(comments.filter(c => c.id !== comment.id)); // Update state to remove the deleted comment
      }
    } catch (error) {
      console.error('Unexpected error deleting comment:', error);
    }
  };
  

  const handleCommentModalClose = () => {
    setShowCommentModal(false);
  };

  const handleSharePress = async () => {
    const message = `Check out this video: ${video.videoUrl}`;
    const result = await Sharing.shareAsync({
      message,
      url: video.videoUrl,
      title: video.title,
    });

    if (result.action === Sharing.sharedAction) {
      console.log('Shared successfully!');
    } else {
      console.log('Share cancelled');
    }
  };

  const togglePlayback = async () => {
    if (isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <View style={{ height: Dimensions.get('window').height }}>
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
          <TouchableHighlight onPress={handleCommentPress}>
            <Ionicons name="chatbubble-outline" size={40} color="white" />
          </TouchableHighlight>
          <TouchableHighlight onPress={handleSharePress}>
            <Ionicons name="share-social-outline" size={40} color="white" />
          </TouchableHighlight>
        </View>
      </View>
      <TouchableWithoutFeedback onPress={togglePlayback}>
        <Video
          ref={videoRef}
          style={styles.video}
          source={{ uri: video?.videoUrl }}
          useNativeControls={false}
          resizeMode={ResizeMode.COVER}
          isLooping
          shouldPlay={activeIndex === index && isPlaying}
          onPlaybackStatusUpdate={status => setStatus(() => status)}
        />
      </TouchableWithoutFeedback>
      <Modal visible={showCommentModal} animationType="slide" onRequestClose={handleCommentModalClose} transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.commentsContainer}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <View style={styles.modalHeader}>
              <Text style={styles.headerText}>Comments</Text>
              <TouchableOpacity style={styles.closeButton} onPress={handleCommentModalClose}>
                <Ionicons name="close-sharp" size={24} color="black" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={comments}
              renderItem={({ item }) => (
                <View style={styles.commentContainer}>
                  <View style={styles.card}>
                    <Image source={{ uri: item.Users.profileImage }} style={styles.commentProfileImage} />
                    <View style={styles.commentTextContainer}>
                      <Text style={styles.commentUsername}>{item.Users.username}</Text>
                      <Text style={styles.commentText}>{item.text}</Text>
                    </View>
                    {item.Users.email === user.primaryEmailAddress.emailAddress && (
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteComment(item)}
                      >
                        <Ionicons name="trash-outline" size={24} color="red" />
                      </TouchableOpacity>
                    )}
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
                <TouchableOpacity onPress={handleCommentSubmit} style={styles.sendButton}>
                  <Ionicons name="send" size={30} color="blue" />
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  video: {
    alignSelf: 'center',
    width: Dimensions.get('window').width,
    height: Dimensions.get('screen').height,
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
    gap: 10,
  },
  likeCount: {
    fontSize: 18,
    color: Colors.WHITE,
    marginLeft: 10,
  },
  modalContainer: {
    marginBottom: 49,
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  commentsContainer: {
    width: '100%',
    height: '60%', // Adjust height to be slightly less than 50%
    backgroundColor: Colors.WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  commentContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: -10,
  },
  card: {
    flexDirection:'row',
    backgroundColor: Colors.WHITE,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  commentProfileImage: {
    width: 45,
    height: 45,
    borderRadius: 30,
    marginRight: 10,
  },
  commentTextContainer: {
    flex: 1,
    marginLeft: 10,
  },
  commentUsername: {
    fontFamily: 'outfit-bold',
    fontSize: 18,
    //fontWeight: 'bold',
  },
  commentText: {
    fontFamily: 'outfit',
    fontSize: 16,
  },
  newCommentContainer: {
    gap:10,
    flexDirection: 'row',
    alignItems:'center',
    justifyContent:'space-between',
    padding: 10,
  },
  newCommentInput: {
    flex: 1,
    height: 40,
    borderColor: Colors.GRAY,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginRight: 10, // Add some margin to separate the input from the send button
  },
  sendButton: {
    backgroundColor: Colors.PRIMARY, // Add a background color to the button
    //padding: 5,
    borderRadius: 10,
    marginRight: -20,
  },
  closeModal: {
    fontSize: 18,
    color: Colors.WHITE,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Space between title and button
    borderBottomWidth: 1,
    borderBottomColor: Colors.GRAY,
    paddingBottom: 10,
    marginBottom: 10,
    width: '100%', // Ensure it takes the full width
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1, // Takes up space and pushes close button to the right
    textAlign: 'center', // Center the text
  },
  closeButton: {
    padding: 10,
    backgroundColor: 'transparent', // Make button background transparent
  },
  deleteButton: {
    marginLeft: 10,
    padding: 5,
  },
});
