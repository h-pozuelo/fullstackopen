import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notification",
  initialState: "",
  reducers: {
    setMessage(state, action) {
      const message = action.payload;
      return message;
    },
    cleanMessage(state, action) {
      return "";
    },
  },
});

export const { setMessage, cleanMessage } = notificationSlice.actions;

export const setNotification =
  (message, duration) => async (dispatch, getState) => {
    dispatch(setMessage(message));
    setTimeout(() => {
      dispatch(cleanMessage());
    }, Number(duration * 1000));
  };

export default notificationSlice.reducer;
