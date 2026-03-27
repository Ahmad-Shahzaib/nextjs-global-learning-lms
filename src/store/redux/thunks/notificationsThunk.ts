import { createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../../lib/axiosInstance';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (page: number = 1, { rejectWithValue }) => {
    try {
      // Add a cache-busting param to always get fresh data
      const ts = Date.now();
      const response = await apiClient.get(`/v2/admin/notifications?page=${page}&_ts=${ts}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
