import { createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '@/lib/axiosInstance';

export interface ProfileUser {
  id: number | string;
  full_name: string;
  role_name?: string;
  email?: string;
  mobile?: string;
  avatar?: string;
  identity_scan?: string | null;
  [key: string]: any;
}

export const fetchProfileSetting = createAsyncThunk<ProfileUser>(
  'profile/fetchProfileSetting',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/v2/panel/profile-setting');
      const data = response.data;
      if (!data?.success) {
        return rejectWithValue(data?.message || 'Failed to fetch profile');
      }
      return data?.data?.user;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch profile');
    }
  }
);

export interface UpdateProfilePayload {
  full_name?: string;
  email?: string;
  bio?: string;
  timezone?: string;
  language?: string;
  newsletter?: boolean;
  [key: string]: any;
}

export const updateProfileSetting = createAsyncThunk<ProfileUser, UpdateProfilePayload>(
  'profile/updateProfileSetting',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await apiClient.put('/v2/panel/profile-setting', payload);
      const data = response.data;
      if (!data?.success) {
        return rejectWithValue(data?.message || 'Failed to update profile');
      }
      return data?.data?.user || {};
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update profile');
    }
  }
);
