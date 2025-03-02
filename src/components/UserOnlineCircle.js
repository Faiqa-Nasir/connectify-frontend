import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import ColorPalette from '../constants/ColorPalette';

const UserOnlineCircle = ({ user }) => {
    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                <Image source={{ uri: user.profileImage }} style={styles.image} />
                <View style={styles.onlineIndicator} />
            </View>
            <Text style={styles.username}>{user.username.length > 10 ? user.username.substring(0, 10) + '...' : user.username}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginRight: 15,
    },
    imageContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: ColorPalette.gradient_text,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 15,
        height: 15,
        borderRadius: 7.5,
        backgroundColor: ColorPalette.gradient_text,
        borderWidth: 1,
        borderColor: ColorPalette.white,
    },
    username: {
        marginTop: 5,
        color: ColorPalette.white,
        fontSize: 12,
        fontFamily: 'CG-Light',
    },
});

export default UserOnlineCircle;
