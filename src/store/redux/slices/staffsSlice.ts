import { createSlice } from '@reduxjs/toolkit';
import { fetchStaffs } from '../thunks/staffsThunk';
import type { Staff, StaffsPagination } from '../thunks/staffsThunk';

interface StaffsState {
  staffs: Staff[];
  pagination: Omit<StaffsPagination, 'data'> | null;
  loading: boolean;
  error: string | null;
}

const initialState: StaffsState = {
  staffs: [],
  pagination: null,
  loading: false,
  error: null,
};

const staffsSlice = createSlice({
  name: 'staffs',
  initialState,
  reducers: {
    resetStaffs(state) {
      state.staffs = [];
      state.pagination = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStaffs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStaffs.fulfilled, (state, action) => {
        const { data, ...pagination } = action.payload;
        state.loading = false;
        state.staffs = data;
        state.pagination = pagination;
        state.error = null;
      })
      .addCase(fetchStaffs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to load staffs';
      });
  },
});

export const { resetStaffs } = staffsSlice.actions;
export default staffsSlice.reducer;
