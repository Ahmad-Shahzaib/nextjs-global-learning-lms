import { createAsyncThunk } from "@reduxjs/toolkit";
import { PurchasedCourse } from "../../purchasedCourses/types";
import apiClient from "@/lib/axiosInstance";

// points to /v2/panel/webinars/purchases, and apiClient.baseURL is built from VITE_API_BASE_URL
const API_URL = "/v2/panel/webinars/purchases";

export const fetchPurchasedCourses = createAsyncThunk<PurchasedCourse[]>(
  "purchasedCourses/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<{ data: PurchasedCourse[] }>(API_URL);
      if (response.data && Array.isArray((response.data as any).data)) {
        return (response.data as any).data as PurchasedCourse[];
      }
      if (Array.isArray(response.data as unknown)) {
        return response.data as unknown as PurchasedCourse[];
      }
      return rejectWithValue("Unexpected purchased courses format");
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
  {
    condition: (_, { getState }) => {
      const { purchasedCourses } = getState() as { purchasedCourses: { loaded: boolean; loading: boolean } };
      if (purchasedCourses.loading || purchasedCourses.loaded) {
        return false; // Skip if already loading or already loaded
      }
      return true;
    },
  }
);
