import React, { useEffect, useState } from 'react';
import { View, Text, SectionList, ActivityIndicator, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { supabase } from '../../Utils/SupabaseConfig';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-expo';

export default function FriendScreen({navigation}) {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pendingRequests, setPendingRequests] = useState(new Set()); // To track pending requests
  const { user } = useUser();

  useEffect(() => {
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

    fetchFriends();
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

        alert(`Friend request sent to ${email}`);
      }
    } catch (error) {
      console.error('Error handling friend request:', error.message);
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
      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item.email + index}
        renderItem={({ item, section }) => (
          <View style={styles.friendItem}>
            <View>
              <Image 
                source={{ uri: item.profileimage }} 
                style={styles.profileImage} 
                onError={(e) => console.error('Error loading image', e.nativeEvent.error)}
              />
            </View>
            <View>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.username}>{item.username}</Text>
              {/* <Text style={styles.status}>Status: {item.status}</Text> */}
            </View>
            {section.title === 'Not Friends' && (
              <TouchableOpacity
                style={styles.button}
                onPress={() => handleAddOrCancelFriend(item.email, pendingRequests.has(item.email) ? 'pending' : 'not_friend')}
              >
                <AntDesign name={pendingRequests.has(item.email) ? 'close' : 'adduser'} size={24} color="blue" />
                <Text style={styles.buttonText}>
                  {pendingRequests.has(item.email) ? 'Cancel' : 'Add'}
                </Text>
              </TouchableOpacity>
            )}
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
    //borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    flexDirection: 'row',
    gap:15
    //justifyContent: 'space-between',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  username: {
    fontSize: 16,
    color: '#555',
  },
  status: {
    fontSize: 14,
    color: '#888',
  },
  header: {
    padding: 10,
    //backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  headerText: {
    fontSize: 22,
    fontFamily:'outfit-bold'
  },
  button: {
    padding: 10,
    alignItems: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    fontWeight: 'bold',
    marginLeft: 5,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ddd', // Placeholder background color
  },
});
