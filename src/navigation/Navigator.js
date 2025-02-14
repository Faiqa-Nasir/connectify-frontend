import React from "react";
import { useSelector } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import TabNavigation from './tabNavigation/TabNavigation';

const Stack = createStackNavigator();

export default function Navigator() {
    const isAuth = useSelector((state) => state.auth.isAuth);

    return (
        <NavigationContainer>
            <Stack.Navigator>
                {!isAuth ? (
                    <AuthStack />
                ) : (
                    <TabNavigation />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
