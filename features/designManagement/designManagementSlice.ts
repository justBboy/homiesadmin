import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

interface state {
  sidebarStreched: boolean;
}

const initialState: state = {
  sidebarStreched: true,
};

const slice = createSlice({
  name: "design",
  initialState,
  reducers: {
    setSidebarStreched: (state, action: PayloadAction<boolean>) => {
      state.sidebarStreched = action.payload;
    },
  },
});

export const { setSidebarStreched } = slice.actions;

export const selectSidebarStreched = (state: RootState) =>
  state.design.sidebarStreched;

export default slice.reducer;
