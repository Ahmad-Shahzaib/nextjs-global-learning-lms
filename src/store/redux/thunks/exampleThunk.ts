import { createAsyncThunk } from '@reduxjs/toolkit';

export const exampleThunk = createAsyncThunk<number, void>(
  'example/fetchValue',
  async (_, thunkAPI) => {
    // Simulate async fetch
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return 42;
  }
);
