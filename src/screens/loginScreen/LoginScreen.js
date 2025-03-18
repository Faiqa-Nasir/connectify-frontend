import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { AntDesign } from '@expo/vector-icons';
import CustomCheckbox from "../../components/CustomCheckbox";
import CustomButton from "../../components/CustomButton";
import { useDispatch } from "react-redux";
import { login } from "../../redux/authSlice";
import ColorPalette from "../../constants/ColorPalette";
import CustomInput from "../../components/CustomInput";
import RoundedContainer from "../../components/RoundedContainer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CustomAlert from "../../components/CustomAlert";
import api from '../../services/apiService';
import { BASE_URL, AUTH_ENDPOINTS } from '../../constants/ApiConstants';

const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // Alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const showAlert = (type, message, duration = 3000) => {
    setAlertType(type);
    setAlertMessage(message);
    setAlertVisible(true);
    
    if (type !== 'loading') {
      // Automatically hide non-loading alerts after duration
      setTimeout(() => {
        setAlertVisible(false);
      }, duration);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert('error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);
    showAlert('loading', 'Logging in...');

    try {
      const response = await api.post(AUTH_ENDPOINTS.LOGIN, {
        login: email,
        password: password
      });
      
      const responseData = response.data;
      
      // If remember me is checked, store credentials
      if (rememberMe) {
        await AsyncStorage.setItem('rememberedEmail', email);
      } else {
        await AsyncStorage.removeItem('rememberedEmail');
      }

      // Update Redux state
      dispatch(login({
        user: responseData.user,
        tokens: {
          access: responseData.access,
          refresh: responseData.refresh
        }
      }));
      
      setAlertVisible(false); // Hide the loading alert
      // No need to navigate - the Navigator will handle this
    } catch (error) {
      // Handle the error with user-friendly messages
      let userFriendlyMessage = 'Unable to sign in. Please check your details and try again.';
      
      if (error.message.includes('network') || error.message.includes('connect')) {
        userFriendlyMessage = 'Network error. Please check your internet connection.';
      } else if (error.response && error.response.status === 401) {
        userFriendlyMessage = 'Invalid email or password. Please try again.';
      }
      
      showAlert('error', userFriendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Load remembered email if exists
  useEffect(() => {
    const loadRememberedEmail = async () => {
      try {
        const rememberedEmail = await AsyncStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
          setEmail(rememberedEmail);
          setRememberMe(true);
        }
      } catch (error) {
        console.error('Error loading remembered email:', error);
      }
    };
    
    loadRememberedEmail();
  }, []);

  return (
    
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Connectify</Text>
      <RoundedContainer>
        <Text style={styles.loginTitle}>Login</Text>
        <Text style={styles.subtitle}>Enter your email and password to Login</Text>
        
        <CustomInput
          placeholder="Email or Username"
          onChangeText={setEmail}
          value={email}
          autoCapitalize="none"
        />
        <CustomInput
          placeholder="Password"
          secureTextEntry
          onChangeText={setPassword}
          value={password}
        />
        <View style={styles.rememberForgotContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <CustomCheckbox
              value={rememberMe}
              onValueChange={setRememberMe}
            />
            <Text style={styles.rememberMe}>Remember Me</Text>
          </View>
          <TouchableOpacity onPress={()=>navigation.navigate('ForgotPasswordScreen')}>
            <Text style={styles.forgotPassword}>Forgotten Password?</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.signUpText}>Don't have an account? <Text style={styles.signUpLink} onPress={() => navigation.navigate('SignupScreen')}>Sign up</Text></Text>

        <CustomButton
          title="Login"
          onPress={handleLogin}
          disabled={isLoading}
        />
        
        <View style={styles.orContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.description}>Or login with</Text>
          <View style={styles.dividerLine} />
        </View>
        
        <CustomButton
          title="Continue with Google"
          backgroundColor={ColorPalette.white}
          textColor={ColorPalette.text_black}
          icon={<AntDesign name="google" size={20} color={ColorPalette.text_black} />}
          borderColor={ColorPalette.grey_light}
          style={styles.googleButton}
        />
      </RoundedContainer>
      
      {/* Custom Alert */}
      <CustomAlert 
        visible={alertVisible}
        type={alertType}
        message={alertMessage}
        loading={alertType === 'loading'}
      />
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
    textAlign: 'center',
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
    marginTop: 5,
    marginBottom: 5,
    fontFamily: 'CG-Regular',
    textAlign: 'center'
  },
  googleLogo: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  signUpText: {
    fontSize: 14,
    marginTop: 10,
    color: ColorPalette.text_black,
    fontFamily: 'CG-Regular',
    textAlign: 'center',
  },
  signUpLink: {
    fontSize: 14,
    marginTop: 10,
    color: ColorPalette.green,
    fontFamily: 'CG-Semibold',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'CG-Regular',
  },
  loader: {
    marginTop: 10,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
    width: '100%',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: ColorPalette.grey_light,
  },
  googleButton: {
    marginTop: 5,
  },
});

export default LoginScreen;
