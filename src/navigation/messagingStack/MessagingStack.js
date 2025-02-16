import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MessagingScreen from '../../screens/messagingScreen/MessagingScreen';
import ColorPalette from '../../constants/ColorPalette';

const Stack = createStackNavigator();

export default function MessagingStack() {
    return (
        <Stack.Navigator
        screenOptions={{
            headerShown: false, // This hides the header for all screens in this stack
        }}
        >
            <Stack.Screen name="Messaging" component={MessagingScreen} />
        </Stack.Navigator>
    );
}