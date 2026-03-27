import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiFetch } from '@/lib/api';
import apiClient from '@/lib/axiosInstance';

export type UserRole = 'admin' | 'student' | 'teacher' | 'organization' | 'education';

export interface User {
  id: string;
  email: string;
  full_name: string;
  roles: string[];
  is_blocked: boolean;
  user_id: string | null;
}

export interface CreateUserPayload {
  full_name: string;
  email: string;
  password: string;
  role_name: UserRole;
}

interface UsersState {
  users: User[];
  loading: boolean;
  error: string | null;
  creating: boolean;
  createError: string | null;
}

const initialState: UsersState = {
  users: [],
  loading: false,
  error: null,
  creating: false,
  createError: null,
};

export const fetchUsers = createAsyncThunk<User[]>(
  'users/fetchUsers',
  async () => {
    const data = await apiFetch<any[]>('/users');
    return (Array.isArray(data) ? data : []).map((u) => ({
      id: u.id,
      email: u.email,
      full_name: u.full_name || '',
      roles: u.roles || [],
      is_blocked: typeof u.is_blocked === 'boolean' ? u.is_blocked : u.is_blocked === 1 || u.is_blocked === '1',
      user_id: u.user_code || '',
    }));
  }
);

export const createUser = createAsyncThunk<User, CreateUserPayload, { rejectValue: string }>(
  'users/createUser',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/v2/admin/users/store', payload);
      const result = response.data;

      if (!result?.success) {
        return rejectWithValue(result?.message || 'Failed to create user');
      }

      const u = result.data.user;
      return {
        id: String(u.id),
        email: u.email ?? '',
        full_name: u.full_name ?? '',
        roles: u.role_name ? [u.role_name] : [],
        is_blocked: u.status !== 'active',
        user_id: String(u.id),
      } satisfies User;
    } catch (error: any) {
      const message =
        error?.response?.data?.message || error?.message || 'Failed to create user';
      return rejectWithValue(message);
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearCreateError(state) {
      state.createError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch users';
      })
      // createUser
      .addCase(createUser.pending, (state) => {
        state.creating = true;
        state.createError = null;
      })
      .addCase(createUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.creating = false;
        state.users.unshift(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.creating = false;
        state.createError = action.payload ?? 'Failed to create user';
      });
  },
});

export const { clearCreateError } = usersSlice.actions;
export default usersSlice.reducer;
