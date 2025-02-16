import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TrendsScreen from '../../screens/trendsScreen/TrendsScreen';
import ColorPalette from '../../constants/ColorPalette';

const Stack = createStackNavigator();

export default function TrendsStack() {
    return (
        <Stack.Navigator
        screenOptions={{
            headerShown: false, // This hides the header for all screens in this stack
        }}
        >
            <Stack.Screen name="Trends" component={TrendsScreen} />
        </Stack.Navigator>
    );
}