import axios from "axios";
import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "@/lib/axiosInstance";
import { AchievementApiResponse } from "./../slices/achievementsSlice";

export const fetchAchievements = createAsyncThunk<
  AchievementApiResponse,
  void,
  { rejectValue: string }
>("achievements/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const response = await apiClient.get<AchievementApiResponse>(
      "/v2/panel/certificates/achievements"
    );

    const data = response.data;
    if (!data.success) {
      return rejectWithValue(data.message ?? "Failed to fetch achievements");
    }

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message;
      return rejectWithValue(message);
    }

    return rejectWithValue(
      error instanceof Error ? error.message : "An unexpected error occurred"
    );
  }
});
