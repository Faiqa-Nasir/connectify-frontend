import React, { memo } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import ColorPalette from '../constants/ColorPalette';

const UserOnlineCircle = ({ user }) => {
    return (
        <TouchableOpacity style={styles.container}>
            <View style={styles.imageContainer}>
                <Image source={{ uri: user.profileImage }} style={styles.image} />
                <View style={styles.onlineIndicator} />
            </View>
            <Text style={styles.username} numberOfLines={1}>
                {user.username}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginHorizontal: 8,
        width: 60,
    },
    imageContainer: {
        position: 'relative',
        marginBottom: 4,
    },
    image: {
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 2,
        borderColor: ColorPalette.green,
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#4CAF50',
        borderWidth: 2,
        borderColor: ColorPalette.main_black,
    },
    username: {
        color: ColorPalette.white,
        fontSize: 12,
        textAlign: 'center',
        width: 60,
        fontFamily: 'CG-Regular',
    },
});

// Export as memoized component to prevent unnecessary re-renders
export default memo(UserOnlineCircle);
