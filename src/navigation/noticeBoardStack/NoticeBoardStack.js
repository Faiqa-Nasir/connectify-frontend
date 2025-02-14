import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import NoticeBoardScreen from '../../screens/noticeBoardScreen/NoticeBoardScreen';
import ColorPalette from '../../constants/ColorPalette';

const Stack = createStackNavigator();

export default function NoticeBoardStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: ColorPalette.main_black,
                },
                headerTintColor: ColorPalette.white,
            }}
        >
            <Stack.Screen name="NoticeBoard" component={NoticeBoardScreen} />
        </Stack.Navigator>
    );
}