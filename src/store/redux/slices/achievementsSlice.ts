import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchAchievements } from "../thunks/achievementsThunk";

export interface AchievementCertificate {
  id: number;
  user_grade: string;
  file: string | null;
  created_at: string;
}

export interface AchievementUser {
  id: number;
  full_name: string;
  role_name: string;
  avatar?: string;
}

export interface AchievementTeacher extends AchievementUser {
  bio?: string;
}

export interface AchievementWebinar {
  id: number;
  title: string;
  type: string;
  status: string;
  link?: string;
  category?: string;
  access_days?: string;
  price_string?: string;
  students_count?: number;
  progress?: number;
  progress_percent?: number;
  teacher?: AchievementTeacher;
}

export interface AchievementQuiz {
  id: number;
  title: string;
  time: string;
  question_count: number;
  total_mark: number;
  pass_mark: string;
  average_grade: number;
  success_rate: number;
  status: string;
  attempt: string;
  auth_status: string;
  teacher?: AchievementTeacher;
}

export interface AchievementItem {
  id: number;
  quiz: AchievementQuiz;
  webinar: AchievementWebinar;
  user: AchievementUser;
  user_grade: string;
  status: string;
  created_at: string;
  certificate?: AchievementCertificate;
}

export interface AchievementApiResponse {
  success: boolean;
  status: string;
  message: string;
  data: AchievementItem[];
}

export interface AchievementsState {
  items: AchievementItem[];
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: AchievementsState = {
  items: [],
  loading: false,
  error: null,
  success: false,
};

const achievementsSlice = createSlice({
  name: "achievements",
  initialState,
  reducers: {
    clearAchievementsError(state) {
      state.error = null;
    },
    resetAchievements(state) {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAchievements.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(
        fetchAchievements.fulfilled,
        (state, action: PayloadAction<AchievementApiResponse>) => {
          state.loading = false;
          state.success = true;
          state.items = action.payload.data;
        }
      )
      .addCase(fetchAchievements.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to load achievements";
      });
  },
});

export const { clearAchievementsError, resetAchievements } = achievementsSlice.actions;
export default achievementsSlice.reducer;
