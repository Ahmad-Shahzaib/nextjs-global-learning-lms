import { createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import apiClient from '../../../lib/axiosInstance';

export interface AdminDashboardCounts {
  total_users: number;
  total_courses: number;
  total_sales: number;
  open_tickets: number;
}

export const fetchAdminDashboardStats = createAsyncThunk<
  AdminDashboardCounts,
  void,
  { state: RootState; rejectValue: string }
>(
  'adminDashboard/fetchStats',
  async (_, { getState, rejectWithValue }) => {
    const { auth } = getState();

    // Role validation — only admins may call this endpoint
    if (!auth.role || auth.role.toLowerCase() !== 'admin') {
      return rejectWithValue('Access denied: admin role required');
    }

    if (!auth.token) {
      return rejectWithValue('Unauthorized: no auth token found');
    }

    try {
      // apiClient automatically attaches Authorization + x-api-key headers
      const response = await apiClient.get('/v2/admin/dashboard');

      if (response.data?.success) {
        return response.data.data.counts as AdminDashboardCounts;
      }

      return rejectWithValue(response.data?.message || 'Failed to retrieve admin dashboard stats');
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Network error'
      );
    }
  }
);
