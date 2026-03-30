import { createSlice } from "@reduxjs/toolkit";
import { Assignment, fetchMyAssignments, fetchAssignmentDetail, sendAssignmentMessage } from "../thunks/assignmentsThunk";

interface AssignmentsState {
  items: Assignment[];
  loading: boolean;
  error: string | null;
  selectedAssignment: Assignment | null;
  selectedLoading: boolean;
  selectedError: string | null;
  sendMessageLoading: boolean;
  sendMessageError: string | null;
  sendMessageSuccess: string | null;
}

const initialState: AssignmentsState = {
  items: [],
  loading: false,
  error: null,
  selectedAssignment: null,
  selectedLoading: false,
  selectedError: null,
  sendMessageLoading: false,
  sendMessageError: null,
  sendMessageSuccess: null,
};

const assignmentsSlice = createSlice({
  name: "assignments",
  initialState,
  reducers: {
    resetAssignments(state) {
      state.items = [];
      state.loading = false;
      state.error = null;
      state.selectedAssignment = null;
      state.selectedLoading = false;
      state.selectedError = null;
      state.sendMessageLoading = false;
      state.sendMessageError = null;
      state.sendMessageSuccess = null;
    },
    clearSelectedAssignment(state) {
      state.selectedAssignment = null;
      state.selectedLoading = false;
      state.selectedError = null;
    },
    clearSendMessageStatus(state) {
      state.sendMessageLoading = false;
      state.sendMessageError = null;
      state.sendMessageSuccess = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyAssignments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyAssignments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchMyAssignments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch assignments";
      })
      .addCase(fetchAssignmentDetail.pending, (state) => {
        state.selectedLoading = true;
        state.selectedError = null;
      })
      .addCase(fetchAssignmentDetail.fulfilled, (state, action) => {
        state.selectedLoading = false;
        state.selectedAssignment = action.payload;
      })
      .addCase(fetchAssignmentDetail.rejected, (state, action) => {
        state.selectedLoading = false;
        state.selectedError = action.payload || "Failed to fetch assignment detail";
      })
      .addCase(sendAssignmentMessage.pending, (state) => {
        state.sendMessageLoading = true;
        state.sendMessageError = null;
        state.sendMessageSuccess = null;
      })
      .addCase(sendAssignmentMessage.fulfilled, (state, action) => {
        state.sendMessageLoading = false;
        state.sendMessageSuccess = action.payload.message || "Message sent successfully";
      })
      .addCase(sendAssignmentMessage.rejected, (state, action) => {
        state.sendMessageLoading = false;
        state.sendMessageError = action.payload || "Failed to send assignment message";
      });
  },
});

export const { resetAssignments, clearSelectedAssignment, clearSendMessageStatus } = assignmentsSlice.actions;
export default assignmentsSlice.reducer;
