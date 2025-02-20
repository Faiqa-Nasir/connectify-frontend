import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../../screens/loginScreen/LoginScreen.js';
import SignupScreen from '../../screens/signupScreen/SignupScreen.js';
import { StatusBar } from 'react-native';

const Stack = createStackNavigator();

export default function AuthStack() {
  return (
    <>
      <StatusBar barStyle={"light-content"} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="SignupScreen" component={SignupScreen} />
      </Stack.Navigator>
    </>
  );
}
