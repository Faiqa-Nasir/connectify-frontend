import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AccountScreen from '../../screens/accountScreen/AccountScreen';
import ColorPalette from '../../constants/ColorPalette';

const Stack = createStackNavigator();

export default function AccountStack() {
    return (
        <Stack.Navigator
        screenOptions={{
            headerShown: false, // This hides the header for all screens in this stack
        }}
        >
            <Stack.Screen name="Account" component={AccountScreen} />
        </Stack.Navigator>
    );
}