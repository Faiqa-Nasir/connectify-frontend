import React from "react";
import { useSelector } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import TabNavigation from './tabNavigation/TabNavigation';
import AuthStack from './authStack/AuthStack';

const Stack = createStackNavigator();

export default function Navigator() {
    const isAuth = useSelector((state) => state.auth.isAuth);

    return (
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!isAuth ? <Stack.Screen name="Auth" component={AuthStack} /> 
                         : <Stack.Screen name="Main" component={TabNavigation} />}
            </Stack.Navigator>
        
    );
}
