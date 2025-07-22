// store/slices/xmtpSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Client } from "@xmtp/browser-sdk";
import type { AccountData } from "@/utils/getLensProfile";
import { set } from "zod";

interface XMTPState {
  client?: Client;
  initializing: boolean;
  error: Error | null;
  activeUser: AccountData | "invalid" | null;
}

const initialState: XMTPState = {
  client: undefined,
  initializing: false,
  error: null,
  activeUser: null,
};

export const xmtpSlice = createSlice({
  name: "xmtp",
  initialState,
  reducers: {
    setInitializing: (state, action: PayloadAction<boolean>) => {
      state.initializing = action.payload;
    },
    setError: (state, action: PayloadAction<Error | null>) => {
      state.error = action.payload;
    },
    setActiveUser: (state, action: PayloadAction<AccountData | "invalid" | null>) => {
      state.activeUser = action.payload;
    },
  },
});

export const { setInitializing, setError, setActiveUser } = xmtpSlice.actions;

export default xmtpSlice.reducer;
