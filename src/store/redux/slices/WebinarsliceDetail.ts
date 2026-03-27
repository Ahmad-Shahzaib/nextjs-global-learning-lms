// store/slices/webinarSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchWebinars, fetchWebinarById } from "../thunks/webinarThunkDetail";

// ─── COMMON TYPES ───────────────────────────

export interface Translation {
  id: number;
  locale: string;
  title?: string | null;
  description?: string | null;
  content?: string | null;
  [key: string]: unknown;
}

// ─── QUIZ ───────────────────────────

export interface QuizResult {
  id: number;
  quiz_id: string;
  user_id: string;
  results: string;
  feedback: string | null;
  file_path: string | null;
  user_grade: string | null;
  status: string;
  created_at: string;
}

export interface QuizQuestion {
  id: number;
  quiz_id: string;
  creator_id: string;
  grade: string;
  type: string;
  order: string;
  assessment: string;
  description?: string | null;
  title?: string | null;
  translations: Translation[];
}

export interface Quiz {
  id: number;
  webinar_id: string;
  creator_id: string;
  chapter_id: string;
  attempt: string;
  pass_mark: string;
  total_mark: string;
  status: string;
  created_at: string;
  updated_at: string | null;

  quiz_results: QuizResult[];
  quiz_questions: QuizQuestion[];
  translations: Translation[];
}

// ─── CHAPTER ───────────────────────────

export interface ChapterItem {
  id: number;
  chapter_id: string;
  item_id: string;
  type: "file" | "text_lesson" | "quiz";
  order: string;
}

export interface Chapter {
  id: number;
  user_id: string;
  webinar_id: string;
  order: string;
  status: string;
  created_at: string;

  chapter_items: ChapterItem[];
  translations: Translation[];
}

// ─── FILES ───────────────────────────

export interface FileItem {
  id: number;
  webinar_id: string;
  chapter_id: string;
  file: string;
  file_type: string;
  volume: string;
  downloadable: string;
  status: string;

  translations: Translation[];
}

// ─── TEXT LESSON ───────────────────────────

export interface TextLesson {
  id: number;
  webinar_id: string;
  chapter_id: string;
  status: string;
  created_at: string;
  updated_at: string;

  title?: string | null;
  summary?: string | null;
  content?: string | null;

  translations: Translation[];
}

// ─── CATEGORY ───────────────────────────

export interface Category {
  id: number;
  slug: string;
  title: string | null;
  translations: Translation[];
}

// ─── MAIN WEBINAR ───────────────────────────

export interface Webinar {
  id: number;
  teacher_id: string;
  creator_id: string;
  category_id: string;

  type: string;
  private: string;
  slug: string;

  start_date: string | null;
  duration: string;
  timezone: string;

  thumbnail: string | null;
  image_cover: string | null;
  video_demo: string | null;

  capacity: string;
  price: string;
  access_days: string;

  status: string;
  created_at: string;
  updated_at: string;

  sales_count: string;

  title: string | null;
  description: string | null;

  quizzes: Quiz[];
  chapters: Chapter[];
  files: FileItem[];
  text_lessons: TextLesson[];

  category: Category | null;

  // optional arrays from API
  tags: unknown[];
  prerequisites: unknown[];
  faqs: unknown[];
  webinar_extra_description: unknown[];

  reviews: unknown[];
  comments: unknown[];
  sessions: unknown[];
  assignments: unknown[];
  tickets: unknown[];

  translations: Translation[];
}

// ─── API RESPONSE ───────────────────────────

export interface WebinarApiResponse {
  success: boolean;
  status: string;
  message: string;
  data: Webinar[];
}

// ─── STATE ───────────────────────────

export interface WebinarState {
  webinars: Webinar[];
  selectedWebinar: Webinar | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

// ─── INITIAL STATE ───────────────────────────

const initialState: WebinarState = {
  webinars: [],
  selectedWebinar: null,
  loading: false,
  error: null,
  success: false,
};

// ─── SLICE ───────────────────────────

const webinarSlice = createSlice({
  name: "webinar",
  initialState,
  reducers: {
    clearSelectedWebinar(state) {
      state.selectedWebinar = null;
    },
    clearError(state) {
      state.error = null;
    },
    resetState() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // ─── GET ALL ───
      .addCase(fetchWebinars.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(
        fetchWebinars.fulfilled,
        (state, action: PayloadAction<WebinarApiResponse>) => {
          state.loading = false;
          state.success = true;
          state.webinars = action.payload.data;
        }
      )
      .addCase(fetchWebinars.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch webinars";
      })

      // ─── GET SINGLE ───
      .addCase(fetchWebinarById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchWebinarById.fulfilled,
        (state, action: PayloadAction<Webinar>) => {
          state.loading = false;
          state.selectedWebinar = action.payload;
        }
      )
      .addCase(fetchWebinarById.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Failed to fetch webinar";
      });
  },
});

export const { clearSelectedWebinar, clearError, resetState } =
  webinarSlice.actions;

export default webinarSlice.reducer;