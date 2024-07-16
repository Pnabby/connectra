import { View, Text } from 'react-native'
import React from 'react'
import { TouchableOpacity } from 'react-native-gesture-handler';

export default function MyFriendsScreen() {
  const calculateTimeDifference = (startTime) => {
    const start = new Date(startTime);
    const end = new Date(); // Current date and time
  
    const diff = end - start;
  
    const seconds = Math.floor((diff / 1000) % 60);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
    return { days, hours, minutes, seconds };
  };
  
  // Example usage:
  const startTime = '2024-07-04T10:00:00';
  const timeDifference = calculateTimeDifference(startTime);
  console.log(timeDifference);
  return (
    <View>
      <Text>MyFriendsScreen</Text>
      <TouchableOpacity onPress={()=>{console.log(calculateTimeDifference(startTime))}}>
          <Text>Press</Text>
      </TouchableOpacity>
    </View>
  )
}