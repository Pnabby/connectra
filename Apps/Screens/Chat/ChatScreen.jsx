import React, { useState } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';

const ChatScreen = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const sendMessage = () => {
    if (message.trim()) {
      setMessages(prevMessages => [...prevMessages, { id: Date.now().toString(), text: message, isSentByMe: true }]);
      setMessage('');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.messageContainer, item.isSentByMe ? styles.sentMessage : styles.receivedMessage]}>
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={styles.messagesList}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesList: {
    padding: 10,
  },
  messageContainer: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 20,
    maxWidth: '80%',
  },
  sentMessage: {
    backgroundColor: '#007BFF',
    alignSelf: 'flex-end',
  },
  receivedMessage: {
    backgroundColor: '#f0f0f0',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 16,
    color: 'white',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  textInput: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  sendButton: {
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007BFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default ChatScreen;
