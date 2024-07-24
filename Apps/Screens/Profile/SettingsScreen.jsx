import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useUser, useAuth } from '@clerk/clerk-expo'; // Import useAuth here
import { supabase } from '../../Utils/SupabaseConfig';

const settingsOptions = [
  { title: 'Change Password', screen: 'change-password' },
  { title: 'Set Time Limit', screen: 'time-control' },
];

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { user } = useUser();
  const { signOut } = useAuth(); // Use useAuth inside the component
  const [username, setUsername] = useState('');
  const [isEditingUsername, setIsEditingUsername] = useState(false);

  useEffect(() => {
    const fetchUsername = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('Users')
          .select('username')
          .eq('email', user.primaryEmailAddress.emailAddress)
          .single(); // Fetch a single user record

        if (error) {
          console.error('Error fetching username:', error);
        } else {
          setUsername(data?.username || '');
        }
      }
    };

    fetchUsername();
  }, [user]);

  const handleSaveUsername = async () => {
    if (!username) {
      Alert.alert('Username cannot be empty');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('Users')
        .update({ username })
        .eq('email', user.primaryEmailAddress.emailAddress);

      if (error) {
        throw error;
      }

      setIsEditingUsername(false);
      Alert.alert('Username updated successfully');
    } catch (error) {
      Alert.alert('Error updating username', error.message);
    }
  };

  const handleNavigate = (screen) => {
    navigation.navigate(screen);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      console.log("User logged out");
    } catch (error) {
      console.error('Error logging out:', error.message);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.option} onPress={() => handleNavigate(item.screen)}>
      <Text style={styles.optionText}>{item.title}</Text>
      <Ionicons name="chevron-forward" size={20} color="black" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={{ paddingLeft: 15, marginTop: 35, paddingRight: 5, position: 'absolute' }}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={25} color="black" />
      </TouchableOpacity>
      <View style={styles.header}>
        <Text style={styles.headerText}>Settings</Text>
      </View>
      
      <View style={styles.usernameContainer}>
        {isEditingUsername ? (
          <>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter new username"
            />
            <TouchableOpacity style={styles.button} onPress={handleSaveUsername}>
              <Text style={styles.buttonText}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsEditingUsername(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.usernameLabel}>Username</Text>
            <Text style={styles.usernameValue}>{username}</Text>
            <TouchableOpacity onPress={() => setIsEditingUsername(true)}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <FlatList
        data={settingsOptions}
        keyExtractor={(item) => item.title}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 5,
  },
  headerText: {
    fontFamily: 'outfit-bold',
    fontSize: 30,
  },
  usernameContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 10,
  },
  usernameLabel: {
    fontSize: 16,
    fontFamily: 'outfit-bold',
    marginBottom: 5,
  },
  usernameValue: {
    fontSize: 16,
    fontFamily: 'outfit',
    color: '#555',
    marginBottom: 10,
  },
  editText: {
    fontSize: 16,
    color: '#007AFF',
  },
  input: {
    width: '100%',
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#fff',
    marginBottom: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'outfit-bold',
    textAlign: 'center',
  },
  cancelText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 10,
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'outfit-bold',
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 10,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'outfit-bold',
  },
});
