import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { AntDesign } from '@expo/vector-icons';
import CustomCheckbox from "../../components/CustomCheckbox";
import CustomButton from "../../components/CustomButton";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../redux/authSlice";
import ColorPalette from "../../constants/ColorPalette";
import CustomInput from "../../components/CustomInput";
import RoundedContainer from "../../components/RoundedContainer";

const LoginScreen = () => {

  const dispatch = useDispatch();
  const isAuth = useSelector((state) => state.auth.isAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Connectify</Text>
      <RoundedContainer>
        <Text style={styles.loginTitle}>Login</Text>
        <Text style={styles.subtitle}>Enter your email and password to Login</Text>
        <CustomInput
          placeholder="Email"
          onChangeText={setEmail}
        />
        <CustomInput
          placeholder="Password"
          secureTextEntry
          onChangeText={setPassword}
        />
        <View style={styles.rememberForgotContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <CustomCheckbox
              value={rememberMe}
              onValueChange={setRememberMe}
            />
            <Text style={styles.rememberMe}>Remember Me</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.forgotPassword}>Forgotten Password?</Text>
          </TouchableOpacity>
        </View>
        <CustomButton
          title="Login"
          onPress={() => {
            dispatch(login({ email, password, rememberMe }));
          }}
        />
        <Text style={styles.description}>Or login with</Text>
        <CustomButton 
          title="Continue with Google" 
          backgroundColor={ColorPalette.white} 
          textColor={ColorPalette.text_black} 
          icon={<AntDesign name="google" size={20} color={ColorPalette.text_black} />}
        />
        <TouchableOpacity>
          <Text style={styles.signUpText}>Don't have an account?  <Text style={styles.signUpLink}>Sign up</Text></Text>
        </TouchableOpacity>
        {isAuth && <Text style={styles.loggedInText}>You are logged in!</Text>}
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
  loginTitle: {
    fontSize: 24,
    color: ColorPalette.text_black,
    marginBottom: 10,
    fontFamily: 'CG-Semibold',
    textAlign: 'center',
    fontWeight: '100',
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
  signUpText: {
    fontSize: 14,
    marginTop: 20,
    color: ColorPalette.text_black,
    fontFamily: 'CG-Regular',
    textAlign: 'center',
  },
  signUpLink: {
    fontSize: 14,
    marginTop: 20,
    color: ColorPalette.green,
    fontFamily: 'CG-Semibold',
  },
});

export default LoginScreen;
