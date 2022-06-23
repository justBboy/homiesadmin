import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import {
  addFoodapi,
  addFoodCategoryApi,
  deleteFoodCategoriesApi,
  deleteFoodsApi,
  editFoodApi,
  editFoodCategoryApi,
  getFoodCategoriesApi,
  getFoodsApi,
  setFoodAvailableApi,
} from "./foodsApi";

export type foodType = {
  id: string;
  name: string;
  price: number;
  imgURL: string | ArrayBuffer | null | undefined;
  available?: boolean;
  orders: number;
  category:
    | {
        name: string;
        id: string;
      }
    | string;
  sales: number;
};

export type foodCategoryType = {
  id: string;
  name: string;
  imgURL: string | ArrayBuffer | null | undefined;
  sales: number;
  orders: number;
  numFoods: number;
};

interface state {
  foods: foodType[];
  foodCategories: foodCategoryType[];
  lastUpdateFoods: number;
  lastUpdateCategories: number;
}

const initialState: state = {
  foods: [],
  foodCategories: [],
  lastUpdateFoods: 0,
  lastUpdateCategories: 0,
};

export const getFoodCategories = createAsyncThunk(
  "foods/getFoodCategories",
  async (
    { page, lastUpdate }: { page: number; lastUpdate: number },
    thunkAPI
  ) => {
    const state = thunkAPI.getState() as RootState;
    const sLastUpdate = state.foods.lastUpdateCategories;
    console.log("updated =========> ", lastUpdate, sLastUpdate);
    if (sLastUpdate < lastUpdate || lastUpdate === 0) {
      const res = await getFoodCategoriesApi(page, lastUpdate);
      return res;
    } else {
      return null;
    }
  }
);

export const getFoods = createAsyncThunk(
  "foods/getFoods",
  async (
    { page, lastUpdate }: { page: number; lastUpdate: number },
    thunkAPI
  ) => {
    const state = thunkAPI.getState() as RootState;
    const sLastUpdate = state.foods.lastUpdateFoods;
    if (sLastUpdate < lastUpdate || lastUpdate === 0) {
      const res = await getFoodsApi(page, lastUpdate);
      return res;
    } else {
      return null;
    }
  }
);

export const addFoodCategory = createAsyncThunk(
  "foods/addFoodCategory",
  async (data: Partial<foodCategoryType>) => {
    const res = await addFoodCategoryApi(data);
    return res;
  }
);

export const addFood = createAsyncThunk(
  "foods/addFood",
  async (data: Partial<foodType>) => {
    const res = await addFoodapi(data);
    return res;
  }
);

export const deleteFoodCategories = createAsyncThunk(
  "foods/deleteFoodCategory",
  async (ids: string[]) => {
    const res = await deleteFoodCategoriesApi(ids);
    return res;
  }
);

export const deleteFoods = createAsyncThunk(
  "foods/deleteFoods",
  async (ids: string[]) => {
    const res = await deleteFoodsApi(ids);
    return res;
  }
);

export const editFoodCategory = createAsyncThunk(
  "foods/editFoodCategory",
  async ({ id, data }: { id: string; data: Partial<foodCategoryType> }) => {
    const res = await editFoodCategoryApi(id, data);
    return res;
  }
);

export const editFood = createAsyncThunk(
  "foods/editFood",
  async ({ id, data }: { id: string; data: Partial<foodType> }) => {
    const res = await editFoodApi(id, data);
    return res;
  }
);

export const setFoodAvailable = createAsyncThunk(
  "foods/setFoodCategory",
  async (id: string, thunkAPI) => {
    const state = thunkAPI.getState() as RootState;
    const cFood = state.foods.foods.find((f) => f.id === id);
    if (cFood) {
      const res = await setFoodAvailableApi(id, !cFood.available);
      return res;
    } else return null;
  }
);

export const slice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getFoodCategories.fulfilled, (state, action: any) => {
        if (!action.payload) return;
        console.log("payload ==========> ", action.payload);
        state.lastUpdateCategories = action.payload?.lastUpdate || 0;
        state.foodCategories = action.payload?.data || [];
      })
      .addCase(getFoods.fulfilled, (state, action: any) => {
        if (!action.payload) return;
        console.log("payload ==========> ", action.payload);
        state.lastUpdateFoods = action.payload?.lastUpdate || 0;
        state.foods = action.payload?.data || [];
      })
      .addCase(addFoodCategory.fulfilled, (state, action: any) => {
        state.foodCategories.unshift(action.payload);
      })
      .addCase(
        deleteFoodCategories.fulfilled,
        (state, action: PayloadAction<string[]>) => {
          state.foodCategories = state.foodCategories.filter((cat) => {
            return !action.payload.includes(cat.id);
          });
        }
      )
      .addCase(
        deleteFoods.fulfilled,
        (state, action: PayloadAction<string[]>) => {
          state.foods = state.foods.filter((f) => {
            return !action.payload.includes(f.id);
          });
        }
      )
      .addCase(editFoodCategory.fulfilled, (state, action: any) => {
        if (action.payload) {
          const indx = state.foodCategories.findIndex(
            (cat) => cat.id === action.payload?.id
          );
          if (indx !== -1) {
            const newData = {
              ...state.foodCategories[indx],
              ...action.payload.data,
            };
            state.foodCategories = state.foodCategories.filter(
              (s) => s.id !== action.payload?.id
            );
            state.foodCategories.unshift(newData);
          }
        }
      })
      .addCase(editFood.fulfilled, (state, action: any) => {
        if (action.payload) {
          const indx = state.foods.findIndex(
            (f) => f.id === action.payload?.id
          );
          if (indx !== -1) {
            const newData = {
              ...state.foods[indx],
              ...action.payload.data,
            };
            state.foods = state.foods.filter((f) => {
              return f.id !== action.payload?.id;
            });
            state.foods.unshift(newData);
          }
        }
      })
      .addCase(addFood.fulfilled, (state, action: any) => {
        state.foods.unshift(action.payload);
      })
      .addCase(setFoodAvailable.fulfilled, (state, action: any) => {
        if (!action.payload) return;
        const cIndx = state.foods.findIndex((f) => f.id === action.payload.id);
        if (cIndx !== -1) {
          state.foods[cIndx] = {
            ...state.foods[cIndx],
            available: action.payload.available,
          };
        }
      });
  },
});

export const selectFoods = (state: RootState) => state.foods.foods;
export const selectFoodCategories = (state: RootState) =>
  state.foods.foodCategories;
export const selectFood = (id: string) => {
  return (state: RootState) => {
    if (!id) return null;
    const food = state.foods.foods.find((c) => c.id === id);
    if (food) return food;
    return null;
  };
};
export const selectFoodCategory = (id: string) => {
  return (state: RootState) => {
    if (!id) return null;
    const category = state.foods.foodCategories.find((c) => c.id === id);
    if (category) return category;
    return null;
  };
};

export default slice.reducer;
