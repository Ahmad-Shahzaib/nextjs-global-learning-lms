import { createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import apiClient from '../../../lib/axiosInstance';

export interface Student {
  id: number;
  full_name: string | null;
  email: string;
  mobile: string | null;
  role_name: string;
  status: string;
  avatar: string | null;
  created_at: string;
}

export interface StudentsPagination {
  current_page: number;
  data: Student[];
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

export const fetchStudents = createAsyncThunk<
  StudentsPagination,
  number | void,
  { state: RootState; rejectValue: string }
>(
  'students/fetchStudents',
  async (page = 1, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/v2/admin/users/students?page=${page}`);

      if (response.data?.success) {
        return response.data.data as StudentsPagination;
      }

      return rejectWithValue(response.data?.message || 'Failed to retrieve students');
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Network error'
      );
    }
  }
);
