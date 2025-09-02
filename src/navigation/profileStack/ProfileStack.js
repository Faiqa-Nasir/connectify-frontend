import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ProfileScreen from '../../screens/profileScreen/ProfileScreen';
import AccountScreen from '../../screens/accountScreen/AccountScreen';
import EditProfileScreen from '../../screens/editProfileScreen/EditProfileScreen';
import ColorPalette from '../../constants/ColorPalette';

const Stack = createStackNavigator();

const ProfileStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Profile"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: ColorPalette.main_black }
      }}
    >
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Account" component={AccountScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      {/* Add other profile-related screens here */}
    </Stack.Navigator>
  );
};

export default ProfileStack;
