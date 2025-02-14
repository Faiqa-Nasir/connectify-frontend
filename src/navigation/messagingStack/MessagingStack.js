import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import MessagingScreen from '../../screens/messagingScreen/MessagingScreen';
import ColorPalette from '../../constants/ColorPalette';

const Stack = createStackNavigator();

export default function MessagingStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: ColorPalette.main_black,
                },
                headerTintColor: ColorPalette.white,
            }}
        >
            <Stack.Screen name="Messaging" component={MessagingScreen} />
        </Stack.Navigator>
    );
}