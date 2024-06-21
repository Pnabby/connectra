import { View, Text, Image } from 'react-native'
import React from 'react'
import Colors from '../../Utils/Colors'

export default function VideoThumbnailItem({video}) {
  return (
    <View style={{flex:1,margin:5}}>
        <View style={{position:'absolute',zIndex:10,bottom:0,padding:5}}>
            <View style={{display:'flex',flexDirection:'row',alignItems:'center',gap:5}}>
                <Image source={{uri:video.Users?.profileImage}}
                style={{width:30,height:30,backgroundColor:Colors.WHITE,borderRadius:99}}
                />
                <Text style={{color:Colors.WHITE,
                    fontFamily:'outfit',fontSize:12
                }}>{video?.Users?.username}</Text>
            </View>
        </View>
      <Image source={{uri:video?.thumbnail}}
        style = {{width:'100%',height:250,borderRadius:10}}
      />
    </View>
  )
}