import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { exampleThunk } from '../thunks/exampleThunk';

interface ExampleState {
  value: number;
  loading: boolean;
  error: string | null;
}

const initialState: ExampleState = {
  value: 0,
  loading: false,
  error: null,
};

const exampleSlice = createSlice({
  name: 'example',
  initialState,
  reducers: {
    increment: (state) => { state.value += 1; },
    decrement: (state) => { state.value -= 1; },
    setValue: (state, action: PayloadAction<number>) => { state.value = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(exampleThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(exampleThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.value = action.payload;
      })
      .addCase(exampleThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error';
      });
  },
});

export const { increment, decrement, setValue } = exampleSlice.actions;
export default exampleSlice.reducer;
