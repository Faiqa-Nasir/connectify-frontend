import * as React from 'react';
import { createStackNavigator } from "@react-navigation/stack"
import MessagingScreen from "../../screens/messagingScreen/MessagingScreen"
import ChatDetailScreen from "../../screens/chatDetailScreen/chatDetailScreen"
import GroupChatDetailScreen from "../../screens/groupChatDetailScreen/GroupChatDetailScreen"
import ContactsScreen from "../../screens/contactsScreen/ContactsScreen"
import NewGroupScreen from "../../screens/newGroupScreen/NewGroupScreen"
import GroupNameScreen from "../../screens/groupNameScreen/GroupNameScreen"
import ColorPalette from "../../constants/ColorPalette"

const Stack = createStackNavigator()

export default function MessagingStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: ColorPalette.bg },
      }}
    >
      <Stack.Screen name="Messages" component={MessagingScreen} />
      <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
      <Stack.Screen name="GroupChatDetail" component={GroupChatDetailScreen} />
      <Stack.Screen name="Contacts" component={ContactsScreen} />
      <Stack.Screen name="NewGroup" component={NewGroupScreen} />
      <Stack.Screen name="GroupName" component={GroupNameScreen} />
    </Stack.Navigator>
  )
}
