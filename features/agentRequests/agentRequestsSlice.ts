import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import {
  deleteAgentRequestsApi,
  getAgentRequestsApi,
  setAgentRequestsAsViewedApi,
} from "./agentRequestsApi";

export type requestType = {
  uid: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  viewed?: boolean;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
};

interface state {
  requests: {
    data: requestType[];
    page: number;
    lastUpdate: number;
  }[];
  lastUpdate: {
    nanoseconds: number;
    seconds: number;
  };
  newRequestsCount: number;
  lastDoc: Document | null;
  lastPage: number;
}

const initialState: state = {
  requests: [{ data: [], page: 1, lastUpdate: 0 }],
  lastUpdate: {
    nanoseconds: 0,
    seconds: 0,
  },
  newRequestsCount: 0,
  lastDoc: null,
  lastPage: 1,
};

export const getAgentRequests = createAsyncThunk(
  "agentRequests/get",
  async (
    { page, lastUpdate }: { page: number; lastUpdate: number },
    thunkAPI
  ) => {
    const state = thunkAPI.getState() as RootState;
    const cIndx = state.agentRequests.requests.findIndex(
      (r) => r.page === page
    );
    if (cIndx === -1) {
      const lastDoc = state.agentRequests.lastDoc;
      const res = await getAgentRequestsApi(page, lastDoc, lastUpdate);
      return res;
    } else {
      const isUpdated =
        state.agentRequests.requests[cIndx]?.lastUpdate < lastUpdate ||
        !lastUpdate ||
        !state.agentRequests.requests[cIndx].lastUpdate;

      console.log("is updated ===================> ", isUpdated);
      if (isUpdated) {
        const lastDoc = state.agentRequests.lastDoc;
        const res = await getAgentRequestsApi(page, lastDoc, lastUpdate);
        return res;
      } else {
        return {
          data: state.agentRequests.requests[cIndx].data,
          page: state.agentRequests.requests[cIndx].page,
        };
      }
    }
  }
);

export const deleteAgentRequests = createAsyncThunk(
  "agentRequests/delete",
  async (ids: string[]) => {
    const res = await deleteAgentRequestsApi(ids);
    return res;
  }
);

export const setAgentRequestsAsViewed = createAsyncThunk(
  "agentRequests/setViewed",
  async (uids: string[]) => {
    const res = await setAgentRequestsAsViewedApi(uids);
    return res;
  }
);

const slice = createSlice({
  name: "agentRequests",
  initialState,
  reducers: {
    setLastUpdate: (
      state,
      action: PayloadAction<{ seconds: number; nanoseconds: number }>
    ) => {
      state.lastUpdate = action.payload;
    },
    addAgentRequests: (state, action: PayloadAction<requestType[]>) => {
      for (const request of action.payload) {
        console.log("req ============> ", request);
        const rIndx = state.requests[0].data.findIndex(
          (r) => r.uid == request.uid
        );
        if (rIndx === -1) state.requests[0].data.unshift(request);
      }
    },
    deleteAgentRequest: (state, action: PayloadAction<string>) => {
      state.requests.forEach((r, indx) => {
        state.requests[indx].data = r.data.filter(
          (d) => d.uid !== action.payload
        );
      });
    },
    setNewRequestsCount: (state, action: PayloadAction<number>) => {
      state.newRequestsCount = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAgentRequests.fulfilled, (state, action: any) => {
        const cIndex = state.requests.findIndex(
          (r) => r.page === action.payload.page
        );
        console.log("last update ==========> ", action.payload.lastUpdate);
        const item = {
          data: action.payload.data,
          page: action.payload.page,
          lastUpdate: action.payload.lastUpdate || 0,
        };
        if (cIndex !== -1) state.requests[cIndex] = item;
        else state.requests.push(item);
        const lastPageNumber = state.requests[state.requests.length - 1].page;
        if (action.payload.lastDoc && lastPageNumber <= action.payload.page)
          state.lastDoc = action.payload.lastDoc;
      })
      .addCase(
        deleteAgentRequests.fulfilled,
        (state, action: PayloadAction<string[]>) => {
          state.requests.forEach((r, indx) => {
            state.requests[indx].data = r.data.filter((d) => {
              return !action.payload.includes(d.uid);
            });
          });
        }
      )
      .addCase(
        setAgentRequestsAsViewed.fulfilled,
        (state, action: PayloadAction<string[]>) => {
          state.requests.forEach((r, indx) => {
            state.requests[indx].data = r.data.map((d) => ({
              ...d,
              viewed: action.payload.includes(d.uid),
            }));
          });
        }
      );
  },
});

export const {
  setLastUpdate,
  addAgentRequests,
  deleteAgentRequest,
  setNewRequestsCount,
} = slice.actions;

export const selectAllAgentRequests = (state: RootState) =>
  state.agentRequests.requests;

export const selectAgentRequests = (page: number) => {
  return (state: RootState) => {
    const cIndx = state.agentRequests.requests.findIndex(
      (c) => c.page === page
    );
    if (cIndx !== -1) return state.agentRequests.requests[cIndx].data;
    else return state.agentRequests.requests[0].data;
  };
};

export const selectNewAgentRequestsCount = (state: RootState) =>
  state.agentRequests.newRequestsCount;

export const selectLastUpdated = (state: RootState) =>
  state.agentRequests.lastUpdate;
export default slice.reducer;
