import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, TouchableOpacity, TextInput, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../Utils/SupabaseConfig'; // Adjust path as necessary
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';

export default function ChatScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useUser(); // Get current user's email
  const navigation = useNavigation();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
  }

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const userEmail = user.primaryEmailAddress.emailAddress;
        const { data, error } = await supabase.rpc('get_all_friends', { user_email: userEmail });
        
        if (error) {
          throw error;
        }

        setFriends(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  const handleChatPress = (friend) => {
    navigation.navigate('OpenChat', {
      name: friend.name,
      username: friend.username,
      email: friend.email,
      profileImage: friend.profileimage
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Chat</Text>
      </View>
      <View>
        <TextInput
          style={styles.textInput}
          placeholder="Search username..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch} // Handle search on submit
        />
      </View>
      <FlatList
        data={friends}
        keyExtractor={(item) => item.username} // Ensure unique identifier
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.friendItem} onPress={() => handleChatPress(item)}>
            <Image 
              source={{ uri: item.profileimage }} 
              style={styles.profileImage} 
              onError={(e) => console.error('Error loading image', e.nativeEvent.error)}
            />
            <View style={styles.friendInfo}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.username}>{item.username}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    paddingTop: 5,
  },
  headerText: {
    fontFamily: 'outfit-bold',
    fontSize: 30,
  },
  textInput: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 10,
    marginTop: 20,
    borderRadius: 30,
  },
  friendItem: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  friendInfo: {
    marginLeft: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  username: {
    fontSize: 16,
    color: '#555',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ddd', // Placeholder background color
  },
});
