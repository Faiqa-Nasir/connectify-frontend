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
import { hasValidTokens, getStoredTokens } from "../services/tokenService";
import { restoreToken } from "../redux/authSlice";
import { refreshAccessToken } from "../services/apiService"; // Import the existing refreshAccessToken function

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
                else {
                    // Try to refresh the token if validation fails
                    try {
                        // Get stored tokens
                        const tokens = await getStoredTokens();
                        
                        // Only attempt refresh if we have a refresh token
                        if (tokens && tokens.refresh) {
                            console.log("Attempting to refresh token during bootstrap");
                            // Use the existing refreshAccessToken function instead of directly calling the API
                            const newTokens = await refreshAccessToken(tokens.refresh);
                            
                            // Get user data to restore authentication state
                            const userString = await AsyncStorage.getItem('user');
                            
                            if (userString) {
                                const user = JSON.parse(userString);
                                dispatch(restoreToken({ user, tokens: newTokens }));
                                
                                // Check for selected workspace
                                const selectedWorkspace = await AsyncStorage.getItem('selectedWorkspace');
                                console.log("Selected workspace from storage after token refresh:", selectedWorkspace);
                                
                                if (selectedWorkspace) {
                                    setHasWorkspace(true);
                                }
                            }
                            
                            console.log("Token refreshed successfully during bootstrap");
                        } else {
                            console.log("No refresh token available, cannot refresh");
                        }
                    } catch (refreshError) {
                        console.error("Failed to refresh token during bootstrap:", refreshError);
                        // Reset auth state since refresh failed
                        await AsyncStorage.removeItem('tokens');
                        await AsyncStorage.removeItem('user');
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
    const setSelectedWorkspace = async (workspace) => {
        try {
            // Store the entire workspace object instead of just the ID
            await AsyncStorage.setItem('selectedWorkspace', JSON.stringify(workspace));
            console.log("Saved workspace to storage:", workspace);
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
