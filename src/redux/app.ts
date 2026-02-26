import { createSlice } from "@reduxjs/toolkit";
import { AccountData } from "@/utils/getLensProfile";

interface AppState {
  loginModal: boolean;
  switchModal: boolean;
  loginIntent: "login" | "signup";
  user: AccountData | undefined;
}

const initialState: AppState = {
  loginModal: false,
  switchModal: false,
  loginIntent: "login",
  user: undefined,
};

interface Display {
  payload: {
    display: boolean;
  };
}

interface SetProfile {
  payload: {
    profile: AccountData;
  };
}

interface SetLoginIntent {
  payload: {
    intent: "login" | "signup";
  };
}

export const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    displayLoginModal: (state: any, action: Display) => {
      state.loginModal = action.payload.display;
    },
    displaySwitchModal: (state: any, action: Display) => {
      state.switchModal = action.payload.display;
    },
    setLoginIntent: (state: any, action: SetLoginIntent) => {
      state.loginIntent = action.payload.intent;
    },
    setLensProfile: (state: any, action: SetProfile) => {
      state.user = action.payload.profile;
    },
    clearLensProfile: (state: any) => {
      state.user = undefined;
    },
  },
});

// Action creators are generated for each case reducer function
export const { displayLoginModal, displaySwitchModal, setLensProfile, clearLensProfile } =
  appSlice.actions;

export const { setLoginIntent } = appSlice.actions;

export default appSlice.reducer;
