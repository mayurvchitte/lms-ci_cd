// src/redux/redirectSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  path: null, // default path after login if nothing is set
};

const redirectSlice = createSlice({
  name: "redirect",
  initialState,
  reducers: {
    setRedirectPath: (state, action) => {
      state.path = action.payload;
    },
    clearRedirectPath: (state) => {
      state.path = null;
    },
  },
});

export const { setRedirectPath, clearRedirectPath } = redirectSlice.actions;
export default redirectSlice.reducer;