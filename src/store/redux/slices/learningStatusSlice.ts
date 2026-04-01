import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { updateLearningStatus } from "@/store/redux/thunks/learningStatusThunk";

export interface LearningStatusState {
  statuses: Record<string, boolean>;
  loading: boolean;
  error: string | null;
}

const initialState: LearningStatusState = {
  statuses: {},
  loading: false,
  error: null,
};

const learningStatusSlice = createSlice({
  name: "learningStatus",
  initialState,
  reducers: {
    setLearningStatusLocal(state, action: PayloadAction<{ key: string; status: boolean }>) {
      state.statuses[action.payload.key] = action.payload.status;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(updateLearningStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLearningStatus.fulfilled, (state, action) => {
        state.loading = false;
        const key = `${action.payload.item}:${action.payload.item_id}`;
        state.statuses[key] = action.payload.status;
      })
      .addCase(updateLearningStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update learning status";
      });
  },
});

export const { setLearningStatusLocal } = learningStatusSlice.actions;
export default learningStatusSlice.reducer;
