import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isAuth: false, // Initially, user is not authenticated
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state) => {
      state.isAuth = true;
    },
    logout: (state) => {
      state.isAuth = false;
    },
    signup: (state) => {
      state.isAuth = true;
    },
    forgotPassword: (state) => {
      state.isAuth = true;
    }
  },
});

export const { login, logout,signup,forgotPassword } = authSlice.actions;
export default authSlice.reducer;
