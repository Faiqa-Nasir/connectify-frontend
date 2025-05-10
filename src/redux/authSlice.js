import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { refreshTokenAPI, storeTokens, removeTokens } from '../services/tokenService';

// Thunk to refresh tokens
export const refreshTokens = createAsyncThunk(
  'auth/refreshTokens',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const refreshToken = auth.tokens.refresh;
      
      if (!refreshToken) {
        return rejectWithValue('No refresh token available');
      }
      
      const newTokens = await refreshTokenAPI(refreshToken);
      
      // Store the new tokens in AsyncStorage
      await storeTokens(newTokens);
      
      return newTokens;
    } catch (error) {
      console.error('Failed to refresh tokens:', error);
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  isAuthenticated: false,
  user: null,
  tokens: {
    access: null,
    refresh: null
  },
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.tokens = action.payload.tokens;
      state.error = null;
      
      // Save tokens to AsyncStorage
      AsyncStorage.setItem('user', JSON.stringify(action.payload.user));
      storeTokens(action.payload.tokens);
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.tokens = {
        access: null,
        refresh: null
      };
      
      // Remove tokens and workspace data from AsyncStorage
      removeTokens();
      AsyncStorage.removeItem('rememberedEmail');
      AsyncStorage.removeItem('selectedWorkspace'); // Clear workspace data on logout
    },
    updateTokens: (state, action) => {
      state.tokens = action.payload;
      storeTokens(action.payload);
    },
    setAuthError: (state, action) => {
      state.error = action.payload;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
    restoreToken: (state, action) => {
      state.user = action.payload.user;
      state.tokens = action.payload.tokens;
      state.isAuthenticated = !!action.payload.tokens.access;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(refreshTokens.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(refreshTokens.fulfilled, (state, action) => {
        state.loading = false;
        state.tokens = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(refreshTokens.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// Add a logoutUser action to the authSlice if it doesn't exist already
export const logoutUser = () => (dispatch) => {
  // Simply dispatch the logout action
  dispatch({ type: 'auth/logout' });
};

export const { login, logout, updateTokens, setAuthError, clearAuthError, restoreToken } = authSlice.actions;
export default authSlice.reducer;
