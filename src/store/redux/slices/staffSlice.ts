import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from '@/lib/axiosInstance';

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

export interface StaffState {
  data: Staff[];
  loading: boolean;
  error: string | null;
}

const initialState: StaffState = {
  data: [],
  loading: false,
  error: null,
};

export const fetchStaffs = createAsyncThunk<Staff[], void, { rejectValue: string }>(
  'staff/fetchStaffs',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/v2/admin/users/staffs');
      return response.data.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch staff');
    }
  }
);

const staffSlice = createSlice({
  name: 'staff',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStaffs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStaffs.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchStaffs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch staff';
      });
  },
});

export default staffSlice.reducer;
