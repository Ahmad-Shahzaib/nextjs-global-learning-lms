import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchComments, CommentResponse } from '../thunks/commentsThunk';

interface CommentsState {
  data: CommentResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: CommentsState = {
  data: null,
  loading: false,
  error: null,
};

const commentsSlice = createSlice({
  name: 'comments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchComments.fulfilled, (state, action: PayloadAction<CommentResponse>) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchComments.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Failed to fetch comments';
      });
  },
});

export default commentsSlice.reducer;
