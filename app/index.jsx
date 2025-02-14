import 'react-native-gesture-handler';
import Navigator from '../src/navigation/Navigator.js';
import { Platform, View, AppState } from 'react-native';
import React, { useEffect, useRef,useContext } from 'react';

export default function App() {
    
    return (
        <AppProviders>
            <View style={[{ flex: 1 }, Platform.OS === 'android' && { marginTop: -28 }]}>
                <Navigator />
            </View>
        </AppProviders>
    );
}
