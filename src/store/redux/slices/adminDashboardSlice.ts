import { createSlice } from '@reduxjs/toolkit';
import { fetchAdminDashboardStats } from '../thunks/adminDashboardThunk';
import type { AdminDashboardCounts } from '../thunks/adminDashboardThunk';

interface AdminDashboardState {
  counts: AdminDashboardCounts | null;
  loading: boolean;
  error: string | null;
}

const initialState: AdminDashboardState = {
  counts: null,
  loading: false,
  error: null,
};

const adminDashboardSlice = createSlice({
  name: 'adminDashboard',
  initialState,
  reducers: {
    resetAdminDashboard(state) {
      state.counts = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.counts = action.payload;
        state.error = null;
      })
      .addCase(fetchAdminDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to load admin dashboard stats';
      });
  },
});

export const { resetAdminDashboard } = adminDashboardSlice.actions;
export default adminDashboardSlice.reducer;
