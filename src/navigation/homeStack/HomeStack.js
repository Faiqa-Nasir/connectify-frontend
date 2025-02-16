import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../../screens/homeScreen/HomeScreen';
import ColorPalette from '../../constants/ColorPalette';



const Stack = createStackNavigator();

export default function HomeStack() {
    return (
        <Stack.Navigator
        screenOptions={{
            headerShown: false, // This hides the header for all screens in this stack
        }}
        >
            <Stack.Screen name="Home" component={HomeScreen} />
        </Stack.Navigator>
    );
}