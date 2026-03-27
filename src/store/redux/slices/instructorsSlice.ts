import { createSlice } from '@reduxjs/toolkit';
import { fetchInstructors } from '../thunks/instructorsThunk';
import type { Instructor, InstructorsPagination } from '../thunks/instructorsThunk';

interface InstructorsState {
  instructors: Instructor[];
  pagination: Omit<InstructorsPagination, 'data'> | null;
  loading: boolean;
  error: string | null;
}

const initialState: InstructorsState = {
  instructors: [],
  pagination: null,
  loading: false,
  error: null,
};

const instructorsSlice = createSlice({
  name: 'instructors',
  initialState,
  reducers: {
    resetInstructors(state) {
      state.instructors = [];
      state.pagination = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInstructors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInstructors.fulfilled, (state, action) => {
        const { data, ...pagination } = action.payload;
        state.loading = false;
        state.instructors = data;
        state.pagination = pagination;
        state.error = null;
      })
      .addCase(fetchInstructors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to load instructors';
      });
  },
});

export const { resetInstructors } = instructorsSlice.actions;
export default instructorsSlice.reducer;
