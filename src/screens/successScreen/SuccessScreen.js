import React from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import ColorPalette from "../../constants/ColorPalette";
import RoundedContainer from "../../components/RoundedContainer";
import LottieView from 'lottie-react-native';
import CustomButton from "../../components/CustomButton";
import { AntDesign } from '@expo/vector-icons';

const SuccessScreen = ({navigation}) => {
  return (
    <View style={styles.container}>
      <RoundedContainer>

                <Text style={styles.header}>Verification</Text>
        <LottieView
          source={require('../../../assets/lottie/successTick.json')}
          autoPlay
          loop={false}
          duration={4000}
          style={styles.lottie}
        />
        <View style={{marginTop: -50}}>
        <Text style={styles.title}>Register Success!</Text>
        <Text style={styles.message}>Your account has been created.</Text>
        </View>
        <CustomButton title="Login Now" onPress={() => navigation.navigate('LoginScreen')} />
      </RoundedContainer>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: ColorPalette.green,
  },
  lottie: {
    width: 350,
    height: 350,
  },
  header: {
    fontSize: 24,
    color: ColorPalette.text_black,
    fontFamily: 'CG-Semibold',
    textAlign: 'center',
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
});

export default SuccessScreen;
