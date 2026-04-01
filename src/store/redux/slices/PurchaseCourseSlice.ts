import { createSlice } from "@reduxjs/toolkit";
import { fetchPurchasedCourses } from "../thunks/PurchasedCoursesThunk";
import { PurchasedCourse } from "../../purchasedCourses/types";

interface PurchasedCoursesState {
  items: PurchasedCourse[];
  loading: boolean;
  error: string | null;
  /** Unix-ms timestamp of the last successful fetch, or null if never fetched */
  lastFetchedAt: number | null;
  /** True once at least one successful fetch has completed */
  loaded: boolean;
}

const initialState: PurchasedCoursesState = {
  items: [],
  loading: false,
  error: null,
  lastFetchedAt: null,
  loaded: false,
};

const purchasedCoursesSlice = createSlice({
  name: "purchasedCourses",
  initialState,
  reducers: {
    /** Call this to forcibly mark the cache as stale (e.g. after purchase) */
    invalidatePurchasedCourses(state) {
      state.loaded = false;
      state.lastFetchedAt = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPurchasedCourses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPurchasedCourses.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.loaded = true;
        state.lastFetchedAt = Date.now();
      })
      .addCase(fetchPurchasedCourses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || "Failed to fetch purchased courses";
      });
  },
});

export const { invalidatePurchasedCourses } = purchasedCoursesSlice.actions;
export default purchasedCoursesSlice.reducer;
