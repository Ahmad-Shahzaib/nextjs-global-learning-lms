import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "@/lib/axiosInstance";

export interface AssignmentStudent {
  id: number;
  full_name: string;
  email: string;
  avatar: string;
}

export interface AssignmentCan {
  send_message: boolean;
}

export interface Assignment {
  id: number;
  title: string;
  description: string;
  deadline: number;
  deadline_time: number;
  webinar_title: string;
  webinar_image: string;
  first_submission: string;
  last_submission: string;
  attempts: string;
  used_attempts_count: number;
  grade: string | null;
  total_grade: string;
  pass_grade: string;
  purchase_date: string;
  user_status: string;
  attachments: any[];
  student: AssignmentStudent;
  can: AssignmentCan;
  can_view_error?: string;
}

export const fetchMyAssignments = createAsyncThunk<Assignment[], void, { rejectValue: string }>(
  "assignments/fetchMyAssignments",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<{ success: boolean; data: { assignments: Assignment[] }; message?: string }>(
        "/v2/panel/my-assignments",
      );

      if (response.data?.success) {
        const assignments = response.data?.data?.assignments;

        if (!Array.isArray(assignments)) {
          return rejectWithValue("Unexpected assignments payload format");
        }

        return assignments;
      }

      return rejectWithValue(response.data?.message || "Failed to load assignments");
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || "Network error");
    }
  },
);

export const fetchAssignmentDetail = createAsyncThunk<Assignment, number, { rejectValue: string }>(
  "assignments/fetchAssignmentDetail",
  async (assignmentId, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<{
        success: boolean;
        status: string;
        message?: string;
        data: Assignment;
      }>(`/v2/panel/my-assignments/${assignmentId}`);

      if (response.data?.success) {
        const assignment = response.data.data;
        if (!assignment || typeof assignment !== "object") {
          return rejectWithValue("Unexpected assignment detail payload format");
        }
        return assignment;
      }

      return rejectWithValue(response.data?.message || "Failed to load assignment details");
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || "Network error");
    }
  },
);

export interface SendAssignmentMessageParams {
  assignmentId: number;
  message: string;
  file?: File | null;
}

export interface SendAssignmentMessageResponse {
  success: boolean;
  status: string;
  message: string;
}

export const sendAssignmentMessage = createAsyncThunk<SendAssignmentMessageResponse, SendAssignmentMessageParams, { rejectValue: string }>(
  "assignments/sendAssignmentMessage",
  async ({ assignmentId, message, file }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("message", message);

      if (file) {
        formData.append("file", file);
      }

      const response = await apiClient.post<SendAssignmentMessageResponse>(
        `/v2/panel/assignments/${assignmentId}/messages`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.data?.success) {
        return response.data;
      }

      return rejectWithValue(response.data?.message || "Failed to send assignment message");
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || "Network error");
    }
  },
);
