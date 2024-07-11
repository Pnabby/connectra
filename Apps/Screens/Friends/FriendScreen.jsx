import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../Utils/Colors';
import MyFriendsScreen from './MyFriendsScreen';
import FindFriendsScreen from './FindFriendsScreen';

const FriendScreen = () => {
  const navigation = useNavigation();
  const [isSelected,setIsSelected]= useState(true)

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headstyle}>Friends</Text>
      </View>
      <View style={{flexDirection:'row',alignContent:'flex-end',justifyContent:'space-around',alignItems:'baseline'}}>
        <TouchableOpacity onPress={
            ()=>setIsSelected(true)
            }>
            <Text style={{
                color: isSelected?Colors.BLUE:Colors.BLACK,
                fontSize: isSelected?20:18,
                fontFamily: isSelected?'outfit-bold':'outfit'
            }}>My Friends</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={
            ()=>setIsSelected(false)
            }>
            <Text style={{
                color: !isSelected?Colors.BLUE:Colors.BLACK,
                fontSize: !isSelected?20:18,
                fontFamily: !isSelected?'outfit-bold':'outfit'
            }}>Find Friends</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={()=>navigation.goBack()} style={{
        position:'absolute',
        marginTop:40,
        marginLeft:10
      }}>
        <Ionicons name="arrow-back-outline" size={30} color="black" />
      </TouchableOpacity>
      {isSelected?<MyFriendsScreen/>:<FindFriendsScreen/>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  header: {
    marginTop: 20,
    marginBottom:20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  headstyle: {
    fontSize: 25,
    fontFamily: 'outfit-bold',
  },
  listContainer: {
    paddingTop: 20,
  },
  requestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  requestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 18,
    fontFamily: 'outfit',
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  acceptButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  declineButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontFamily: 'outfit-bold',
  },
});

export default FriendScreen;
