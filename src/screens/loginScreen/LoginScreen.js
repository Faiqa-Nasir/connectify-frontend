import React from "react";
import { View, Text, Button,NavigationContainer } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../redux/authSlice";

const LoginScreen = () => {
  const dispatch = useDispatch();
  const isAuth = useSelector((state) => state.auth.isAuth);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>
        {isAuth ? "You are logged in!" : "Please log in"}
      </Text>
      {!isAuth && (
        <Button title="Login" onPress={() => dispatch(login())} />
      )}
    </View>
  );
};

export default LoginScreen;
