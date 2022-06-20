import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import {
  addCustomerApi,
  deleteCustomersApi,
  getCustomersApi,
} from "./customersApi";

export type customerType = {
  uid: string;
  username: string;
  phoneNumber: string;
  email: string;
};

interface state {
  customers: {
    data: customerType[];
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
  customers: [{ data: [], page: 1, lastUpdate: 0 }],
  lastUpdate: {
    nanoseconds: 0,
    seconds: 0,
  },
  lastDoc: null,
  lastPage: 1,
};

export const getCustomers = createAsyncThunk(
  "customers/get",
  async (
    { page, lastUpdate }: { page: number; lastUpdate: number },
    thunkAPI
  ) => {
    const state = thunkAPI.getState() as RootState;
    const cIndx = state.customers.customers.findIndex((c) => c.page === page);
    if (cIndx === -1) {
      const lastDoc = state.customers.lastDoc;
      const res = await getCustomersApi(page, lastDoc, lastUpdate);
      return res;
    } else {
      const isUpdated =
        state.customers.customers[cIndx]?.lastUpdate < lastUpdate;

      if (isUpdated) {
        const lastDoc = state.customers.lastDoc;
        const res = await getCustomersApi(page, lastDoc, lastUpdate);
        return res;
      } else {
        return {
          data: state.customers.customers[cIndx].data,
          page: state.customers.customers[cIndx].page,
        };
      }
    }
  }
);

export const deleteCustomers = createAsyncThunk(
  "customers/delete",
  async (uids: string[]) => {
    const res = await deleteCustomersApi(uids);
    return res;
  }
);

export const addCustomer = createAsyncThunk(
  "customers/add",
  async (data: Partial<customerType>) => {
    const res = await addCustomerApi(data);
    return res;
  }
);

const slice = createSlice({
  name: "customers",
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
      .addCase(getCustomers.fulfilled, (state, action: any) => {
        const cIndex = state.customers.findIndex(
          (c) => c.page === action.payload.page
        );
        console.log("last update ==========> ", action.payload.lastUpdate);
        const item = {
          data: action.payload.data,
          page: action.payload.page,
          lastUpdate: action.payload.lastUpdate,
        };
        if (cIndex !== -1) state.customers[cIndex] = item;
        else state.customers.push(item);
        const lastPageNumber = state.customers[state.customers.length - 1].page;
        if (action.payload.lastDoc && lastPageNumber <= action.payload.page)
          state.lastDoc = action.payload.lastDoc;
      })
      .addCase(
        deleteCustomers.fulfilled,
        (state, action: PayloadAction<string[]>) => {
          state.customers.forEach((adm, indx) => {
            state.customers[indx].data = adm.data.filter((d) => {
              return !action.payload.includes(d.uid);
            });
          });
        }
      )
      .addCase(addCustomer.fulfilled, (state, action: any) => {
        if (!action.payload) return;
        state.customers[0].data = [...state.customers[0].data, action.payload];
      });
  },
});

export const { setLastUpdate } = slice.actions;

export const selectCustomers = (page: number) => {
  return (state: RootState) => {
    const cIndx = state.customers.customers.findIndex((c) => c.page === page);
    if (cIndx !== -1) return state.customers.customers[cIndx].data;
    else return state.customers.customers[0].data;
  };
};

export const selectLastUpdated = (state: RootState) =>
  state.customers.lastUpdate;
export default slice.reducer;
