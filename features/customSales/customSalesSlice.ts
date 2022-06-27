import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import {
  addCustomSaleApi,
  deleteCustomSalesApi,
  editCustomSaleApi,
  getCustomSalesApi,
} from "./customSalesApi";

export type orderType = {
  id: string;
  totalPrice: number;
  items: {
    id: string;
    foodName: string;
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
        lastUpdate === 0 ||
        !lastUpdate ||
        !state.customSales.customSales[cIndx].lastUpdate;

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
  async (data: Partial<orderType>, thunkAPI) => {
    const res = await addCustomSaleApi(data);
    return res;
  }
);

export const editCustomSale = createAsyncThunk(
  "customSales/edit",
  async ({ data, id }: { data: Partial<orderType>; id: string }) => {
    const res = await editCustomSaleApi(data, id);
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
          lastUpdate: action.payload.lastUpdate || 0,
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
      })
      .addCase(editCustomSale.fulfilled, (state, action: any) => {
        if (!action.payload) return;
        state.customSales.every((c, indx) => {
          const cIndx = c.data.findIndex((s) => {
            console.log(s.id, action.payload.id);
            return s.id === action.payload.id;
          });
          console.log(cIndx);
          if (cIndx !== -1) {
            state.customSales[indx].data[cIndx] = action.payload.data;
            return false;
          }
          return true;
        });
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
export const selectCustomSaleWithId = (id: string) => {
  return (state: RootState) => {
    if (!id) return null;
    let customSale: any = null;
    state.customSales.customSales.forEach((s) => {
      const indx = s.data.findIndex((f) => f.id === id);
      if (indx !== -1) customSale = s.data[indx];
    });
    return customSale;
  };
};
export const selectLastUpdated = (state: RootState) =>
  state.customSales.lastUpdate;
export default slice.reducer;
