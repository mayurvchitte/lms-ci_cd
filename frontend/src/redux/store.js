// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./userSlice";
import courseSlice from "./courseSlice";
import lectureSlice from "./lectureSlice";
import reviewSlice from "./reviewSlice";
import liveSlice from "./liveSlice";
import redirectSlice from "./redirectSlice"; // ✅ NEW

export const store = configureStore({
  reducer: {
    user: userSlice,
    course: courseSlice,
    lecture: lectureSlice,
    review: reviewSlice,
    live: liveSlice,
    redirect: redirectSlice, // ✅ ADD THIS
  },
});