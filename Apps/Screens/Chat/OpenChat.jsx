import React from 'react';
import { View, Text, Image } from 'react-native';
import { useRoute } from '@react-navigation/native';

export default function OpenChat() {
  const route = useRoute();
  const { name, username, email, profileImage } = route.params;

  return (
    <View style={{marginTop:20}}>
      <Text>Name: {name}</Text>
      <Text>Username: {username}</Text>
      <Text>Email: {email}</Text>
      <Image source={{ uri: profileImage }} style={{ width: 50, height: 50 }} />
      {/* Add more UI for the chat screen here */}
    </View>
  );
}
