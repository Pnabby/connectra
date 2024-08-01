import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { Video } from 'expo-av';
import Colors from '../../Utils/Colors';
import * as WebBrowser from 'expo-web-browser';
import { useWarmUpBrowser } from '../../hooks/useWarmUpBrowser';
import { useOAuth } from '@clerk/clerk-expo';
import { supabase } from '../../Utils/SupabaseConfig';
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
    useWarmUpBrowser();

    const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });

    const onPress = React.useCallback(async () => {
        try {
            const { createdSessionId, signIn, signUp, setActive } = await startOAuthFlow();

            if (createdSessionId) {
                await setActive({ session: createdSessionId });

                if (signUp?.emailAddress) {
                    const defaultProfileImageUrl = 'https://example.com/default-profile-image.png'; // Replace with your default image URL

                    const { data, error } = await supabase
                        .from('Users')
                        .insert([
                            {
                                name: signUp?.firstName,
                                email: signUp?.emailAddress,
                                username: (signUp?.emailAddress).split('@')[0],
                                profileImage: defaultProfileImageUrl, // Add the default profile image URL here
                            },
                        ])
                        .select();

                    if (data) {
                        console.log(data);
                    }

                    if (error) {
                        console.error('Error inserting user:', error);
                    }
                }
            } else {
                // Use signIn or signUp for next steps such as MFA
            }
        } catch (err) {
            console.error('OAuth error', err);
        }
    }, [startOAuthFlow]);

    return (
        <View style={{ flex: 1 }}>
            <Video
                style={styles.video}
                source={{
                    uri: 'https://videos.pexels.com/video-files/5680034/5680034-hd_1280_720_24fps.mp4',
                }}
                shouldPlay
                resizeMode="cover"
                isLooping={true}
            />
            <View
                style={{
                    paddingHorizontal: 10,
                    display: 'flex',
                    alignContent: 'center',
                    alignItems: 'center',
                    padding: 100,
                    flex: 1,
                    backgroundColor: Colors.BACKGROUND_TRANSPARENT,
                }}
            >
                <Text
                    style={{
                        fontFamily: 'outfit-bold',
                        color: Colors.WHITE,
                        fontSize: 40,
                    }}
                >
                    Connectra
                </Text>
                <Text
                    style={{
                        color: Colors.WHITE,
                        fontFamily: 'outfit',
                        fontSize: 17,
                        marginTop: 10,
                        alignContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    Quickly connect with others
                </Text>

                <View style={{ position: 'absolute', bottom: 100 }}>
                    <View
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: Colors.BACKGROUND_TRANSPARENT,
                            padding: 15,
                            borderRadius: 100,
                        }}
                    >
                        <Text style={{ fontFamily: 'outfit', color: Colors.WHITE }}>
                            Sign in with Email and Password
                        </Text>
                    </View>

                    <TouchableOpacity
                        onPress={onPress}
                        style={{
                            marginTop: 10,
                            display: 'flex',
                            flexDirection: 'row',
                            gap: 10,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: Colors.WHITE,
                            padding: 8,
                            borderRadius: 100,
                        }}
                    >
                        <Image
                            source={require('./../../../assets/images/googletrans.png')}
                            style={{
                                width: 30,
                                height: 30,
                            }}
                        />
                        <Text style={{ fontFamily: 'outfit' }}>Sign in with Google</Text>
                    </TouchableOpacity>
                    <View
                        style={{
                            marginTop: 10,
                            display: 'flex',
                            alignItems: 'center',
                            padding: 15,
                            paddingHorizontal: 90,
                            borderRadius: 50,
                            backgroundColor: Colors.BACKGROUND_TRANSPARENT,
                        }}
                    >
                        <Text
                            style={{
                                fontFamily: 'outfit',
                                color: Colors.WHITE,
                            }}
                        >
                            Create Account
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    video: {
        height: '100%',
        width: 500,
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
});