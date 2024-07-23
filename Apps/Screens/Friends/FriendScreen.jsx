import React, { useEffect, useState } from 'react';
import { View, Text, SectionList, ActivityIndicator, StyleSheet, TouchableOpacity, Image, TextInput } from 'react-native';
import { supabase } from '../../Utils/SupabaseConfig';
import { AntDesign, Feather, Ionicons } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-expo';

export default function FriendScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingRequests, setPendingRequests] = useState(new Set()); // To track pending requests
  const { user } = useUser();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    // You can implement search functionality here if needed
  };

  const fetchFriends = async () => {
    try {
      const userEmail = user.primaryEmailAddress.emailAddress;
      const { data, error } = await supabase.rpc('get_all_friends_with_status', { user_email: userEmail });

      if (error) {
        throw error;
      }

      const groupedData = data.reduce((acc, item) => {
        const section = item.status === 'accepted' ? 'Friends' : 'Not Friends';
        if (!acc[section]) {
          acc[section] = [];
        }
        acc[section].push(item);
        return acc;
      }, {});

      const sectionsArray = Object.keys(groupedData).map(key => ({
        title: key,
        data: groupedData[key],
      }));

      setSections(sectionsArray);

      // Initialize pending requests state
      const pending = new Set(data.filter(item => item.status === 'pending').map(item => item.email));
      setPendingRequests(pending);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };



  useEffect(() => {
    fetchFriends()
   }, [user]);

  const handleAddOrCancelFriend = async (email, status) => {
    try {
      const userEmail = user.primaryEmailAddress.emailAddress;

      if (status === 'pending') {
        // Cancel the friend request
        const { error } = await supabase
          .from('Friendship')
          .delete()
          .match({ Sender: userEmail, Receiver: email, status: 'pending' });

        if (error) {
          throw error;
        }

        // Update state
        setPendingRequests(prev => {
          const newPendingRequests = new Set(prev);
          newPendingRequests.delete(email);
          return newPendingRequests;
        });

        alert(`Friend request to ${email} canceled`);
      } else {
        // Send a new friend request
        const { error } = await supabase
          .from('Friendship')
          .insert([{ Sender: userEmail, Receiver: email, status: 'pending' }]);

        if (error) {
          throw error;
        }

        // Update state
        setPendingRequests(prev => new Set(prev).add(email));

        // alert(`Friend request sent to ${email}`);
      }
    } catch (error) {
      console.error('Error handling friend request:', error.message);
    }
  };

  const handleAcceptRequest = async (email) => {
    try {
      const userEmail = user.primaryEmailAddress.emailAddress;

      const { error } = await supabase
        .from('Friendship')
        .update({ status: 'accepted' })
        .match({ Sender: email, Receiver: userEmail, status: 'pending' });

      if (error) {
        throw error;
      }

      //alert(`Friend request from ${email} accepted`);

      // Refresh the friend list
      fetchFriends();
    } catch (error) {
      console.error('Error accepting friend request:', error.message);
    }
  };

  const handleDeclineRequest = async (email) => {
    try {
      const userEmail = user.primaryEmailAddress.emailAddress;

      const { error } = await supabase
        .from('Friendship')
        .delete()
        .match({ Sender: email, Receiver: userEmail, status: 'pending' });

      if (error) {
        throw error;
      }

      alert(`Friend request from ${email} declined`);

      // Refresh the friend list
      fetchFriends();
    } catch (error) {
      console.error('Error declining friend request:', error.message);
    }
  };

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

  return (
    <View style={styles.container}>
      <TouchableOpacity style={{ position: 'absolute', padding: 20, marginTop: 7 }}
                          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={30} color="black" />
        </TouchableOpacity>
      <View style={{alignItems:'center',padding:5}}>
         <Text style={{
          fontFamily:'outfit-bold',
          fontSize:25
         }}
         >Friends</Text>
         </View>
         <TextInput
          style={styles.textInput}
          placeholder="Search username..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch} // Handle search on submit
        />
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item.email + index}
        renderItem={({ item, section }) => (
          <View style={styles.friendItem}>
            <View style={{flexDirection:'row', display:'flex', gap:10}}>
            <View>
              <Image 
                source={{ uri: item.profileimage }} 
                style={styles.profileImage} 
                onError={(e) => console.error('Error loading image', e.nativeEvent.error)}
              />
            </View>
            <View>
              <Text style={styles.name}>{item.name}</Text>
              <Text numberOfLines={1} style={styles.username}>{item.username}</Text>
              {/* <Text style={styles.status}>Status: {item.sender}</Text> */}
            </View>
            </View>
            {/* {section.title === 'Not Friends'  &&  (
             
            )} */}
            {section.title === 'Not Friends' && item.status === 'pending' && item.sender !== user.primaryEmailAddress.emailAddress ? (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.acceptButton]}
                  onPress={() => handleAcceptRequest(item.email)}
                >
                  <Feather name='check' size={20} color={'#fff'} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.declineButton]}
                  onPress={() => handleDeclineRequest(item.email)}
                >
                  <Ionicons name='close' size={20} color={'#fff'} />
                </TouchableOpacity>
              </View>
            ): item.status === 'accepted'?(
              <View></View>
            ):( <TouchableOpacity
              style={styles.button}
              onPress={() => handleAddOrCancelFriend(item.email, pendingRequests.has(item.email) ? 'pending' : 'not_friend')}
            >
              <AntDesign name={pendingRequests.has(item.email) ? 'close' : 'adduser'} size={24} color="blue" />
              <Text style={styles.buttonText}>
                {pendingRequests.has(item.email) ? 'Pending' : 'Add'}
              </Text>
            </TouchableOpacity>)
          }
          </View>
        )}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.header}>
            <Text style={styles.headerText}>{title}</Text>
          </View>
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
  friendItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    flexDirection: 'row',
    justifyContent:'space-between',
    gap: 15,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  username: {
    width:150,
    fontSize: 16,
    color: '#555',
  },
  status: {
    fontSize: 14,
    color: '#888',
  },
  header: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerText: {
    fontSize: 22,
    fontFamily: 'outfit-bold',
  },
  button: {
    padding: 10,
    alignItems: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize:12,
    marginLeft: 5,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ddd', // Placeholder background color
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    display:'flex',
    justifyContent:'center',
    alignItems:'center'
  },
  acceptButton: {
    backgroundColor: 'green',
    padding: 5,
    borderRadius: 5,

  },
  declineButton: {
    backgroundColor: 'red',
    padding: 5,
    borderRadius: 5,
  },
  textInput: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 10,
    marginTop: 10,
    borderRadius: 30,
  },
});
