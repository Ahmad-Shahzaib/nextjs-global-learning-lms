import { createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '@/lib/axiosInstance';

/**
 * Logout thunk — POST /v2/logout
 *
 * Expected response:
 * {
 *   "success": true,
 *   "status": "logout",
 *   "message": "Logout"
 * }
 */
export const logoutThunk = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<{
        success: boolean;
        status: string;
        message: string;
      }>('/v2/logout');

      if (response.data.success) {
        return response.data;
      }

      return rejectWithValue(response.data.message || 'Logout failed');
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Logout failed'
      );
    }
  }
);
