import { View, Text, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import Colors from "../../Utils/Colors";
import * as ImagePicker from "expo-image-picker";
import * as VideoThumbnails from 'expo-video-thumbnails';
import { useNavigation } from "@react-navigation/native";
export default function AddScreen() {
    const navigation = useNavigation();

    const selectVideoFile = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        console.log(result);

        if (!result.canceled) {
            console.log(result.assets[0].uri);
            await generateVideoThumbnails(result.assets[0].uri);
        }
    };

    // Generate Thumbnail
    const generateVideoThumbnails = async (videoUri) => {
        try {
            const { uri } = await VideoThumbnails.getThumbnailAsync(
                videoUri,
                {
                    time: 10000,
                }
            );
            console.log("Thumbnail", uri);
            navigation.navigate('preview-screen', {
                thumbnail: uri,
                video: videoUri,
            });
        } catch (e) {
            console.warn(e);
        }
    };

    return (
        <View style={{
            padding: 20,
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'center',
            flex: 1
        }}>
            <Image source={require('./../../../assets/images/299060_folder_icon.png')}
                   style={{
                       width: 140,
                       height: 140
                   }}
            />
            <Text style={{
                fontFamily: 'outfit-bold',
                fontSize: 22,
                marginTop: 20
            }}>Start Uploading Short Video</Text>
            <Text style={{
                textAlign: 'center',
                fontFamily: 'outfit',
                margin: 13,
            }}>Let's upload short video and start sharing your creativity with community</Text>
            <TouchableOpacity
                onPress={selectVideoFile}
                style={{
                    backgroundColor: Colors.BLACK,
                    padding: 10,
                    paddingHorizontal: 25,
                    borderRadius: 99,
                    marginTop: 20,
                }}
            >
                <Text style={{ color: Colors.WHITE, fontFamily: 'outfit' }}>Select Video File</Text>
            </TouchableOpacity>
        </View>
    );
}