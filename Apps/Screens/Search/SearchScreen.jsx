import React, { useState } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../Utils/Colors';
import { supabase } from '../../Utils/SupabaseConfig'; // Ensure this import points to your actual Supabase config file

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]); // State to store search results
  const navigation = useNavigation();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return; // Avoid empty search

    try {
      const { data, error } = await supabase
        .from('PostList')
        .select('id, thumbnail, description, emailRef, Users:emailRef!inner(username)') // Select necessary fields
        .or(`description.ilike.%${searchQuery}%, emailRef.ilike.%${searchQuery}%`); // Query based on description or email

      if (error) {
        console.error('Search error:', error.message);
      } else {
        setResults(data);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const truncateText = (text, maxWords) => {
    const wordsArray = text.split(' ');
    if (wordsArray.length <= maxWords) return text;
    return wordsArray.slice(0, maxWords).join(' ') + '...';
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.textInput}
        placeholder="Search username or description..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmitEditing={handleSearch} // Handle search on submit
      />
      <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
        <Ionicons name="search-sharp" size={30} color="black" />
        <Text style={{ fontSize: 16, fontFamily: 'outfit' }}>Search</Text>
      </TouchableOpacity>

      {/* Display search results */}
      <FlatList
        style={{zIndex: -1,marginTop:20}}
        data={results}
        keyExtractor={(item) => item.id.toString()} // Ensure unique keys
        numColumns={2} // Display 2 items per row
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.resultItem} onPress={() => navigation.navigate('VideoDetail', { videoId: item.id })}>
            <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
            <View style={styles.resultTextContainer}>
              <Text style={styles.resultDescription} numberOfLines={1}>{truncateText(item.description,15)}</Text>
              <Text style={styles.resultEmail} numberOfLines={1}>{truncateText(item.Users.username,15)}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

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
  resultItem: {
    width:'50%',
    height:300,
    flexDirection: 'column',
    padding: 5,
    //borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    alignItems: 'center',
  },
  thumbnail: {
    width: '100%',
    height: 250,
    borderRadius: 5,
    marginRight: 10,
  },
  resultTextContainer: {
    flex: 1,
    alignItems:'flex-start',
    alignContent:'flex-start',
    alignSelf:'flex-start'
  },
  resultDescription: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultEmail: {
    fontSize: 14,
    color: '#555',
  },
});

export default SearchScreen;
