import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import {
  addCustomSaleApi,
  deleteCustomSalesApi,
  getCustomSalesApi,
} from "./customSalesApi";

export type orderType = {
  id: string;
  totalPrice: number;
  items: {
    id: string;
    itemCategory: string;
    price: number;
    quantity: number;
  }[];
  createdAt?: {
    nanoseconds: number;
    seconds: number;
  };
  csale?: boolean;
};

interface state {
  customSales: {
    data: orderType[];
    page: number;
    lastUpdate: number;
  }[];
  lastUpdate: {
    nanoseconds: number;
    seconds: number;
  };
  lastDoc: Document | null;
  lastPage: number;
}

const initialState: state = {
  customSales: [{ data: [], page: 1, lastUpdate: 0 }],
  lastUpdate: {
    nanoseconds: 0,
    seconds: 0,
  },
  lastDoc: null,
  lastPage: 1,
};

export const getCustomSales = createAsyncThunk(
  "customSales/get",
  async (
    { page, lastUpdate }: { page: number; lastUpdate: number },
    thunkAPI
  ) => {
    const state = thunkAPI.getState() as RootState;
    const cIndx = state.customSales.customSales.findIndex(
      (c) => c.page === page
    );
    if (cIndx === -1) {
      const lastDoc = state.customSales.lastDoc;
      const res = await getCustomSalesApi(page, lastDoc, lastUpdate);
      return res;
    } else {
      const isUpdated =
        state.customSales.customSales[cIndx]?.lastUpdate < lastUpdate ||
        lastUpdate === 0;

      if (isUpdated) {
        const lastDoc = state.customSales.lastDoc;
        const res = await getCustomSalesApi(page, lastDoc, lastUpdate);
        return res;
      } else {
        return {
          data: state.customSales.customSales[cIndx].data,
          page: state.customSales.customSales[cIndx].page,
        };
      }
    }
  }
);

export const deleteCustomSales = createAsyncThunk(
  "customSales/delete",
  async (ids: string[]) => {
    const res = await deleteCustomSalesApi(ids);
    return res;
  }
);

export const addCustomSale = createAsyncThunk(
  "customSales/add",
  async (data: Partial<orderType>) => {
    const res = await addCustomSaleApi(data);
    return res;
  }
);

const slice = createSlice({
  name: "customSales",
  initialState,
  reducers: {
    setLastUpdate: (
      state,
      action: PayloadAction<{ seconds: number; nanoseconds: number }>
    ) => {
      state.lastUpdate = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCustomSales.fulfilled, (state, action: any) => {
        const cIndex = state.customSales.findIndex(
          (c) => c.page === action.payload.page
        );
        console.log("last update ==========> ", action.payload.lastUpdate);
        const item = {
          data: action.payload.data,
          page: action.payload.page,
          lastUpdate: action.payload.lastUpdate,
        };
        if (cIndex !== -1) state.customSales[cIndex] = item;
        else state.customSales.push(item);
        const lastPageNumber =
          state.customSales[state.customSales.length - 1].page;
        if (action.payload.lastDoc && lastPageNumber <= action.payload.page)
          state.lastDoc = action.payload.lastDoc;
      })
      .addCase(
        deleteCustomSales.fulfilled,
        (state, action: PayloadAction<string[]>) => {
          state.customSales.forEach((c, indx) => {
            state.customSales[indx].data = c.data.filter((d) => {
              return !action.payload.includes(d.id);
            });
          });
        }
      )
      .addCase(addCustomSale.fulfilled, (state, action: any) => {
        if (!action.payload) return;
        state.customSales[0].data = [
          ...state.customSales[0].data,
          action.payload,
        ];
      });
  },
});

export const { setLastUpdate } = slice.actions;

export const selectCustomSales = (page: number) => {
  return (state: RootState) => {
    const cIndx = state.customSales.customSales.findIndex(
      (c) => c.page === page
    );
    if (cIndx !== -1) return state.customSales.customSales[cIndx].data;
    else return state.customSales.customSales[0].data;
  };
};

export const selectLastUpdated = (state: RootState) =>
  state.customSales.lastUpdate;
export default slice.reducer;
