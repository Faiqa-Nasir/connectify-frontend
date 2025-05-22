import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TrendsScreen from '../../screens/Trends/trendsScreen/TrendsScreen';
import TrendsDetailScreen from '../../screens/Trends/trendDetailScreen/TrendDetailScreen.js';
import CreateTrendScreen from '../../screens/Trends/createTrendScreen/CreateTrendScreen.js';
const Stack = createStackNavigator();

export default function TrendsStack() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false, // This hides the header for all screens in this stack
            }}
        >
            <Stack.Screen name="Trends" component={TrendsScreen} />
            <Stack.Screen name="TrendsDetailScreen" component={TrendsDetailScreen} />
            <Stack.Screen name="CreateTrendScreen" component={CreateTrendScreen} />
        </Stack.Navigator>
    );
}