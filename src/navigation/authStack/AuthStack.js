import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../../screens/loginScreen/LoginScreen'
import SignUpScreen from '../../screens/signUpScreen/SignUpScreen';
import UploadPictureScreen from '../../screens/uploadImageScreen/UploadImageScreen';
import SplashScreen from '../../screens/splashScreen/SplashScreen';
import { StatusBar } from 'react-native';
const Stack = createStackNavigator();

export default function AppointmentStack() {
  return (
    <>
      <StatusBar barStyle={"light-content"} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SplashScreen" component={SplashScreen} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
        <Stack.Screen name="UploadPictureScreen" component={UploadPictureScreen} />
      </Stack.Navigator>
    </>
  )
}