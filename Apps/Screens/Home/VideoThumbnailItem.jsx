import { View, Text, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import Colors from '../../Utils/Colors'
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';


export default function VideoThumbnailItem({video}) {
  const trimText = (text, maxLength = 10) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };
  const navigation=useNavigation();
  return (
    <TouchableOpacity style={{flex:1,margin:5}}
    onPress={()=>navigation.navigate('play-video',{
      selectedVideo:video
    })}
    >
      <>
        <View style={{position:'absolute',zIndex:10,bottom:0,padding:5,
          display:'flex',flexDirection:'row',justifyContent:'space-between',width:'100%'
        }}>
            <View style={{display:'flex',flexDirection:'row',alignItems:'center',gap:5}}>
                <Image source={{uri:video?.Users?.profileImage}}
                style={{width:30,height:30,backgroundColor:Colors.WHITE,borderRadius:99}}
                />
                <Text style={{color:Colors.WHITE,
                    fontFamily:'outfit',fontSize:12
                }}>{trimText(video?.Users?.name)}</Text>
            </View>
            <View style={{display:'flex',flexDirection:'row',alignItems:'center',gap:3}}>
              <Text style={{fontFamily:'outfit',
                fontSize:12,color:Colors.WHITE
              }}>{video?.VideoLikes?.length}</Text>
              <Ionicons name="heart-outline" size={24} color="white" />
            </View>
        </View>
      <Image source={{uri:video?.thumbnail}}
        style = {{width:'100%',height:250,borderRadius:10}}
      />
      </>
    </TouchableOpacity>
  )
}