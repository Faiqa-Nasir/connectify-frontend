import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import NoticeBoardScreen from '../../screens/NoticeBoardScreen/NoticeBoardScreen';
import CreatePostScreen from '../../screens/createPostScreen/CreatePostScreen';
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
            <Stack.Screen 
        name="CreatePost" 
        component={CreatePostScreen}
        options={{ 
          headerShown: false,
          presentation: 'modal'
        }}
      />
        </Stack.Navigator>
    );
}