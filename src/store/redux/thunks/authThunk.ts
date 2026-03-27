import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Use API base URL from environment variable
const API_BASE_URL = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE_URL)
  ? import.meta.env.VITE_API_BASE_URL.replace(/\/?$/, "")
  : "https://api.globallearnerseducation.com/api";

export const loginThunk = createAsyncThunk(
  'auth/login',
  async (
    { username, password }: { username: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/v2/login`,
        {
          username,
          password,
        },
        {
          headers: {    
            'x-api-key': '1234',
          },
        }
      );
      if (response.data.success) {
        // Return the whole data object (token, user_id, role)
        return response.data.data;
      } else {
        return rejectWithValue(response.data.message || 'Login failed');
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Login failed');
    }
  }
);
