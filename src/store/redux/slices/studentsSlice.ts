import { createSlice } from '@reduxjs/toolkit';
import { fetchStudents } from '../thunks/studentsThunk';
import type { Student, StudentsPagination } from '../thunks/studentsThunk';

interface StudentsState {
  students: Student[];
  pagination: Omit<StudentsPagination, 'data'> | null;
  loading: boolean;
  error: string | null;
}

const initialState: StudentsState = {
  students: [],
  pagination: null,
  loading: false,
  error: null,
};

const studentsSlice = createSlice({
  name: 'students',
  initialState,
  reducers: {
    resetStudents(state) {
      state.students = [];
      state.pagination = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        const { data, ...pagination } = action.payload;
        state.loading = false;
        state.students = data;
        state.pagination = pagination;
        state.error = null;
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to load students';
      });
  },
});

export const { resetStudents } = studentsSlice.actions;
export default studentsSlice.reducer;
