import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ColorPalette from '../constants/ColorPalette';

export default function TrendsScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Trends Screen</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: ColorPalette.bg,
    },
    text: {
        color: ColorPalette.text_black,
    },
});