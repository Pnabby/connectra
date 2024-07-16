import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useUser } from '@clerk/clerk-expo';
import { supabase } from '../../Utils/SupabaseConfig';

export default function TimeControl() {
  const [timeLimit, setTimeLimit] = useState(0); // initial time limit in minutes
  const [logoutDuration, setLogoutDuration] = useState(0); // initial logout duration in minutes
  const { user } = useUser();

  const addTime = async () => {
    try {
      const { data, error } = await supabase
        .from('UserTimeSettings')
        .insert([
          { timeLimit: timeLimit, breakTime: logoutDuration, email: user.primaryEmailAddress.emailAddress },
        ])
        .select();

      if (error) {
        console.log(error);
        return;
      }

      Alert.alert(
        "Time Limit Set",
        `Your screen time limit is set to ${timeLimit} minutes with a logout duration of ${logoutDuration} minutes.`,
        [{ text: "OK" }]
      );
      
      console.log('done');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Time Control</Text>
      </View>
      <View style={styles.contentContainer}>
        <Image 
          source={require('./../../../assets/images/time.png')}
          style={styles.image}
        />
        <Text style={styles.descriptionText}>
          Easily adjust your screen time limit to the setting that best fits you.
        </Text>
        <View style={styles.pickerContainer}>
          {timeLimit > 0 ? (
            <Text style={styles.timeText}>{timeLimit} minutes</Text>
          ) : (
            <Text style={styles.timeText}>None</Text>
          )}
          <Picker
            selectedValue={timeLimit}
            style={styles.picker}
            onValueChange={(itemValue) => setTimeLimit(itemValue)}
          >
            <Picker.Item label="None" value={0} />
            <Picker.Item label="3 minutes" value={3} />
            <Picker.Item label="15 minutes" value={15} />
            <Picker.Item label="30 minutes" value={30} />
            <Picker.Item label="45 minutes" value={45} />
            <Picker.Item label="60 minutes" value={60} />
            <Picker.Item label="90 minutes" value={90} />
            <Picker.Item label="120 minutes" value={120} />
          </Picker>
        </View>
        <Text style={styles.descriptionText}>
          Select the duration for which you would like to be logged out.
        </Text>
        <View style={styles.pickerContainer}>
          {logoutDuration > 0 ? (
            <Text style={styles.timeText}>{logoutDuration} minutes</Text>
          ) : (
            <Text style={styles.timeText}>None</Text>
          )}
          <Picker
            selectedValue={logoutDuration}
            style={styles.picker}
            onValueChange={(itemValue) => setLogoutDuration(itemValue)}
          >
            <Picker.Item label="None" value={0} />
            <Picker.Item label="5 minutes" value={5} />
            <Picker.Item label="10 minutes" value={10} />
            <Picker.Item label="15 minutes" value={15} />
            <Picker.Item label="30 minutes" value={30} />
            <Picker.Item label="60 minutes" value={60} />
          </Picker>
        </View>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: (timeLimit === 0 && logoutDuration === 0) ? '#ccc' : '#007BFF' },
          ]}
          onPress={addTime}
          disabled={timeLimit === 0 && logoutDuration === 0}
        >
          <Text style={styles.buttonText}>Set Time Limit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 30,
    fontFamily: 'outfit-bold',
  },
  contentContainer: {
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: 150,
    height: 150,
  },
  descriptionText: {
    fontFamily: 'outfit',
    fontSize: 20,
    textAlign: 'center',
    marginVertical: 20,
  },
  pickerContainer: {
    width: '80%',
    alignItems: 'center',
    marginVertical: 10,
  },
  timeText: {
    fontFamily: 'outfit',
    fontSize: 20,
    marginBottom: 10,
  },
  picker: {
    width: '100%',
  },
  button: {
    marginTop: 20,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'outfit',
  },
});
