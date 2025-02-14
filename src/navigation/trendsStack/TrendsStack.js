import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TrendsScreen from '../screens/TrendsScreen';
import ColorPalette from '../constants/ColorPalette';

const Stack = createStackNavigator();

export default function TrendsStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: ColorPalette.main_black,
                },
                headerTintColor: ColorPalette.white,
            }}
        >
            <Stack.Screen name="Trends" component={TrendsScreen} />
        </Stack.Navigator>
    );
}