import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, TextInput, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { supabase } from '../../Utils/SupabaseConfig';
import { useUser } from '@clerk/clerk-expo';

export default function OpenChat() {
  const route = useRoute();
  const { name, username, email, profileImage } = route.params;
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const { user } = useUser();
  const flatListRef = useRef(null); // Ref for FlatList

  const fetchMessages = async () => {
    try {
      const userEmail = user.primaryEmailAddress.emailAddress;
      //console.log('Fetching messages for:', userEmail, 'and', email);

      const { data, error } = await supabase.rpc('get_chat_messages', {
        user1: userEmail,
        user2: email,
      });

      if (error) {
        console.error('Error fetching messages:', error);
      } else {
        //console.log('Fetched messages:', data);
        setChatMessages(data);
        // Use requestAnimationFrame to ensure it happens after the FlatList has rendered
        requestAnimationFrame(() => flatListRef.current.scrollToEnd({ animated: false }));
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    fetchMessages();

    const messageListener = supabase
      .channel('Chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'Chat' }, (payload) => {
        const newMessage = payload.new;
        if (
          (newMessage.sender === user.primaryEmailAddress.emailAddress && newMessage.receiver === email) ||
          (newMessage.sender === email && newMessage.receiver === user.primaryEmailAddress.emailAddress)
        ) {
          setChatMessages((prevMessages) => [...prevMessages, newMessage]);
          // Use requestAnimationFrame to ensure it happens after the FlatList has rendered
          requestAnimationFrame(() => flatListRef.current.scrollToEnd({ animated: true }));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(messageListener);
    };
  }, [email]);

  const handleSend = async () => {
    if (message) {
      const { data, error } = await supabase
        .from('Chat')
        .insert([
          {
            sender: user.primaryEmailAddress.emailAddress,
            receiver: email,
            message: message,
            messageType: 'text',
          }
        ]);
      console.log('Message sent:', message);
      setMessage('');

      if (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const renderMessageItem = ({ item }) => (
    <View style={[styles.messageItem, item.sender === user.primaryEmailAddress.emailAddress ? styles.myMessage : styles.theirMessage]}>
      <Text style={item.sender === user.primaryEmailAddress.emailAddress ? styles.myMessageText : styles.theirMessageText}>{item.message}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.header}>
        <Image source={{ uri: profileImage }} style={styles.profileImage} />
        <View style={styles.userInfo}>
          <Text style={styles.username}>{username}</Text>
        </View>
        <View style={styles.callButtons}>
          <TouchableOpacity style={styles.callButton}>
            <Ionicons name="call" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.callButton}>
            <MaterialIcons name="videocam" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        ref={flatListRef} // Set the ref to FlatList
        data={chatMessages}
        keyExtractor={(item) => item.created_at.toString()}
        renderItem={renderMessageItem}
        contentContainerStyle={styles.chatArea}
        onContentSizeChange={() => flatListRef.current.scrollToEnd({ animated: true })}
      />
      <View style={styles.inputArea}>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity style={styles.recordButton} onPress={() => console.log('Record button pressed')}>
          <Ionicons name="mic" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Ionicons name="send" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 30,
    paddingHorizontal: 10,
    paddingBottom: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userInfo: {
    flex: 1,
    marginLeft: 10,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  callButtons: {
    flexDirection: 'row',
  },
  callButton: {
    backgroundColor: '#007AFF',
    borderRadius: 50,
    padding: 10,
    marginLeft: 5,
  },
  chatArea: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    padding: 10,
  },
  messageItem: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    maxWidth: '70%',
  },
  myMessage: {
    backgroundColor: '#007AFF',
    alignSelf: 'flex-end',
    borderTopRightRadius: 0,
  },
  myMessageText: {
    color: 'white'
  },
  theirMessage: {
    backgroundColor: '#e0e0e0',
    alignSelf: 'flex-start',
    borderTopLeftRadius: 0,
  },
  theirMessageText: {
    color: 'black'
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  textInput: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 50,
    padding: 10,
    marginLeft: 5,
  },
  recordButton: {
    backgroundColor: '#007AFF',
    borderRadius: 50,
    padding: 10,
    marginLeft: 5,
  },
});
