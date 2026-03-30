import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchProfileSetting, updateProfileSetting, ProfileUser } from '../thunks/profileThunk';

interface ProfileState {
  user: ProfileUser | null;
  loading: boolean;
  error: string | null;
  updating: boolean;
  updateError: string | null;
}

const initialState: ProfileState = {
  user: null,
  loading: false,
  error: null,
  updating: false,
  updateError: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfileError(state) {
      state.error = null;
      state.updateError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfileSetting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfileSetting.fulfilled, (state, action: PayloadAction<ProfileUser>) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchProfileSetting.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Could not load profile';
      })
      .addCase(updateProfileSetting.pending, (state) => {
        state.updating = true;
        state.updateError = null;
      })
      .addCase(updateProfileSetting.fulfilled, (state, action: PayloadAction<ProfileUser>) => {
        state.updating = false;
        state.user = action.payload;
      })
      .addCase(updateProfileSetting.rejected, (state, action) => {
        state.updating = false;
        state.updateError = (action.payload as string) || 'Could not update profile';
      });
  },
});

export const { clearProfileError } = profileSlice.actions;
export default profileSlice.reducer;
