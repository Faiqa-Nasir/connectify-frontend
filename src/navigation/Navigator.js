import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { View, ActivityIndicator } from "react-native";
import TabNavigation from './tabNavigation/TabNavigation';
import AuthStack from './authStack/AuthStack';
import WorkspaceSelectionScreen from "../screens/workspaceSelectionScreen/WorkspaceSelectionScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ColorPalette from "../constants/ColorPalette";
import { hasValidTokens } from "../services/tokenService";
import { restoreToken } from "../redux/authSlice";

const Stack = createStackNavigator();

export default function Navigator() {
    const { isAuthenticated } = useSelector((state) => state.auth || { isAuthenticated: false });
    const [hasWorkspace, setHasWorkspace] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const dispatch = useDispatch();
    
    // Bootstrap the app - check for valid tokens and workspace
    useEffect(() => {
        const bootstrapAsync = async () => {
            setIsLoading(true);
            try {
                // Check if tokens exist and are valid
                const isTokenValid = await hasValidTokens();
                console.log("Token validation check:", isTokenValid);
                
                if (isTokenValid) {
                    // Get user data and tokens to restore authentication state
                    const [userString, tokens] = await Promise.all([
                        AsyncStorage.getItem('user'),
                        AsyncStorage.getItem('tokens')
                    ]);
                    
                    if (userString && tokens) {
                        // Dispatch the restore token action to update auth state
                        const user = JSON.parse(userString);
                        const tokensObj = JSON.parse(tokens);
                        dispatch(restoreToken({ user, tokens: tokensObj }));
                        
                        // Check for selected workspace
                        const selectedWorkspace = await AsyncStorage.getItem('selectedWorkspace');
                        console.log("Selected workspace from storage during bootstrap:", selectedWorkspace);
                        
                        if (selectedWorkspace) {
                            setHasWorkspace(true);
                        }
                    }
                }
            } catch (error) {
                console.error('Error during app bootstrap:', error);
            } finally {
                setIsLoading(false);
            }
        };
        
        bootstrapAsync();
    }, [dispatch]);
    
    // Check if user has already joined a workspace when authentication status changes
    useEffect(() => {
        const checkWorkspaceStatus = async () => {
            try {
                // Only check for workspace if the user is authenticated
                if (isAuthenticated) {
                    const selectedWorkspace = await AsyncStorage.getItem('selectedWorkspace');
                    console.log("Selected workspace from storage:", selectedWorkspace);
                    setHasWorkspace(!!selectedWorkspace);
                } else {
                    // If not authenticated, we don't have a workspace
                    setHasWorkspace(false);
                }
            } catch (error) {
                console.error('Error checking workspace status:', error);
                setHasWorkspace(false);
            }
        };
        
        checkWorkspaceStatus();
    }, [isAuthenticated]);
    
    // Function to set selected workspace (to be called after joining a workspace)
    const setSelectedWorkspace = async (workspaceId) => {
        try {
            await AsyncStorage.setItem('selectedWorkspace', workspaceId.toString());
            console.log("Saved workspace to storage:", workspaceId.toString());
            setHasWorkspace(true);
        } catch (error) {
            console.error('Error saving selected workspace:', error);
        }
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: ColorPalette.main_black }}>
                <ActivityIndicator size="large" color={ColorPalette.green} />
            </View>
        );
    }

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
