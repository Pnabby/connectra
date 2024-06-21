import {View, Text, TextInput, KeyboardAvoidingView, ScrollView, TouchableOpacity,Image} from 'react-native'
import React, {useEffect, useState} from 'react'
import {useNavigation, useRoute} from "@react-navigation/native";
import Colors from "../../Utils/Colors";
import { Ionicons } from '@expo/vector-icons';
import { s3bucket } from '../../Utils/S3BucketConfig';
import {useUser} from "@clerk/clerk-expo";
import { supabase } from '../../Utils/SupabaseConfig';

export default function PreviewScreen() {
    const { user } = useUser();
    const email = user?.primaryEmailAddress.emailAddress;
    const params=useRoute().params
    const navigation=useNavigation();
    const [description, setDescription]= useState();
    const [videoUrl,setVideoUrl]=useState();
    const [thumbnailUrl, setThumbnailUrl] = useState();

    useEffect(()=>{
        console.log(params)
    },[]);
    const publishHandler= async()=>{
        try {
            const videoUploadResp = await UploadFileToAws(params.video, 'video');
            const thumbnailUploadResp = await UploadFileToAws(params.thumbnail, 'image');

            if (videoUploadResp?.Location && thumbnailUploadResp?.Location) {
                const { data, error } = await supabase
                    .from('PostList')
                    .insert([
                        {
                            videoUrl: videoUploadResp.Location,
                            thumbnail: thumbnailUploadResp.Location,
                            description: description,
                            emailRef: email
                        },
                        
                    ])
                    .select()

                if (error) {
                    console.error('Error inserting data:', error);
                } else {
                    console.log('Data inserted:', data);
                    navigation.goBack();
                }
            }
        } catch (e) {
            console.error('Error publishing:', e);
        }
    }
    const UploadFileToAws= async(file,type)=>{
        const fileType = file.split('.').pop();
        const params={
           Bucket:'connectra',
           Key:`group1-${Date.now()}.${fileType}`,
           Body:await fetch(file).then(resp=>resp.blob()),
           ACL:'public-read',
           ContentType:type=='video'?`video/${fileType}`:`image/${fileType}`
        }
        try {
            const data = await s3bucket.upload(params).promise();
            console.log('File Uploaded:', data.Location);

            if (type === 'video') {
                setVideoUrl(data.Location);
            } else {
                setThumbnailUrl(data.Location);
            }

            return data;
        } catch (e) {
            console.log(e)
            return null;
        }
    }
    return (
        <KeyboardAvoidingView style={{padding:10,backgroundColor:Colors.WHITE,flex:1}}>
        <ScrollView style={{padding:20,margin:-20}}>
            <TouchableOpacity
                onPress={()=>navigation.goBack()}
                style={{display:'flex', flexDirection:'row', gap:10, alignItems:'center',marginTop:20}}>
                <Ionicons name="arrow-back-circle" size={44} color="black" />
                <Text style={{fontFamily:'outfit',fontSize:20}}>Back</Text>
            </TouchableOpacity>
            <View style={{
                alignItems:'center',
                marginTop:20
            }}>
            <Text style={{fontFamily:'outfit-bold', fontSize:20,marginTop:80}}>Add Details</Text>
                <Image source={{uri:params?.thumbnail}}
                       style={{
                         width:200,
                         height:300,
                           borderRadius:15,
                           marginTop:15
                       }}/>
                <TextInput
                    numberOfLines={3}
                    placeholder=' Description'
                    onChangeText={(value)=>setDescription(value)}
                    style={{
                        borderWidth:1,
                        width:'100%',
                        borderRadius:10,
                        marginTop:25,
                        borderColor: Colors.BACKGROUND_TRANSPARENT,
                    }}
                    />
                <TouchableOpacity
                    onPress={publishHandler}
                    style={{
                        backgroundColor:Colors.BLACK,
                        padding:10,
                        paddingHorizontal:25,
                        borderRadius:99,
                        marginTop:20,
                    }}
                >
                    <Text style={{color:Colors.WHITE, fontFamily:'outfit'}}>Post</Text>
                </TouchableOpacity>
            </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}