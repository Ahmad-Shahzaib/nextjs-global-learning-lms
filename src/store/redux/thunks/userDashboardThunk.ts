import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/lib/axiosInstance";

export const fetchUserDashboardInfo = createAsyncThunk(
  "userDashboard/fetchInfo",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/v2/panel/quick-info");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
