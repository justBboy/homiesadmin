import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

export type foodType = {
  id: string;
  name: string;
  imgURL: string;
  orders: number;
  category: string;
  sales: number;
};

export type foodCategory = {
  id: string;
  name: string;
  sales: number;
  orders: number;
  numFoods: number;
};

interface state {
  foods: foodType[];
  foodCategories: foodCategory[];
  lastUpdate: number;
}

const initialState: state = {
  foods: [],
  foodCategories: [],
  lastUpdate: 0,
};

export const slice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {},
});

export default slice.reducer;
