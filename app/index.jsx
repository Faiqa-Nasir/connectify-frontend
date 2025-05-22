import 'react-native-gesture-handler';
import Navigator from '../src/navigation/Navigator.js';
import { Platform, View, AppState } from 'react-native';
import React, { useEffect, useRef,useContext } from 'react';
import AppProvider from '../src/redux/AppProvider.js';
import { useFonts } from 'expo-font';

export default function App() {
    const [fontsLoaded] = useFonts({
        // 'CG-Regular': require('../assets/fonts/ClashGrotesk-Regular.otf'),
        // 'CG-Bold': require('../assets/fonts/ClashGrotesk-Bold.otf'),
        // 'CG-Semibold': require('../assets/fonts/ClashGrotesk-Semibold.otf'),
        // 'CG-Medium': require('../assets/fonts/ClashGrotesk-Medium.otf'),
        // 'CG-Light': require('../assets/fonts/ClashGrotesk-Light.otf'),

        'CG-Regular': require('../assets/fonts/GoogleSans-Regular.ttf'),
        'CG-MediumItalic': require('../assets/fonts/GoogleSans-MediumItalic.ttf'),
        'CG-Medium': require('../assets/fonts/GoogleSans-Medium.ttf'),
        'CG-BoldItalic': require('../assets/fonts/GoogleSans-BoldItalic.ttf'),
        'CG-Bold': require('../assets/fonts/GoogleSans-Bold.ttf'),
        'CG-Italic': require('../assets/fonts/GoogleSans-Italic.ttf'),
        'CG-Semibold': require('../assets/fonts/Google-Sans-Mono-SemiBold.ttf'),
      });
    return (
        <AppProvider>
            <View style={[{ flex: 1 }, Platform.OS === 'android' && { marginTop: -28 }]}>
                <Navigator />
            </View>
        </AppProvider>
    );
}
