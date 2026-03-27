import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "@/lib/axiosInstance";
import { Category } from "../slices/categoriesSlice";

export const fetchCategories = createAsyncThunk<Category[]>(
  "categories/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get("/v2/admin/categories");
      // The API returns { data: { data: Category[] } }
      return response.data.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch categories");
    }
  }
);
