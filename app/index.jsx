import 'react-native-gesture-handler';
import Navigator from '../src/navigation/Navigator.js';
import { Platform, View, AppState } from 'react-native';
import React, { useEffect, useRef,useContext } from 'react';
import AppProvider from '../src/redux/AppProvider.js';
import { useFonts } from 'expo-font';

export default function App() {
    const [fontsLoaded] = useFonts({
        'CG-Regular': require('../assets/fonts/ClashGrotesk-Regular.otf'),
        'CG-Bold': require('../assets/fonts/ClashGrotesk-Bold.otf'),
        'CG-Semibold': require('../assets/fonts/ClashGrotesk-Semibold.otf'),
        'CG-Medium': require('../assets/fonts/ClashGrotesk-Medium.otf'),
      });
    return (
        <AppProvider>
            <View style={[{ flex: 1 }, Platform.OS === 'android' && { marginTop: -28 }]}>
                <Navigator />
            </View>
        </AppProvider>
    );
}
