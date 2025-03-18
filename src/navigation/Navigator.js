import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import TabNavigation from './tabNavigation/TabNavigation';
import AuthStack from './authStack/AuthStack';
import WorkspaceSelectionScreen from "../screens/workspaceSelectionScreen/WorkspaceSelectionScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Stack = createStackNavigator();

export default function Navigator() {
    const { isAuthenticated } = useSelector((state) => state.auth || { isAuthenticated: false });
    const [hasWorkspace, setHasWorkspace] = useState(false);
    
    // Check if user has already joined a workspace
    useEffect(() => {
        const checkWorkspaceStatus = async () => {
            try {
                const selectedWorkspace = await AsyncStorage.getItem('selectedWorkspace');
                setHasWorkspace(!!selectedWorkspace);
            } catch (error) {
                console.error('Error checking workspace status:', error);
                setHasWorkspace(false);
            }
        };
        
        if (isAuthenticated) {
            checkWorkspaceStatus();
        }
    }, [isAuthenticated]);
    
    // Function to set selected workspace (to be called after joining a workspace)
    const setSelectedWorkspace = async (workspaceId) => {
        try {
            await AsyncStorage.setItem('selectedWorkspace', workspaceId.toString());
            setHasWorkspace(true);
        } catch (error) {
            console.error('Error saving selected workspace:', error);
        }
    };

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!isAuthenticated ? (
                // Not authenticated - show auth stack
                <Stack.Screen name="Auth" component={AuthStack} />
            ) : !hasWorkspace ? (
                // Authenticated but no workspace selected - show workspace selection
                <Stack.Screen name="WorkspaceSelection">
                    {props => (
                        <WorkspaceSelectionScreen
                            {...props}
                            onWorkspaceSelected={setSelectedWorkspace}
                        />
                    )}
                </Stack.Screen>
            ) : (
                // Authenticated with workspace selected - show main app
                <Stack.Screen name="Main" component={TabNavigation} />
            )}
        </Stack.Navigator>
    );
}
