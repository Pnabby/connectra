import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Image } from 'react-native';
import React, { useState } from 'react';
import { supabase } from '../../Utils/SupabaseConfig';
import Colors from '../../Utils/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-expo';

export default function FindFriendsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const { user } = useUser();

  const searchFriend = async () => {
    if (!searchQuery.trim()) return; // Avoid empty search

    try {
      const { data, error } = await supabase
        .from('Users')
        .select('username, profileImage')
        .ilike('username', `%${searchQuery}%`)
        .not('email', 'in', [
          supabase
            .from('Friendship')
            .select('sender')
            .eq('receiver', user.email)
            .eq('status', 'accepted'),
          supabase
            .from('Friendship')
            .select('receiver')
            .eq('sender', user.email)
            .eq('status', 'accepted')
        ])
        .neq('email', user.email);

      if (error) {
        console.error('Error fetching non-friends:', error.message);
      } else {
        setResults(data);
        console.log(data);
      }
    } catch (error) {
      console.error('Error fetching non-friends:', error.message);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.resultItem}>
      <Image source={{ uri: item.profileImage }} style={styles.profileImage} />
      <Text style={styles.username}>{item.username}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.textInput}
        placeholder="Search username..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={searchFriend} // Handle search on submit
      />
      <TouchableOpacity style={styles.searchButton} onPress={searchFriend}>
        <Ionicons name="search-sharp" size={30} color="black" />
        <Text style={{ fontSize: 16, fontFamily: 'outfit' }}>Search</Text>
      </TouchableOpacity>

      <FlatList
        data={results}
        keyExtractor={(item) => item.username}
        renderItem={renderItem}
        style={styles.resultsList}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
  searchButton: {
    padding: 5,
    height: 45,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.BLUE,
    gap: 10,
  },
  resultsList: {
    marginTop: 20,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  username: {
    fontSize: 18,
  },
});
