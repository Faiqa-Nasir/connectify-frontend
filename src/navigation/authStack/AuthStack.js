import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../../screens/loginScreen/LoginScreen.js';
import SignupScreen from '../../screens/signupScreen/SignupScreen.js';
import SuccessScreen from '../../screens/successScreen/SuccessScreen.js';
import CodeVerificationScreen from '../../screens/codeVerificationScreen/CodeVerificationScreen.js';
import ForgotPasswordScreen from '../../screens/forgotPasswordScreen/ForgotPasswordScreen.js';
import WorkspaceSelectionScreen from '../../screens/workspaceSelectionScreen/WorkspaceSelectionScreen.js';
import { StatusBar } from 'react-native';

const Stack = createStackNavigator();

export default function AuthStack() {
  return (
    <>
      <StatusBar barStyle={"light-content"} />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="SignupScreen" component={SignupScreen} />
        <Stack.Screen name="SuccessScreen" component={SuccessScreen} />
        <Stack.Screen name="CodeVerificationScreen" component={CodeVerificationScreen} />
        <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
        <Stack.Screen name="WorkspaceSelectionScreen" component={WorkspaceSelectionScreen} />
      </Stack.Navigator>
    </>
  );
}
