import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation, useRoute } from "@react-navigation/native";
import Colors from "../../Utils/Colors";
import { Ionicons } from '@expo/vector-icons';
import { s3bucket } from "../../Utils/S3BucketConfig";
import {supabase} from "../../Utils/SupabaseConfig";

export default function PreviewScreen() {
    const params = useRoute().params;
    const navigation = useNavigation();
    const [description, setDescription] = useState('');
    const [videoUrl,setVideoUrl]=useState();
    useEffect(() => {
        console.log(params);
    }, []);

    const publishHandler = async() => {
        if (params.video) {
          await  UploadFileToAWS(params.video, 'video');
          await UploadFileToAWS(params.thumbnail, 'image');

        }
    }

    const UploadFileToAWS = async (file, type) => {
        const fileType = file.split('.').pop();
        const params = {
            Bucket: "connectra",
            Key: `connectra-${Date.now()}.${fileType}`,
            Body: await fetch(file).then(resp => resp.blob()),
            ACL: 'public-read',
            ContentType: type === 'video' ? `video/${fileType}` : `image/${fileType}`
        }
        try {
            const data = await s3bucket.upload(params)
                .promise().then(resp => {
                    console.log("File Uploaded..");
                    console.log("RESP:", resp.Location);
                    if (type==='video')
                    {
                        setVideoUrl(resp?.Location)
                    }
                    else    {
                        console.log(resp.Location,videoUrl)
                    }
                })
        } catch (e) {
            console.log(e)
        }
    }

    return (
        <KeyboardAvoidingView style={{ padding: 20, backgroundColor: Colors.WHITE, flex: 1 }}>
            <ScrollView style={{ padding: 20 }}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{ display: 'flex', flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                    <Ionicons name="arrow-back-circle" size={30} color="black" />
                    <Text style={{ fontFamily: 'outfit', fontSize: 20 }}>Back</Text>
                </TouchableOpacity>
                <View style={{
                    alignItems: 'center',
                    marginTop: 100
                }}>
                    <Text style={{ fontFamily: 'outfit-bold', fontSize: 20 }}>Add Details</Text>
                    <Image source={{ uri: params?.thumbnail }}
                           style={{
                               width: 200,
                               height: 300,
                               borderRadius: 15,
                               marginTop: 15
                           }} />
                    <TextInput
                        numberOfLines={3}
                        placeholder='Description'
                        value={description}
                        onChangeText={(value) => setDescription(value)}
                        style={{
                            borderWidth: 1,
                            width: '100%',
                            borderRadius: 10,
                            marginTop: 25,
                            borderColor: Colors.BACKGROUND_TRANSPARENT,
                            paddingHorizontal: 20
                        }}
                    />
                    <TouchableOpacity
                        onPress={publishHandler}
                        style={{
                            backgroundColor: Colors.BLACK,
                            padding: 10,
                            paddingHorizontal: 25,
                            borderRadius: 99,
                            marginTop: 20,
                        }}
                    >
                        <Text style={{ color: Colors.WHITE, fontFamily: 'outfit' }}>Post</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    )
}