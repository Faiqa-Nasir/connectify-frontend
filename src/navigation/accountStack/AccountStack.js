import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import AccountScreen from '../../screens/accountScreen/AccountScreen';
import ColorPalette from '../../constants/ColorPalette';

const Stack = createStackNavigator();

export default function AccountStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: ColorPalette.main_black,
                },
                headerTintColor: ColorPalette.white,
            }}
        >
            <Stack.Screen name="Account" component={AccountScreen} />
        </Stack.Navigator>
    );
}