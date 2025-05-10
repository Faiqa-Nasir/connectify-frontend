import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../../screens/homeScreen/HomeScreen';
import CreatePostScreen from '../../screens/createPostScreen/CreatePostScreen';
import ColorPalette from '../../constants/ColorPalette';
import TrendsDetailScreen from '../../screens/Trends/trendDetailScreen/TrendDetailScreen';

const Stack = createStackNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: ColorPalette.main_black,
        },
        headerTintColor: ColorPalette.white,
        headerTitleStyle: {
          fontFamily: 'CG-Medium',
        },
      }}
    >
      <Stack.Screen 
        name="Feed" 
        component={HomeScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="CreatePost" 
        component={CreatePostScreen}
        options={{ 
          headerShown: false,
          presentation: 'modal'
        }}
      />
      <Stack.Screen
      name="TrendDetailsScreen"
      component={TrendsDetailScreen}
      options={{
        headerShown: false,
        presentation: 'modal',
      }}
      />
    </Stack.Navigator>
  );
};

export default HomeStack;