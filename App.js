import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from 'react-native';
import { useFonts } from 'expo-font';
import LoginScreen from "./Apps/Screens/LoginScreen/LoginScreen";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-expo";
import HomeScreen from "./Apps/Screens/Home/HomeScreen";
import {NavigationContainer} from "@react-navigation/native";
import TabNavigation from "./Apps/Navigation/TabNavigaton";
import {supabase} from "./Apps/Utils/SupabaseConfig";
import * as Sentry from '@sentry/react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

Sentry.init({
  dsn: "https://f5fc99ef1485786b5030e4697cd91255@o4507398162677760.ingest.us.sentry.io/4507398165561344",
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for tracing.
  // We recommend adjusting this value in production.
  tracesSampleRate: 1.0,
  _experiments: {
    // profilesSampleRate is relative to tracesSampleRate.
    // Here, we'll capture profiles for 100% of transactions.
    profilesSampleRate: 1.0,
  },
});

function App() {


  const [fontsLoaded, fontError] = useFonts({
    'outfit': require('./assets/fonts/Outfit-Regular.ttf'),
    'outfit-bold': require('./assets/fonts/Outfit-Bold.ttf'),
    'outfit-medium': require('./assets/fonts/Outfit-Medium.ttf'),
  });
  
  return (
      <GestureHandlerRootView style={{ flex:1

      }}>
      <ClerkProvider publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}>
    <View style = {styles.container}>
      <SignedIn>
        <NavigationContainer>
          <TabNavigation/>
        </NavigationContainer>
      </SignedIn>
      <SignedOut>
        <LoginScreen/>
      </SignedOut>

    </View>
      </ClerkProvider>
      </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    //alignItems: 'center', //row alignment
    //justifyContent: 'center', //column alignment
  },

});
export default Sentry.wrap(App);

