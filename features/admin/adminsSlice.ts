import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { memberFormItems } from "../../pages/addMember";
import { RootState } from "../store";
import {
  addAdminApi,
  deleteAdminsApi,
  editAdminApi,
  getAdminsApi,
} from "./adminsApi";

export type userType = {
  uid: string;
  username: string;
  phoneNumber: string;
  email: string;
  disabled: boolean;
};

interface state {
  adminMembers: userType[];
  lastUpdate: number;
}

const initialState: state = {
  adminMembers: [],
  lastUpdate: 0,
};

export const getAdmins = createAsyncThunk(
  "users/getAdmins",
  async (
    { page, lastUpdate }: { page: number; lastUpdate: number },
    thunkAPI
  ) => {
    const state = thunkAPI.getState() as RootState;
    const sLastUpdate = state.users.lastUpdate;
    console.log(lastUpdate, sLastUpdate);
    console.log(lastUpdate, sLastUpdate);
    if (
      sLastUpdate < lastUpdate ||
      lastUpdate === 0 ||
      !lastUpdate ||
      !sLastUpdate
    ) {
      const res = await getAdminsApi(page, lastUpdate);
      return res;
    } else {
      return null;
    }
  }
);

export const editAdmin = createAsyncThunk(
  "users/editAdmin",
  async ({
    uid,
    data,
  }: {
    uid: string;
    data: { username: string; email: string; phoneNumber: string };
  }) => {
    const res = await editAdminApi(uid, data);
    return res;
  }
);

export const addAdmin = createAsyncThunk(
  "users/addAdmin",
  async (data: memberFormItems) => {
    const res = await addAdminApi(data);
    return res;
  }
);

export const deleteAdmins = createAsyncThunk(
  "users/deleteAdmins",
  async (uids: string[]) => {
    console.log(uids);
    const res = await deleteAdminsApi(uids);
    return res;
  }
);

export const slice = createSlice({
  name: "users",
  initialState,
  reducers: {
    addAdmins: (state, action: PayloadAction<userType[]>) => {
      const newUsers: userType[] = [];
      action.payload.forEach((newUser) => {
        const indx = state.adminMembers.findIndex((u) => u.uid === newUser.uid);
        if (indx === -1) newUsers.push(newUser);
      });
      state.adminMembers = [...state.adminMembers, ...newUsers];
    },
    setAdminsLastUpdate: (state, action: PayloadAction<number>) => {
      state.lastUpdate = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addAdmin.fulfilled, (state, action: any) => {
        state.adminMembers.unshift(action.payload);
      })
      .addCase(getAdmins.fulfilled, (state, action: any) => {
        if (!action.payload) return;
        console.log("payload ==========> ", action.payload);
        state.lastUpdate = action.payload?.lastUpdate || 0;
        state.adminMembers = action.payload?.data || [];
      })
      .addCase(
        editAdmin.fulfilled,
        (
          state,
          action: PayloadAction<{
            uid: string;
            data: { username: string; email: string; phoneNumber: string };
          } | null>
        ) => {
          if (action.payload) {
            const indx = state.adminMembers.findIndex(
              (adm) => adm.uid === action.payload?.uid
            );
            if (indx !== -1) {
              const newData = {
                ...state.adminMembers[indx],
                ...action.payload.data,
              };
              state.adminMembers.filter((s) => s.uid !== action.payload?.uid);
              state.adminMembers.unshift(newData);
            }
          }
        }
      )
      .addCase(
        deleteAdmins.fulfilled,
        (state, action: PayloadAction<string[]>) => {
          state.adminMembers = state.adminMembers.filter((adm) => {
            return !action.payload.includes(adm.uid);
          });
        }
      );
  },
});

export const { addAdmins, setAdminsLastUpdate } = slice.actions;

export const selectAdmins = (state: RootState) => state.users.adminMembers;
export const selectAdminWithId = (id: string) => {
  return (state: RootState) => {
    if (!id) return null;
    const admin = state.users.adminMembers.find((u) => u.uid === id);
    return admin;
  };
};

export default slice.reducer;
