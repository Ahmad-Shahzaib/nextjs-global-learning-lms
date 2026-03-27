import { createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import apiClient from '../../../lib/axiosInstance';

export interface Staff {
  id: number;
  full_name: string;
  email: string;
  mobile: string | null;
  role_name: string;
  status: string;
  avatar: string | null;
  created_at: string;
}

export interface StaffsPagination {
  current_page: number;
  data: Staff[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

export const fetchStaffs = createAsyncThunk<
  StaffsPagination,
  number | void,
  { state: RootState; rejectValue: string }
>(
  'staffs/fetchStaffs',
  async (page = 1, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/v2/admin/users/staffs?page=${page}`);

      if (response.data?.success) {
        return response.data.data as StaffsPagination;
      }

      return rejectWithValue(response.data?.message || 'Failed to retrieve staffs');
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Network error'
      );
    }
  }
);
