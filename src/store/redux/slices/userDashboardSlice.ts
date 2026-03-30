import { createSlice } from "@reduxjs/toolkit";
import { fetchUserDashboardInfo } from "../thunks/userDashboardThunk";

interface UserDashboardState {
  data: any;
  loading: boolean;
  error: string | null;
}

const initialState: UserDashboardState = {
  data: null,
  loading: false,
  error: null,
};

const userDashboardSlice = createSlice({
  name: "userDashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserDashboardInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserDashboardInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchUserDashboardInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default userDashboardSlice.reducer;
