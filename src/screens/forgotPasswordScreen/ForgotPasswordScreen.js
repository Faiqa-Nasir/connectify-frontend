import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import CustomButton from "../../components/CustomButton";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword } from "../../redux/authSlice"; // Ensure this import is correct
import ColorPalette from "../../constants/ColorPalette";
import RoundedContainer from "../../components/RoundedContainer";
import { useRouter } from "expo-router";
import LabeledInput from "../../components/LabeledInput";
import { AntDesign } from "@expo/vector-icons";

const ForgotPasswordScreen = ({navigation}) => {
  const dispatch = useDispatch();
  const isAuth = useSelector((state) => state.auth.isAuth);
  const [email, setEmail] = useState('');

  return (
    <View style={styles.container}>
      <RoundedContainer>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 50 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <AntDesign name="arrowleft" size={24} color={ColorPalette.green} />
          </TouchableOpacity>
          <Text style={styles.forgotText}>Help</Text>
        </View>

        <Text style={styles.forgotPasswordTitle}>Reset Your Password</Text>
        <Text style={styles.forgotPasswordText}>Enter your email below to reset your password</Text> 
    
        <LabeledInput
          label="Email"
          placeholder="Enter email here ..."
          onChangeText={setEmail}
          inputStyle={{ backgroundColor:ColorPalette.light_bg, borderRadius: 10, borderColor: ColorPalette.grey_text, borderWidth: 1 }}
        />
        <CustomButton
          title="Get Code"
          onPress={() => {
            // dispatch(forgotPassword({ email }));
            navigation.navigate('CodeVerificationScreen', { email });
          }}
        />
        <TouchableOpacity>
          <Text style={styles.forgotText}>Remembered your password? <Text style={styles.forgotLink} onPress={()=>navigation.navigate('LoginScreen')}>Login</Text></Text>
        </TouchableOpacity>
        {/* {isAuth && <Text style={styles.loggedInText}>Password reset link sent!</Text>} */}
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
  forgotPasswordTitle: {
    fontSize: 24,
    color: ColorPalette.text_black,
    marginBottom: 5,
    fontFamily: 'CG-Semibold',
    textAlign: 'center',
    fontWeight: '100',
  },
  loggedInText: {
    fontSize: 24,
    color: ColorPalette.text_black,
    marginTop: 20,
    fontFamily: 'CG-Regular',
  },
  forgotText: {
    fontSize: 14,
    marginTop: 20,
    color: ColorPalette.text_black,
    fontFamily: 'CG-Regular',
    textAlign: 'center',
    paddingBottom: 20,
  },
  forgotLink: {
    fontSize: 14,
    marginTop: 20,
    color: ColorPalette.green,
    fontFamily: 'CG-Semibold',
  },
  forgotPasswordText: {
    fontSize: 16,
    color: ColorPalette.text_black,
    marginBottom: 30,
    fontFamily: 'CG-Light',
    textAlign: 'center',
    padding: 10,
  },
});

export default ForgotPasswordScreen;
