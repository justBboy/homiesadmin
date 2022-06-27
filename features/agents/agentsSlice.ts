import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { deleteAgentsApi, getAgentsApi } from "./agentsApi";

export type agentType = {
  uid: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  sales?: number;
  profits?: number;
  orders?: number;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
};

interface state {
  agents: {
    data: agentType[];
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
  agents: [{ data: [], page: 1, lastUpdate: 0 }],
  lastUpdate: {
    nanoseconds: 0,
    seconds: 0,
  },
  lastDoc: null,
  lastPage: 1,
};

export const getAgents = createAsyncThunk(
  "agents/get",
  async (
    { page, lastUpdate }: { page: number; lastUpdate: number },
    thunkAPI
  ) => {
    const state = thunkAPI.getState() as RootState;
    const cIndx = state.agents.agents.findIndex((r) => r.page === page);
    if (cIndx === -1) {
      const lastDoc = state.agents.lastDoc;
      const res = await getAgentsApi(page, lastDoc, lastUpdate);
      return res;
    } else {
      console.log(state.agents);
      const isUpdated =
        state.agents.agents[cIndx]?.lastUpdate < lastUpdate ||
        lastUpdate === 0 ||
        !lastUpdate ||
        !state.agents.agents[cIndx].lastUpdate;
      console.log(
        "is updated ===============> ",
        isUpdated,
        "last Update saved ",
        state.agents.agents[cIndx].lastUpdate,
        "last Update online ",
        lastUpdate
      );
      if (isUpdated) {
        const lastDoc = state.agents.lastDoc;
        const res = await getAgentsApi(page, lastDoc, lastUpdate);
        return res;
      } else {
        return {
          data: state.agents.agents[cIndx].data,
          page: state.agents.agents[cIndx].page,
        };
      }
    }
  }
);

export const deleteAgents = createAsyncThunk(
  "agents/delete",
  async (ids: string[]) => {
    console.log("ids ============> ", ids);
    const res = await deleteAgentsApi(ids);
    return res;
  }
);

// export const addAgent = createAsyncThunk(
//     "agents/add",
//     async (data: Partial<agentType>) => {
//         const res = await addAgentApi(data);
//         return res;
//     }
// )

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
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAgents.fulfilled, (state, action: any) => {
        const cIndex = state.agents.findIndex(
          (r) => r.page === action.payload.page
        );
        console.log("last update ==========> ", action.payload.lastUpdate);
        const item = {
          data: action.payload.data,
          page: action.payload.page,
          lastUpdate: action.payload.lastUpdate || 0,
        };
        if (cIndex !== -1) state.agents[cIndex] = item;
        else state.agents.push(item);
        const lastPageNumber = state.agents[state.agents.length - 1].page;
        if (action.payload.lastDoc && lastPageNumber <= action.payload.page)
          state.lastDoc = action.payload.lastDoc;
      })
      .addCase(
        deleteAgents.fulfilled,
        (state, action: PayloadAction<string[]>) => {
          state.agents.forEach((r, indx) => {
            state.agents[indx].data = r.data.filter((d) => {
              return !action.payload.includes(d.uid);
            });
          });
        }
      );
    //   .addCase(addAgent.fulfilled, (state, action: PayloadAction<any>) => {
    //     if (!action.payload) return;
    //     state.agents[0].data = [...state.agents[0].data, action.payload];
    //   });
  },
});

export const { setLastUpdate } = slice.actions;

export const selectAgents = (page: number) => {
  return (state: RootState) => {
    const cIndx = state.agents.agents.findIndex((c) => c.page === page);
    if (cIndx !== -1) return state.agents.agents[cIndx].data;
    else return state.agents.agents[0].data;
  };
};

export const selectLastUpdated = (state: RootState) => state.agents.lastUpdate;
export default slice.reducer;
