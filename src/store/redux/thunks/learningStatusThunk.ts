import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "@/lib/axiosInstance";

interface LearningStatusPayload {
  courseId: number;
  item: string;
  item_id: number;
  status: boolean;
}

interface LearningStatusResponse {
  item: string;
  item_id: number;
  status: boolean;
}

export const updateLearningStatus = createAsyncThunk<
  LearningStatusResponse,
  LearningStatusPayload,
  { rejectValue: string }
>(
  "learningStatus/update",
  async ({ courseId, item, item_id, status }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(`/v2/panel/courses/${courseId}/learningStatus`, {
        item,
        item_id,
        status,
      });

      if (!response.data || response.data.success !== true) {
        return rejectWithValue(response.data?.message || "Failed to update learning status");
      }

      return response.data.data as LearningStatusResponse;
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || "Network error";
      return rejectWithValue(message);
    }
  }
);
