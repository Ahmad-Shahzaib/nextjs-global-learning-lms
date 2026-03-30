import { createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '@/lib/axiosInstance';

export interface CommentResponse {
  my_comment: {
    blogs: any[];
    webinar: any[];
  };
  class_comment: any[];
}

export const fetchComments = createAsyncThunk<CommentResponse>(
  'comments/fetchComments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/v2/panel/comments');
      if (!response.data?.success) {
        return rejectWithValue(response.data?.message || 'Failed to fetch comments');
      }
      return response.data.data as CommentResponse;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message || 'Failed to fetch comments');
    }
  }
);
