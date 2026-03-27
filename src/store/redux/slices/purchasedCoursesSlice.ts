import { createSlice } from "@reduxjs/toolkit";
import { fetchPurchasedCourses } from "../thunks/purchasedCoursesThunk";
import { PurchasedCourse } from "../../purchasedCourses/types";

interface PurchasedCoursesState {
  items: PurchasedCourse[];
  loading: boolean;
  error: string | null;
}

const initialState: PurchasedCoursesState = {
  items: [],
  loading: false,
  error: null,
};

const purchasedCoursesSlice = createSlice({
  name: "purchasedCourses",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPurchasedCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPurchasedCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchPurchasedCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Failed to fetch purchased courses";
      });
  },
});

export default purchasedCoursesSlice.reducer;
