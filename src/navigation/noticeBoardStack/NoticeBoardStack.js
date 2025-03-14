import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import NoticeBoardScreen from '../../screens/noticeBoardScreen/NoticeBoardScreen';
import ColorPalette from '../../constants/ColorPalette';

const Stack = createStackNavigator();

export default function NoticeBoardStack() {
    return (
        <Stack.Navigator
        screenOptions={{
            headerShown: false, // This hides the header for all screens in this stack
        }}
        >
            <Stack.Screen name="NoticeBoard" component={NoticeBoardScreen} />
        </Stack.Navigator>
    );
}