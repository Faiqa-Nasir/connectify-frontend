import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeStack from '../homeStack/HomeStack.js';
import MessagingStack from '../messagingStack/MessagingStack';
import TrendsStack from '../trendsStack/TrendsStack';
import ProfileStack from '../profileStack/ProfileStack';
import NoticeBoardStack from '../noticeBoardStack/NoticeBoardStack';
import ColorPalette from '../../constants/ColorPalette.js';

const Tab = createBottomTabNavigator();
import { SafeAreaView } from 'react-native';

export default function TabNavigation() {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: ColorPalette.main_black }}>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ focused, color, size }) => {
                        let iconName;
                        if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
                        else if (route.name === 'Messaging') iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
                        else if (route.name === 'Trends') iconName = focused ? 'trending-up' : 'trending-up-outline';
                        else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
                        else if (route.name === 'NoticeBoard') iconName = focused ? 'notifications' : 'notifications-outline';

                        return <Ionicons name={iconName} size={size} color={color} />;
                    },
                    headerStyle: {
                        backgroundColor: ColorPalette.green,
                    },
                    tabBarActiveTintColor: ColorPalette.gradient_text,
                    tabBarInactiveTintColor: ColorPalette.grey_text,
                    tabBarStyle: { backgroundColor: ColorPalette.main_black },
                    headerShown: false,
                })}
            >
                <Tab.Screen name="Home" component={HomeStack}/>
                <Tab.Screen name="Messaging" component={MessagingStack} />
                <Tab.Screen name="Trends" component={TrendsStack} />
                <Tab.Screen name="NoticeBoard" component={NoticeBoardStack} />
                <Tab.Screen name="Profile" component={ProfileStack} />
            </Tab.Navigator>
        </SafeAreaView>
    );
}
