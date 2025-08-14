// client/src/features/auth/authSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';

// --- Function to get the initial state from localStorage ---
const getInitialState = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return { token: null, user: null, isAuthenticated: false, isLoading: false };
  }
  
  try {
    const decodedUser = jwtDecode(token).user;
    // You can add an expiration check here if you want in the future
    return { token, user: decodedUser, isAuthenticated: true, isLoading: false };
  } catch (error) {
    // If token is invalid, clear it
    localStorage.removeItem('token');
    return { token: null, user: null, isAuthenticated: false, isLoading: false };
  }
};

export const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    // --- Reducer for successful login/register ---
    setCredentials: (state, action) => {
      const { token } = action.payload;
      localStorage.setItem('token', token);
      state.token = token;
      state.isAuthenticated = true;
      state.user = jwtDecode(token).user;
    },
    // --- Reducer for logout ---
    logOut: (state) => {
      localStorage.removeItem('token');
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, logOut } = authSlice.actions;

export default authSlice.reducer;