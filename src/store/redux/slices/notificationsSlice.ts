import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchNotifications } from '../thunks/notificationsThunk';

interface NotificationUser {
  id: number;
  full_name: string;
}

export interface NotificationItem {
  id: number;
  user_id: string;
  sender_id: number | null;
  group_id: number | null;
  webinar_id: number | null;
  title: string;
  message: string;
  sender: string;
  type: string;
  created_at: string;
  user: NotificationUser;
}

export interface NotificationsState {
  data: NotificationItem[];
  current_page: number;
  last_page: number;
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationsState = {
  data: [],
  current_page: 1,
  last_page: 1,
  total: 0,
  loading: false,
  error: null,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.data = action.payload.data || [];
        state.current_page = action.payload.current_page;
        state.last_page = action.payload.last_page;
        state.total = action.payload.total;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch notifications';
      });
  },
});

export default notificationsSlice.reducer;
