// store/thunks/webinarThunk.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import { WebinarApiResponse, Webinar } from "./../slices/WebinarsliceDetail";

export const fetchWebinars = createAsyncThunk<
  WebinarApiResponse,
  void,
  { rejectValue: string }
>("webinar/fetchAll", async (_, { rejectWithValue }) => {
  try {
    const response = await fetch("/v2/panel/webinars", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
      },
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data: WebinarApiResponse = await response.json();

    if (!data.success) return rejectWithValue(data.message ?? "Failed to fetch webinars");

    return data;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "An unexpected error occurred"
    );
  }
});

export const fetchWebinarById = createAsyncThunk<
  Webinar,
  number,
  { rejectValue: string }
>("webinar/fetchById", async (id, { rejectWithValue }) => {
  try {
    const response = await fetch(`/v2/panel/webinars/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token") ?? ""}`,
      },
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data: WebinarApiResponse = await response.json();

    if (!data.success || !data.data[0]) return rejectWithValue(data.message ?? "Webinar not found");

    return data.data[0];
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "An unexpected error occurred"
    );
  }
});