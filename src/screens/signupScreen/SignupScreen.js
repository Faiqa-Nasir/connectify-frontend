import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialIcons } from '@expo/vector-icons/';
import CustomButton from "../../components/CustomButton";
import { useDispatch, useSelector } from "react-redux";
import { signup } from "../../redux/authSlice"; // Ensure this import is correct
import ColorPalette from "../../constants/ColorPalette";
import CustomInput from "../../components/CustomInput";
import RoundedContainer from "../../components/RoundedContainer";
import { useRouter } from "expo-router";
import LabeledInput from "../../components/LabeledInput";

const SignupScreen = ({navigation}) => {

  const dispatch = useDispatch();
  const isAuth = useSelector((state) => state.auth.isAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <View style={styles.container}>
        <RoundedContainer>
          <Text style={styles.signUpTitle}>Sign Up</Text>
          <LabeledInput
            label="Email"
            placeholder="Enter email here ..."
            onChangeText={setEmail}
          />

          <LabeledInput
            label="Set Password"
            placeholder="Enter password here ..."
            secureTextEntry={!showPassword}
            onChangeText={setPassword}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <MaterialIcons 
                  name={showPassword ? "visibility" : "visibility-off"} 
                  size={24} 
                  color={ColorPalette.green} 
                />
              </TouchableOpacity>
            }
          />

          <LabeledInput
            label="Confirm Password"
            placeholder="Enter password here ..."
            secureTextEntry={!showConfirmPassword}
            onChangeText={setConfirmPassword}
            rightIcon={
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <MaterialIcons 
                  name={showConfirmPassword ? "visibility" : "visibility-off"} 
                  size={24} 
                  color={ColorPalette.green} 
                />
              </TouchableOpacity>
            }
          />

          <CustomButton
            title="Sign Up"
            onPress={() => {
              dispatch(signup({ email, password }));
              navigation.navigate('CodeVerificationScreen', { email });
            }}
          />

            <Text style={styles.loginText}>Already Have an account?  <Text style={styles.loginLink} onPress={()=>navigation.navigate('LoginScreen')} >Login</Text></Text>
          {/* {isAuth && <Text style={styles.loggedInText}>You are Signed up!</Text>} */}
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
  title: {
    fontSize: 32,
    color: ColorPalette.white,
    marginBottom: 20,
    fontFamily: 'CG-Regular',
  },
  loggedInText: {
    fontSize: 24,
    color: ColorPalette.text_black,
    marginTop: 20,
    fontFamily: 'CG-Regular',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    color: ColorPalette.text_black,
    marginBottom: 20,
    fontFamily: 'CG-Regular',
    textAlign: 'center',
  },
  signUpTitle: {
    fontSize: 24,
    color: ColorPalette.text_black,
    marginBottom: 40,
    fontFamily: 'CG-Semibold',
    textAlign: 'center',
    fontWeight: '100',
    marginTop: 20,
  },
  rememberForgotContainer: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  rememberMe: {
    fontSize: 14,
    color: ColorPalette.text_black,
    fontFamily: 'CG-Regular',
    marginLeft: 8,
  },
  forgotPassword: {
    fontSize: 14,
    color: ColorPalette.text_black,
    fontFamily: 'CG-Regular',
  },
  description: {
    fontSize: 14,
    color: ColorPalette.text_black,
    marginTop: 30,
    marginBottom: 10,
    fontFamily: 'CG-Regular',
    textAlign:'center'
  },
  googleLogo: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  loginText: {
    fontSize: 14,
    marginTop: 20,
    color: ColorPalette.text_black,
    fontFamily: 'CG-Regular',
    textAlign: 'center',
    paddingBottom: 20,
  },
  loginLink: {
    fontSize: 14,
    marginTop: 20,
    color: ColorPalette.green,
    fontFamily: 'CG-Semibold',
  },
});

export default SignupScreen;
