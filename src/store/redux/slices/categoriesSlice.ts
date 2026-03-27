import { createSlice } from "@reduxjs/toolkit";
import { fetchCategories } from "../thunks/categoriesThunk";

export interface CategoryTranslation {
  id: number;
  category_id: string;
  locale: string;
  title: string;
}

export interface Category {
  id: number;
  slug: string;
  parent_id: number | null;
  icon: string;
  order: string;
  title: string | null;
  sub_categories: Category[];
  translations: CategoryTranslation[];
}

interface CategoriesState {
  data: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoriesState = {
  data: [],
  loading: false,
  error: null,
};

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch categories";
      });
  },
});

export default categoriesSlice.reducer;
