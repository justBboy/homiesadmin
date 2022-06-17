import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { getUserWithToken, setPasswordApi } from "./authApi";

export type emailedUserType = {
  username: string | null;
  phone: string | null;
  email: string | null;
  disabled: boolean;
  loggedIn: boolean;
};

interface state {
  emailedUser: emailedUserType | null;
}

const initialState: state = {
  emailedUser: null,
};

type userLoginData = {
  email: string;
  password: string;
};

export const getUserWithEmailToken = createAsyncThunk(
  "auth/getUserWithEmailToken",
  async (token: string) => {
    const res = await getUserWithToken(token);
    return res;
  }
);

export const setPassword = createAsyncThunk(
  "auth/setPassword",
  async ({ token, password }: { token: string; password: string }) => {
    const res = await setPasswordApi(token, password);
  }
);

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setEmailedUser: (state, action: PayloadAction<emailedUserType | null>) => {
      state.emailedUser = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(
        getUserWithEmailToken.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.emailedUser = { ...action.payload, loggedIn: false };
        }
      )
      .addCase(setPassword.fulfilled, (state, action: any) => {
        if (state.emailedUser) {
          state.emailedUser.disabled = action.payload;
        }
      });
  },
});

export const { setEmailedUser } = slice.actions;

export const selectEmailedUser = (state: RootState) => state.auth.emailedUser;

export default slice.reducer;
