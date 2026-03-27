import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { loginThunk } from '../thunks/authThunk';
import { logoutThunk } from '../thunks/logoutThunk';


interface AuthState {
  token: string | null;
  user_id: number | null;
  role: string | null;
  loading: boolean;
  logoutLoading: boolean;
  error: string | null;
}

/** Rehydrate auth state from localStorage on every cold start / refresh.
 *  useAuth writes:  "token"       → raw JWT string
 *                   "auth:roles"  → JSON string array  e.g. ["admin"]
 *                   "auth:user"   → JSON object        e.g. { id: "5", ... }
 */
function loadPersistedAuth(): Pick<AuthState, 'token' | 'role' | 'user_id'> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const rawRoles = typeof window !== 'undefined' ? localStorage.getItem('auth:roles') : null;
    const rawUser  = typeof window !== 'undefined' ? localStorage.getItem('auth:user')  : null;

    const roles: string[] = rawRoles ? JSON.parse(rawRoles) : [];
    // Prefer "admin" if present, otherwise take the first role
    const role = roles.includes('admin')
      ? 'admin'
      : roles.length > 0
        ? roles[0]
        : null;

    const userObj = rawUser ? JSON.parse(rawUser) : null;
    const user_id = userObj?.id ? Number(userObj.id) : null;

    return { token, role, user_id };
  } catch {
    return { token: null, role: null, user_id: null };
  }
}

const persisted = loadPersistedAuth();

const initialState: AuthState = {
  token: persisted.token,
  user_id: persisted.user_id,
  role: persisted.role,
  loading: false,
  logoutLoading: false,
  error: null,
};


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.token = null;
      state.user_id = null;
      state.role = null;
      state.error = null;
      // Keep localStorage in sync when logging out via Redux
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('auth:roles');
        localStorage.removeItem('auth:user');
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        loginThunk.fulfilled,
        (
          state,
          action: PayloadAction<{ token: string; user_id: number; role: string }>
        ) => {
          state.loading = false;
          state.token = action.payload.token;
          state.user_id = action.payload.user_id;
          state.role = action.payload.role;
          state.error = null;
        }
      )
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Login failed';
      })
      // ── Logout ──────────────────────────────────────────────────────────
      .addCase(logoutThunk.pending, (state) => {
        state.logoutLoading = true;
        state.error = null;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.logoutLoading = false;
        state.token = null;
        state.user_id = null;
        state.role = null;
        state.error = null;
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('auth:roles');
          localStorage.removeItem('auth:user');
        }
      })
      .addCase(logoutThunk.rejected, (state, action) => {
        // Even on API error, clear local session so user is logged out
        state.logoutLoading = false;
        state.token = null;
        state.user_id = null;
        state.role = null;
        state.error = (action.payload as string) || 'Logout failed';
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('auth:roles');
          localStorage.removeItem('auth:user');
        }
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
